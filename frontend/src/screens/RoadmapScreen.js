import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RoadmapScreen() {
  const [goal, setGoal] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSavedRoadmap();
  }, []);

  // 🔹 Load saved roadmap
  const loadSavedRoadmap = async () => {
    const saved = await AsyncStorage.getItem("roadmapTasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  };

  // 🔹 Save roadmap
  const saveRoadmap = async (newTasks) => {
    await AsyncStorage.setItem("roadmapTasks", JSON.stringify(newTasks));
  };

  // 🔹 Generate roadmap
  const generateRoadmap = async () => {
    if (!goal.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("http://10.0.2.2:5000/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: `${goal}. 
          Give only bullet points.
          Keep each point short.
          Add emojis.`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const lines = data.roadmap
          .split("\n")
          .filter((line) => line.trim().length > 0);

        const formattedTasks = lines.map((item, index) => ({
          id: index,
          text: item.replace(/^[-•\d. ]+/, ""),
          completed: false,
        }));

        setTasks(formattedTasks);
        saveRoadmap(formattedTasks);
      }
    } catch (error) {
      console.log("Error:", error);
    }

    setLoading(false);
  };

  // 🔹 Toggle task
  const toggleTask = (id) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );

    setTasks(updated);
    saveRoadmap(updated);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress =
    tasks.length > 0
      ? Math.round((completedCount / tasks.length) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛣️ Learning Roadmap</Text>

      <TextInput
        style={styles.input}
        placeholder="What do you want to learn? 🚀"
        placeholderTextColor="#888"
        value={goal}
        onChangeText={setGoal}
      />

      <TouchableOpacity style={styles.button} onPress={generateRoadmap}>
        <Text style={styles.buttonText}>✨ Generate Roadmap</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 15 }} />
      )}

      {/* Progress Bar */}
      {tasks.length > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            📊 Progress: {progress}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
        </View>
      )}

      <ScrollView style={{ marginTop: 15 }}>
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskItem}
            onPress={() => toggleTask(task.id)}
          >
            <Text style={styles.checkbox}>
              {task.completed ? "✅" : "⬜"}
            </Text>

            <Text
              style={[
                styles.taskText,
                task.completed && styles.completedText,
              ]}
            >
              {task.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    color: "#fff",
  },

  button: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  progressContainer: {
    marginTop: 20,
  },

  progressText: {
    color: "#fff",
    marginBottom: 8,
  },

  progressBar: {
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 10,
  },

  progressFill: {
    height: 10,
    backgroundColor: "#4f46e5",
    borderRadius: 10,
  },

  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  checkbox: {
    fontSize: 18,
    marginRight: 10,
  },

  taskText: {
    color: "#fff",
    flex: 1,
  },

  completedText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
});