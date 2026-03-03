import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import API from "../services/api";
import { saveToken } from "../services/authStorage";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("🎬 SIGNUP SCREEN MOUNTED");

  const handleSignup = async () => {
    console.log("📝 Signup attempt started");
    console.log("👤 Name:", name);
    console.log("📧 Email:", email);

    if (!name || !email || !password) {
      console.log("❌ Validation failed: Missing fields");
      Alert.alert("Error", "All fields required");
      return;
    }

    try {
      setLoading(true);
      console.log("⏳ Sending signup request...");

      const response = await API.post("/auth/signup", {
        name,
        email,
        password,
      });

      console.log("✅ Signup response received:", response.data);
      const { token } = response.data;

      console.log("💾 Saving token...");
      await saveToken(token);
      console.log("✅ Token saved successfully");

      console.log("🔀 Navigating to Dashboard...");
      navigation.replace("Dashboard");

    } catch (error) {
      console.error("❌ SIGNUP ERROR:", error.message);
      console.error("📡 Response data:", error.response?.data);
      Alert.alert(
        "Signup Failed",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        onChangeText={(text) => {
          setName(text);
          console.log("📝 Name updated:", text);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => {
          setEmail(text);
          console.log("📝 Email updated:", text);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={(text) => {
          setPassword(text);
          console.log("📝 Password updated");
        }}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});