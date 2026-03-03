const mongoose = require("mongoose");

console.log("👤 USER MODEL LOADING");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
  },
}, { timestamps: true });

console.log("✅ User schema defined");

const User = mongoose.model("User", userSchema);

console.log("✅ User model created and exported");

module.exports = User;