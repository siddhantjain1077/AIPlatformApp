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
import { askGemini } from "../services/gemini";
import { updateStreak } from "../services/streakService";
import Markdown from "react-native-markdown-display";

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    // Show user message immediately
    setChat((prev) => [...prev, { type: "user", text: userMessage }]);

    setMessage("");
    setLoading(true);

    try {
      const reply = await askGemini(userMessage);

      setChat((prev) => [...prev, { type: "bot", text: reply }]);

      await updateStreak();
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { type: "bot", text: "⚠️ Gemini failed to respond." },
      ]);
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
        style={styles.chatArea}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {chat.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              msg.type === "user"
                ? styles.userBubble
                : styles.botBubble,
            ]}
          >
            {msg.type === "user" ? (
              <Text style={styles.userText}>{msg.text}</Text>
            ) : (
              <Markdown style={markdownStyles}>
                {msg.text}
              </Markdown>
            )}
          </View>
        ))}

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#4f46e5" />
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything..."
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  chatArea: {
    flex: 1,
  },

  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },

  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#4f46e5",
    borderBottomRightRadius: 5,
  },

  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1e293b",
    borderBottomLeftRadius: 5,
  },

  userText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },

  loaderContainer: {
    marginTop: 5,
    marginLeft: 5,
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    backgroundColor: "#0f172a",
  },

  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 25,
    paddingHorizontal: 15,
    color: "#fff",
    fontSize: 15,
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "#4f46e5",
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  sendText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

const markdownStyles = {
  body: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    color: "#ffffff",
    fontSize: 20,
    marginBottom: 8,
  },
  heading2: {
    color: "#ffffff",
    fontSize: 18,
    marginBottom: 6,
  },
  bullet_list: {
    marginVertical: 6,
  },
  code_inline: {
    backgroundColor: "#334155",
    color: "#fff",
    padding: 4,
    borderRadius: 5,
  },
  code_block: {
    backgroundColor: "#111827",
    color: "#fff",
    padding: 10,
    borderRadius: 8,
  },
};