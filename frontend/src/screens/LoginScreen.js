import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import API from "../services/api";
import { saveToken } from "../services/authStorage";


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("🎬 LOGIN SCREEN MOUNTED");

  const handleLogin = async () => {
    console.log("🔐 Login attempt started");
    console.log("📧 Email:", email);

    if (!email || !password) {
      console.log("❌ Validation failed: Missing fields");
      Alert.alert("Error", "All fields required");
      return;
    }

    try {
      setLoading(true);
      console.log("⏳ Sending login request...");

      const response = await API.post("/auth/login", {
        email,
        password,
      });

      console.log("✅ Login response received:", response.data);
      const { token } = response.data;

      console.log("💾 Saving token...");
      await saveToken(token);
      console.log("✅ Token saved successfully");

      console.log("🔀 Navigating to Dashboard...");
      navigation.replace("Dashboard");

    } catch (error) {
      console.error("❌ LOGIN ERROR:", error.message);
      console.error("📡 Response data:", error.response?.data);
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          console.log("📝 Email updated:", text);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          console.log("📝 Password updated");
        }}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {
        console.log("🔀 Navigating to Signup screen");
        navigation.navigate("Signup");
      }}>
        <Text style={styles.link}>Don’t have an account? Sign up</Text>
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
  link: {
    color: "#4f46e5",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});
