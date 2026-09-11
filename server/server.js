const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.json({ message: "UniQuest API is running" });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();

  // Then start listening
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
