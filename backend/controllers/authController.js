const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

console.log("🔐 AUTH CONTROLLER LOADED");

// SIGNUP
exports.signup = async (req, res) => {
  console.log("📝 Signup controller called");
  const { name, email, password } = req.body;
  console.log("👤 Input - Name:", name, "| Email:", email);

  try {
    console.log("🔍 Checking for existing user...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("⚠️ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("💾 Creating user...");
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    console.log("✅ User created with ID:", user._id);

    console.log("🔑 Generating token...");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("📤 Signup successful");
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (error) {
    console.error("❌ Signup error:", error.message);
    res.status(500).json({ message: "Signup failed" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  console.log("🔐 Login controller called");
  const { email, password } = req.body;
  console.log("📧 Login attempt - Email:", email);

  try {
    console.log("🔍 Finding user...");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("✅ User found");

    console.log("🔐 Comparing password...");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password incorrect");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("✅ Password matched");

    console.log("🔑 Generating token...");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("📤 Login successful");
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
};