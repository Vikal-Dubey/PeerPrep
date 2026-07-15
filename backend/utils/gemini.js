import { GoogleGenAI } from "@google/genai";

let aiInstance = null;

// Helper to get client instance at runtime (after dotenv.config() has run)
const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
};

export const GEMINI_MODEL = "gemini-3.1-flash-lite";

// Export a proxy or wrapper so you don't have to change other files
export default new Proxy({}, {
  get: (target, prop) => {
    return getAI()[prop];
  }
});