import AsyncStorage from "@react-native-async-storage/async-storage";

console.log("🔥 STREAK SERVICE INITIALIZED");

// Helper to get today's date (YYYY-MM-DD)
const getToday = () => {
  const today = new Date().toISOString().split("T")[0];
  console.log("📅 Today's date:", today);
  return today;
};

export const updateStreak = async () => {
  console.log("🔥 updateStreak() called");
  
  try {
    const lastDate = await AsyncStorage.getItem("lastLearningDate");
    let streak = Number(await AsyncStorage.getItem("learningStreak")) || 0;

    const today = getToday();
    console.log("📊 Streak Data - Last date:", lastDate, "| Current streak:", streak);

    if (!lastDate) {
      // First time learning
      streak = 1;
      console.log("🎯 First learning day detected - Streak set to: 1");
    } else {
      const diff =
        (new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24);

      console.log("⏰ Days difference:", diff);

      if (diff === 1) {
        streak += 1; // Continue streak
        console.log("✅ Streak continued - New Streak:", streak);
      } else if (diff > 1) {
        streak = 1; // Reset streak
        console.log("🔄 Streak reset (more than 1 day gap) - Streak set to: 1");
      } else if (diff === 0) {
        console.log("⏸️ Same day - No change to streak");
      }
    }

    await AsyncStorage.setItem("learningStreak", streak.toString());
    await AsyncStorage.setItem("lastLearningDate", today);
    console.log("✅ Streak updated and saved:", streak);

    return streak;
  } catch (error) {
    console.error("❌ Streak update error:", error);
    return 0;
  }
};

export const getStreak = async () => {
  console.log("🔥 getStreak() called");
  try {
    const streak = await AsyncStorage.getItem("learningStreak");
    const streakValue = Number(streak) || 0;
    console.log("📊 Retrieved streak value:", streakValue);
    return streakValue;
  } catch (error) {
    console.error("❌ Error retrieving streak:", error);
    return 0;
  }
};