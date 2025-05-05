require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utlilties");

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (req, res) => {
  res.json({ data: "hello" });
});

// Create account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Full name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }
  const isUser = await User.findOne({ email });
  if (isUser) {
    return res
      .status(400)
      .json({ error: true, message: "User already exists" });
  }
  const user = new User({ fullName, email, password });
  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "36000m",
  });
  return res.json({
    error: false,
    user,
    accessToken,
    message: "Registered successfully",
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: true, message: "Email is required" });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Password is required" });
  }

  try {
    const userInfo = await User.findOne({ email, password });
    if (!userInfo) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid credentials" });
    }

    const user = { user: userInfo };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "36000m",
    });

    return res.json({
      error: false,
      message: "Login Successful",
      user: {
        _id: userInfo._id,
        email: userInfo.email,
        fullName: userInfo.fullName,
        createdAt: userInfo.createdAt,
      },
      accessToken,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });

  if (!isUser) {
    return res.status(404).json({ error: true, message: "User not found" });
  }
  return res.json({
    error: false,
    user: {
      fullName: isUser.fullName,
      email: isUser.email,
      _id: isUser._id,
      createdAt: isUser.createdAt,
    },
    message: "User retrieved successfully",
  });
});

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;
  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }
  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });
    await note.save();
    return res.json({ error: false, message: "Note added successfully", note });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

// Edit Note
app.put("/edit-note/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) {
    return res
      .status(400)
      .json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: id, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }
    if (title) {
      note.title = title;
    }
    if (content) {
      note.content = content;
    }
    if (tags) {
      note.tags = tags;
    }
    await note.save();
    return res.json({
      error: false,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

// Get all notes
app.get("/get-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;

  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
    return res.json({
      error: false,
      notes,
      message: "All notes retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

// Delete Note
app.delete("/delete-note/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: id, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }
    await Note.deleteOne({ _id: id, userId: user._id });
    return res.json({ error: false, message: "Note deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

// Pin Note
app.put("/update-note-pinned/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: id, userId: user._id });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }
    note.isPinned = isPinned;
    await note.save();
    return res.json({
      error: false,
      message: "Note pin updated successfully",
      note,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

// Search Note
app.get("/search-note", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: true, message: "Query is required" });
  }

  try {
    const notes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });
    return res.json({
      error: false,
      notes,
      message: "Notes retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal server error" });
  }
});

app.listen(8000);
module.exports = app;
