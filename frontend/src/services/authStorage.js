import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "userToken";

console.log("🔐 AUTH STORAGE INITIALIZED");

export const saveToken = async (token) => {
  try {
    console.log("💾 Saving token to AsyncStorage...");
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log("✅ Token saved successfully");
  } catch (error) {
    console.error("❌ Error saving token:", error);
    throw error;
  }
};

export const getToken = async () => {
  try {
    console.log("🔍 Retrieving token from AsyncStorage...");
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log("✅ Token retrieved:", token ? "EXISTS" : "NOT FOUND");
    return token;
  } catch (error) {
    console.error("❌ Error retrieving token:", error);
    throw error;
  }
};

export const removeToken = async () => {
  try {
    console.log("🗑️ Removing token from AsyncStorage...");
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log("✅ Token removed successfully");
  } catch (error) {
    console.error("❌ Error removing token:", error);
    throw error;
  }
};