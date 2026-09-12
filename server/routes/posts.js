const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const Like = require("../models/Like");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Get posts error:", error.message);
    res.status(500).json({
      message: "Server error"
    });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, description, category, deadline } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description, and category are required"
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const post = new Post({
      title,
      description,
      category,
      deadline: deadline || undefined,
      userId: req.user.userId,
      authorName: user.name
    });

    await post.save();

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error.message);
    res.status(500).json({
      message: "Server error"
    });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only edit your own posts"
      });
    }

    const { title, description, category, deadline } = req.body;

    if (title) {
      post.title = title;
    }

    if (description) {
      post.description = description;
    }

    if (category) {
      post.category = category;
    }

    if (deadline) {
      post.deadline = deadline;
    }

    await post.save();

    res.json(post);
  } catch (error) {
    console.error("Update post error:", error.message);
    res.status(500).json({
      message: error.message
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can only delete your own posts"
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Like.deleteMany({ postId: req.params.id });

    res.json({
      message: "Post deleted successfully"
    });
  } catch (error) {
    console.error("Delete post error:", error.message);
    res.status(500).json({
      message: "Server error"
    });
  }
});

router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const userId = req.user.userId;
    const postId = req.params.id;

    const existingLike = await Like.findOne({
      userId,
      postId
    });

    if (existingLike) {
      await Like.deleteOne({
        userId,
        postId
      });
    } else {
      await Like.create({
        userId,
        postId
      });
    }

    const likeCount = await Like.countDocuments({
      postId
    });

    res.json({
      likedByUser: !existingLike,
      likeCount
    });
  } catch (error) {
    console.error("Like toggle error:", error.message);
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;