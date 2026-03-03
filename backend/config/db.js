const mongoose = require("mongoose");

console.log("🗄️ DATABASE CONFIG LOADED");

const connectDB = async () => {
  console.log("🔗 Initiating MongoDB connection...");
  console.log("📍 Mongo URI:", process.env.MONGO_URI?.substring(0, 30) + "...");

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");
    console.log("📊 Connection state:", mongoose.connection.readyState);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("⚠️ Stack trace:", error.stack);
    process.exit(1);
  }
};

module.exports = connectDB;
