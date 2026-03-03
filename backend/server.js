import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

dotenv.config();

console.log("🚀 SERVER.JS STARTING...");

const app = express();
app.use(cors());
app.use(express.json());

console.log("✅ Middleware initialized");

// =======================
// 🔗 MongoDB Atlas Connect
// =======================
console.log("🔗 Attempting to connect to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas Connected Successfully");
    console.log("📊 Connection state:", mongoose.connection.readyState);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// =======================
// 👤 User Schema
// =======================
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    streak: { type: Number, default: 0 },
    lastActiveDate: Date,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
console.log("📦 User model created");

// =======================
// 🔐 AUTH ROUTES
// =======================

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  console.log("📝 SIGNUP REQUEST received");
  const { name, email, password } = req.body;
  console.log("👤 Signup data - Name:", name, "| Email:", email);

  try {
    console.log("🔍 Checking if user already exists...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("💾 Creating new user in database...");
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("✅ User created with ID:", user._id);

    console.log("🔑 Generating JWT token...");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log("✅ Token generated");

    console.log("📤 Sending success response...");
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  console.log("🔐 LOGIN REQUEST received");
  const { email, password } = req.body;
  console.log("📧 Login attempt - Email:", email);

  try {
    console.log("🔍 Finding user in database...");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("✅ User found:", user._id);

    console.log("🔐 Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for user:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("✅ Password matched");

    console.log("🔑 Generating JWT token...");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("📤 Sending success response...");
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Login failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🎉 Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  console.log("🚀 Ready to handle requests!\n");
});

// =======================
// 🤖 AI CHAT (Gemini)
// =======================
app.post("/api/ask-ai", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "Prompt required" });

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ reply });
  } catch (error) {
    res.status(500).json({
      message: "AI failed to respond",
      error: error.response?.data || error.message,
    });
  }
});

// =======================
// 🛣️ ROADMAP GENERATOR
// =======================
app.post("/api/roadmap", async (req, res) => {
  const { goal } = req.body;
  if (!goal) return res.status(400).json({ message: "Goal required" });

  const prompt = `
Create a 4-week beginner-friendly learning roadmap for:
"${goal}"

Rules:
- Simple language
- Week-wise
- Topics + practice
- Plain text only
`;

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.GEMINI_API_KEY,
        },
      }
    );

    const roadmap =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ roadmap });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate roadmap" });
  }
});

