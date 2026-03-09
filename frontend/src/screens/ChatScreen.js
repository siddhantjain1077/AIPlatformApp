import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated
} from "react-native";

import Clipboard from "@react-native-clipboard/clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { askGemini } from "../services/gemini";
import { updateStreak } from "../services/streakService";

import Markdown from "react-native-markdown-display";
import TypingIndicator from "../components/TypeIndicator";

export default function ChatScreen() {

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stopGeneration, setStopGeneration] = useState(false);
  const [abortController, setAbortController] = useState(null);

  const scrollRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(30)).current;

  /* ------------------------------
     Load Saved Chat
  ------------------------------ */

  useEffect(() => {
    const loadChat = async () => {
      const stored = await AsyncStorage.getItem("chatHistory");
      if (stored) setChat(JSON.parse(stored));
    };
    loadChat();
  }, []);

  /* ------------------------------
     Save Chat
  ------------------------------ */

  const saveChat = async (data) => {
    await AsyncStorage.setItem("chatHistory", JSON.stringify(data));
  };

  /* ------------------------------
     Animate Messages
  ------------------------------ */

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [chat]);

  /* ------------------------------
     Streaming AI Response
  ------------------------------ */

  const streamResponse = async (text, callback) => {

    let displayed = "";

    for (let i = 0; i < text.length; i++) {

      if (stopGeneration) break;

      displayed += text[i];

      callback(displayed);

      await new Promise((resolve) => setTimeout(resolve, 12));
    }
  };

  /* ------------------------------
     Stop AI Reply
  ------------------------------ */

  const stopReply = () => {
    setStopGeneration(true);
    if (abortController) {
      abortController.abort();
    }
    setLoading(false);
  };

  /* ------------------------------
     Clear Chat
  ------------------------------ */

  const clearChat = () => {

    Alert.alert(
      "Clear Chat",
      "Delete all messages?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            setChat([]);
            await AsyncStorage.removeItem("chatHistory");
          }
        }
      ]
    );
  };

  /* ------------------------------
     Send Message
  ------------------------------ */

  const sendMessage = async () => {

    if (!message.trim()) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    const userMessage = {
      type: "user",
      text: message,
      time
    };

    const updatedChat = [...chat, userMessage];

    setChat(updatedChat);
    saveChat(updatedChat);

    setMessage("");
    setLoading(true);
    setStopGeneration(false);

    const controller = new AbortController();
    setAbortController(controller);

    try {

      let reply = await askGemini(message, controller.signal);

      if (typeof reply !== "string") {
        reply = JSON.stringify(reply);
      }

      const botIndex = updatedChat.length;

      setChat((prev) => [
        ...prev,
        { type: "bot", text: "", time }
      ]);

      await streamResponse(reply, (partial) => {

        setChat((prev) => {

          const updated = [...prev];

          updated[botIndex] = {
            type: "bot",
            text: partial,
            time
          };

          return updated;
        });

      });

      await updateStreak();

      saveChat([...updatedChat, { type: "bot", text: reply, time }]);

    } catch (error) {

      if (error.name === 'AbortError') {
        console.log("🛑 AI response aborted by user");
        // Optionally, add a message to chat or just stop
        const abortMsg = {
          type: "bot",
          text: "Response stopped.",
          time
        };
        const finalChat = [...updatedChat, abortMsg];
        setChat(finalChat);
        saveChat(finalChat);
      } else {
        const errorMsg = {
          type: "bot",
          text: "⚠️ Gemini failed to respond.",
          time
        };

        const finalChat = [...updatedChat, errorMsg];

        setChat(finalChat);
        saveChat(finalChat);
      }
    }

    setLoading(false);
    setAbortController(null);
  };

  /* ------------------------------
     Delete Message
  ------------------------------ */

  const deleteMessage = (index) => {

    const updated = [...chat];

    updated.splice(index, 1);

    setChat(updated);
    saveChat(updated);
  };

  /* ------------------------------
     Regenerate Message
  ------------------------------ */

  const regenerateMessage = async (index) => {

    const userMsg = chat[index - 1];

    if (!userMsg || userMsg.type !== "user") return;

    setLoading(true);

    const reply = await askGemini(userMsg.text);

    const updated = [...chat];

    updated[index] = {
      type: "bot",
      text: reply,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setChat(updated);
    saveChat(updated);

    setLoading(false);
  };

  /* ------------------------------
     Long Press Menu
  ------------------------------ */

  const handleLongPress = (msg, index) => {

    Alert.alert(
      "Message Options",
      "Choose an action",
      [
        { text: "Copy", onPress: () => Clipboard.setString(msg.text) },
        { text: "Regenerate", onPress: () => regenerateMessage(index) },
        { text: "Delete", onPress: () => deleteMessage(index) },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  /* ------------------------------
     UI
  ------------------------------ */

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI Chat</Text>

        <TouchableOpacity onPress={clearChat}>
          <Text style={styles.clearButton}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={{ padding: 15 }}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >

        {chat.map((msg, index) => (

          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onLongPress={() => handleLongPress(msg, index)}
          >

            <Animated.View
              style={[
                styles.messageBubble,
                msg.type === "user"
                  ? styles.userBubble
                  : styles.botBubble,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >

              {msg.type === "bot" && (
                <View style={styles.botHeader}>
                  <Icon name="robot" size={18} color="#60a5fa" />
                  <Text style={styles.botLabel}>AI</Text>
                </View>
              )}

              {msg.type === "user" ? (
                <Text style={styles.userText}>{msg.text}</Text>
              ) : (
                <Markdown style={markdownStyles}>
                  {typeof msg.text === "string" ? msg.text : ""}
                </Markdown>
              )}

              <Text style={styles.timeText}>{msg.time}</Text>

            </Animated.View>

          </TouchableOpacity>
        ))}

        {loading && (
          <View style={styles.botBubble}>
            <TypingIndicator />
          </View>
        )}

      </ScrollView>

      {/* Input */}

      <View style={styles.inputContainer}>

        <TextInput
          style={styles.input}
          placeholder="Ask anything..."
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
          editable={!loading}
        />

        {loading ? (

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: "#ef4444" }]}
            onPress={stopReply}
          >
            <Text style={styles.sendText}>■</Text>
          </TouchableOpacity>

        ) : (

          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>

        )}

      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#020617",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b"
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 25,
  },

  clearButton: {
    color: "#ef4444",
    fontWeight: "bold",
    marginTop: 25,
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

  botHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  botLabel: {
    color: "#60a5fa",
    marginLeft: 6,
    fontSize: 12,
  },

  userText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },

  timeText: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 4,
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
  body: { color: "#fff", fontSize: 15, lineHeight: 22 },
  heading1: { color: "#fff", fontSize: 20, marginBottom: 8 },
  heading2: { color: "#fff", fontSize: 18, marginBottom: 6 },
  bullet_list: { marginVertical: 6 },
  code_inline: { backgroundColor: "#334155", color: "#fff", padding: 4, borderRadius: 5 },
  code_block: { backgroundColor: "#111827", color: "#fff", padding: 10, borderRadius: 8 }
};