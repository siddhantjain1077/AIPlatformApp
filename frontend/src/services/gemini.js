const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

console.log("🤖 GEMINI SERVICE INITIALIZED");

export const askGemini = async (prompt) => {
  console.log("🔄 askGemini called with prompt:", prompt.substring(0, 50) + "...");

  try {
    console.log("⏳ Sending request to Gemini API...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    console.log("📡 Response received. Status:", response.status);
    const data = await response.json();

    console.log("🔥 GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));

    // If API returned error
    if (data.error) {
      console.error("❌ Gemini API Error:", data.error);
      return "Gemini API error occurred.";
    }

    // Safe extraction
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.warn("⚠️ No text found in Gemini response");
      return "AI didn't return a readable response.";
    }

    console.log("✅ Successfully extracted text from Gemini");
    return text;

  } catch (error) {
    console.error("❌ Gemini Network Error:", error);
    console.error("📡 Error details:", error.message);
    return "Error connecting to AI.";
  }
};