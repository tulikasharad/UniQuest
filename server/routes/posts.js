const express = require("express");
const Post = require("../models/Post");
const Like = require("../models/Like");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/posts
 * Get all posts. Public endpoint.
 * Supports query params: ?category=event&search=hackathon
 * Returns posts with likeCount. If a valid JWT is provided,
 * also returns likedByUser for each post.
 */
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    // Filter by category
    if (category && category !== "all") {
      filter.category = category;
    }

    // Search by title or description (case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get posts sorted by newest first
    const posts = await Post.find(filter).sort({ createdAt: -1 });

    // Count likes for each post
    const postIds = posts.map((p) => p._id);
    const likeCounts = await Like.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]);

    // Build a map of postId -> like count
    const likeCountMap = {};
    likeCounts.forEach((item) => {
      likeCountMap[item._id.toString()] = item.count;
    });

    // If user is logged in, check which posts they liked
    let likedPostIds = new Set();

    // Try to extract user ID from optional Authorization header
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const userLikes = await Like.find({
          userId,
          postId: { $in: postIds },
        });
        userLikes.forEach((like) => {
          likedPostIds.add(like.postId.toString());
        });
      } catch {
        // Token invalid or expired — just return posts without likedByUser
      }
    }

    // Attach like info to each post
    const postsWithLikes = posts.map((post) => ({
      ...post.toObject(),
      likeCount: likeCountMap[post._id.toString()] || 0,
      likedByUser: likedPostIds.has(post._id.toString()),
    }));

    res.json(postsWithLikes);
  } catch (error) {
    console.error("Get posts error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/posts
 * Create a new post. Protected — requires JWT token.
 */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    // Basic validation
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // Create post using user info from JWT token
    const post = new Post({
      title,
      description,
      category: category || "other",
      userId: req.user.userId,
      authorName: req.user.name,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * PUT /api/posts/:id
 * Update a post. Protected — only the owner can edit.
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only the owner can edit their post
    if (post.userId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own posts" });
    }

    const { title, description, category } = req.body;
    if (title) post.title = title;
    if (description) post.description = description;
    if (category) post.category = category;

    await post.save();
    res.json(post);
  } catch (error) {
    console.error("Update post error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/posts/:id
 * Delete a post. Protected — only the owner can delete.
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only the owner can delete their post
    if (post.userId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(req.params.id);

    // Also remove all likes for this post
    await Like.deleteMany({ postId: req.params.id });

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/posts/:id/like
 * Toggle like on a post. Protected.
 * If the user already liked it, unlike it.
 * If the user hasn't liked it, like it.
 */
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.userId;
    const postId = req.params.id;

    // Check if user already liked this post
    const existingLike = await Like.findOne({ userId, postId });

    if (existingLike) {
      // Unlike — remove the like
      await Like.deleteOne({ userId, postId });
    } else {
      // Like — create a new like
      try {
        const like = new Like({ userId, postId });
        await like.save();
      } catch (err) {
        // Duplicate key error means they already liked it (race condition)
        if (err.code === 11000) {
          await Like.deleteOne({ userId, postId });
        } else {
          throw err;
        }
      }
    }

    // Get updated like count
    const likeCount = await Like.countDocuments({ postId });

    res.json({
      likedByUser: !existingLike,
      likeCount,
    });
  } catch (error) {
    console.error("Like toggle error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
