const express = require("express");
const { signup, login } = require("../controllers/authController");

console.log("📍 AUTH ROUTES INITIALIZED");

const router = express.Router();

router.post("/signup", (req, res, next) => {
  console.log("🔀 /signup route hit");
  signup(req, res, next);
});

router.post("/login", (req, res, next) => {
  console.log("🔀 /login route hit");
  login(req, res, next);
});

console.log("✅ Auth routes defined");

module.exports = router;