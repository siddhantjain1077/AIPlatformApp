import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { removeToken } from "../services/authStorage";
import { useEffect, useState } from "react";
import { getStreak } from "../services/streakService";

export default function DashboardScreen({ navigation }) {
  const [streak, setStreak] = useState(0);

  console.log("🎬 DASHBOARD SCREEN MOUNTED");

  useEffect(() => {
    console.log("⏳ Dashboard: Loading streak...");
    const loadStreak = async () => {
      try {
        const currentStreak = await getStreak();
        console.log("🔥 Streak loaded:", currentStreak);
        setStreak(currentStreak);
      } catch (error) {
        console.error("❌ Error loading streak:", error);
      }
    };
    loadStreak();
  }, []);

  const handleLogout = async () => {
    console.log("🚪 Logout initiated...");
    try {
      console.log("🗑️ Removing token from storage...");
      await removeToken();
      console.log("✅ Token removed, navigating to Login...");
      navigation.replace("Login");
    } catch (error) {
      console.error("❌ Logout error:", error);
      Alert.alert("Error", "Failed to logout");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 AI Learning Dashboard</Text>

      {/* AI Chat */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          console.log("🔀 Navigating to Chat screen");
          navigation.navigate("Chat");
        }}
      >
        <Text style={styles.cardTitle}>🤖 AI Chat</Text>
        <Text style={styles.cardText}>
          Ask questions & learn with AI
        </Text>
      </TouchableOpacity>

      {/* Roadmap */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          console.log("🔀 Navigating to Roadmap screen");
          navigation.navigate("Roadmap");
        }}
      >
        <Text style={styles.cardTitle}>🛣️ Learning Roadmap</Text>
        <Text style={styles.cardText}>
          Personalized learning path
        </Text>
      </TouchableOpacity>

      {/* Streak */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Learning Streak</Text>
        <Text style={styles.cardText}>
          Current Streak: {streak} days
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardText: {
    color: "#555",
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
