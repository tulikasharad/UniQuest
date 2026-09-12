const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET /api/posts
 * Get all posts. Public endpoint.
 * Supports query params: ?category=events&search=hackathon
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
    res.json(posts);
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
      category: category || "general",
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
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
