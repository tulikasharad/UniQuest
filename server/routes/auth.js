const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new student account.
 * Returns a JWT token and the user object (without password).
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists" });
    }

    // Create new user (password is hashed automatically by the model)
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/auth/login
 * Log in an existing student.
 * Returns a JWT token and the user object (without password).
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare entered password with stored hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
