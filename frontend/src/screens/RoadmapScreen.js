import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Markdown from "react-native-markdown-display";

export default function RoadmapScreen() {
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  const generateRoadmap = async () => {
    if (!goal.trim()) return;

    setLoading(true);
    setRoadmap("");

    try {
      const response = await fetch("http://10.0.2.2:5000/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: `${goal}. 
          
          Create a clear step-by-step roadmap.
          Use headings, bullet points, and short explanations.
          Add relevant emojis wherever necessary to make it engaging.
          Make it visually clean and motivating.`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRoadmap(data.message || "❌ Failed to generate roadmap.");
      } else {
        setRoadmap(data.roadmap);
      }
    } catch (error) {
      setRoadmap("⚠️ Network error. Please check backend connection.");
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 20 }}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {/* Title */}
        <Text style={styles.title}>🛣️ Learning Roadmap</Text>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder="What do you want to learn? 🚀"
          placeholderTextColor="#888"
          value={goal}
          onChangeText={setGoal}
        />

        {/* Button */}
        <TouchableOpacity style={styles.button} onPress={generateRoadmap}>
          <Text style={styles.buttonText}>✨ Generate Roadmap</Text>
        </TouchableOpacity>

        {/* Loader */}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>
              Generating your personalized roadmap... 🚀
            </Text>
          </View>
        )}

        {/* Roadmap Output */}
        {roadmap ? (
          <View style={styles.roadmapCard}>
            <Markdown style={markdownStyles}>
              {roadmap}
            </Markdown>
          </View>
        ) : (
          !loading && (
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>
                🎯 Your roadmap will appear here...
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 15,
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
    fontSize: 16,
  },

  loaderContainer: {
    marginTop: 20,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#ccc",
  },

  roadmapCard: {
    marginTop: 20,
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 16,
  },

  placeholderCard: {
    marginTop: 20,
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  placeholderText: {
    color: "#aaa",
  },
});
const markdownStyles = {
  body: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 24,
  },

  heading1: {
    color: "#ffffff",
    fontSize: 22,
    marginBottom: 12,
    fontWeight: "bold",
  },

  heading2: {
    color: "#ffffff",
    fontSize: 18,
    marginBottom: 8,
    marginTop: 10,
    fontWeight: "600",
  },

  bullet_list: {
    marginVertical: 6,
  },

  list_item: {
    marginVertical: 4,
  },

  strong: {
    color: "#ffffff",
    fontWeight: "bold",
  },

  // 🔥 Clean inline code (NO background)
  code_inline: {
    color: "#60a5fa",   // soft blue highlight
    fontWeight: "500",
  },

  // 🔥 Remove block styling completely
  code_block: {
    color: "#60a5fa",
  },
};