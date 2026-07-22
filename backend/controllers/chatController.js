import Document          from "../models/Document.js";
import { callGeminiRaw } from "../utils/gemini.js";

export const handleChat = async (req, res) => {
  const { message, persona, fileId } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const activePersona = (persona || "general").toLowerCase();

  try {
    let fileContext = "";
    if (fileId && !fileId.startsWith("default-")) {
      const doc = await Document.findOne({ id: fileId });
      if (doc) {
        fileContext = `You have access to the contents of the uploaded file "${doc.name}":\n\n${doc.extractedText.slice(0, 20000)}\n\n`;
      }
    } else if (fileId === "default-1") {
      fileContext = "You are discussing the file 'sales_report_q2_2026.csv'. The data shows Q2 revenue of $2.84M (+18% Vs last month), pipeline value of $8.2M, 148 deals won, win rate of 72%, forecast accuracy of 96%.\n\n";
    } else if (fileId === "default-2") {
      fileContext = "You are discussing the file 'user_onboarding_strategy.pdf'. The data shows reading time of 8 min, 2450 words, grade 10 complexity, 86% retention index. The document details onboarding strategy and maps how database connection steps cause a 64% drop-off in user signups. Adding setup guides reduces setup time to 12 minutes, which is estimated to increase study-activation actions by 24%.\n\n";
    }

    const systemInstruction = `You are **NexDocIQ AI**, an intelligent chat assistant that explains complex documents and data in simple terms.

CORE RULES:
1. Focus strictly on the active uploaded document/file context provided below. If the user asks something completely unrelated, politely decline.
2. Deliver the response in a structured, ChatGPT-like format. Use headings (e.g., ### Overview), lists, and bold text.
3. Start paragraphs, headers, and bullet points with relevant emojis to make the response visually rich.
4. Separate logical parts into clear paragraph blocks.

You must adopt the requested persona:
- general: Simple, everyday English, no technical jargon. Friendly and accessible.
- student: Use study-related analogies (e.g., classes, semesters, exams, grades, principal).
- shopkeeper: Use store-related analogies (e.g., crates, inventory shelves, retail counter, wholesale orders, balance tabs).
- business: Use professional business terminology (e.g., ARR, conversion, pipeline velocity, enterprise expansions, ROI).

${fileContext}
Answer the user's question contextually based on the file content and active persona. Keep answers concise, helpful, and structured.`;

    const responseText = await callGeminiRaw(message, systemInstruction, false);
    return res.json({ sender: "ai", text: responseText, date: new Date().toISOString() });
  } catch (err) {
    console.error("Gemini chat failed:", err);
    let errorMessage = "Sorry, I could not analyze the document due to an error.";
    if (err.message.includes("401") || err.message.includes("UNAUTHENTICATED") || err.message.includes("API_KEY")) {
      errorMessage = "⚠️ **Action Required**: Your Gemini API Key is invalid or expired. The backend failed to connect to Google's AI service. Please generate a new key starting with `AIzaSy...` at Google AI Studio and update your environment variables!";
    }
    return res.json({ sender: "ai", text: errorMessage, date: new Date().toISOString() });
  }
};
