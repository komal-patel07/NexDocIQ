import { callGeminiRaw } from './backend/utils/gemini.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  try {
    console.log("Testing Gemini API...");
    const response = await callGeminiRaw("Say hello world", "You are a test bot", false);
    console.log("Response:", response);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
