import axios from "axios";

console.log("📡 API.JS INITIALIZING");

const API = axios.create({
  baseURL: "http://10.0.2.2:5000/api", 
  // 10.0.2.2 = localhost for Android emulator
});

console.log("✅ API configured. Base URL:", API.defaults.baseURL);

// Add request interceptor
API.interceptors.request.use(
  (config) => {
    console.log(`📤 API REQUEST: ${config.method.toUpperCase()} ${config.url}`);
    console.log("📦 Request data:", config.data);
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`📥 API RESPONSE: ${response.status} ${response.statusText}`);
    console.log("📦 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.message);
    console.error("📡 Error response:", error.response?.data);
    return Promise.reject(error);
  }
);

export default API;