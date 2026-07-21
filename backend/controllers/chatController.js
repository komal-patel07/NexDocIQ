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
    console.error("Gemini chat failed, falling back to mock:", err);
  }

  // ── Fallback mock responses ─────────────────────────────────────────────────
  const msg = message.toLowerCase();
  let responseText = "";

  if (activePersona === "student") {
    if (msg.includes("forecast") || msg.includes("revenue") || msg.includes("quarter")) {
      responseText = "We are on track to make **$2.6M** next quarter! Think of this as getting 12% more allowance than last quarter. Most of this growth comes from schools upgrading their subscription packages. We are 96% sure of this outcome, which is like scoring an A on a test!";
    } else if (msg.includes("risk") || msg.includes("flagged") || msg.includes("accounts") || msg.includes("anomalies")) {
      responseText = "There are **3 key accounts** flagged as 'at-risk':\n- **Lena Harper** (project delayed)\n- **Sophie Kim** (waiting on their team to reply)\n- **AlphaTech** (their principal manager left)\n\nWe need to reach out to them just like a study partner check-in!";
    } else {
      responseText = "I've analyzed our strategy paper! Reading ease is **optimal (82%)** which makes it very simple to study. Ask me any hard terms, and I will explain them with a school-project analogy!";
    }
  } else if (activePersona === "shopkeeper") {
    if (msg.includes("forecast") || msg.includes("revenue") || msg.includes("quarter")) {
      responseText = "Our sales projection next quarter looks solid at **$2.6M**, showing a **12.6% increase** in business. That's like selling 12 additional crates of produce for every 100 crates sold last month!";
    } else if (msg.includes("risk") || msg.includes("flagged") || msg.includes("accounts") || msg.includes("anomalies")) {
      responseText = "We have **3 client accounts** showing warning signs:\n- **Lena Harper** (order details pending, $125 tab)\n- **Sophie Kim** (invoice waiting on payment, $320 tab)\n- **AlphaTech** (their head buyer changed, worth $1.2M)\n\nI recommend calling them to clear their credit tab.";
    } else {
      responseText = "I've read through the sales invoice log sheet. The general numbers look clean: total revenue is **$2.84M** (+18% Vs last month). No major inventory discrepancies detected!";
    }
  } else if (activePersona === "business") {
    if (msg.includes("forecast") || msg.includes("revenue") || msg.includes("quarter")) {
      responseText = "Q3 forecasts indicate **$2.6M in revenue** (a **12.6% expansion** QoQ) with a **96.8% confidence interval**. The primary driver is expansion bookings and acceleration in our EMEA pipeline velocity.";
    } else if (msg.includes("risk") || msg.includes("flagged") || msg.includes("accounts") || msg.includes("anomalies")) {
      responseText = "A total of **23 contract opportunities** are currently flagged at-risk:\n- **InfluxMedia** ($125 contract delay)\n- **CreatorHive** ($320 account pending review)\n- **AlphaTech** ($1.2M pipeline value at risk)\n\nRecommend establishing immediate executive touchpoints.";
    } else {
      responseText = "Data summary completed. Q2 transactions reflect **$2.84M in revenue** and **82% pipeline health index**.";
    }
  } else {
    if (msg.includes("forecast") || msg.includes("revenue") || msg.includes("quarter")) {
      responseText = "We expect to earn **$2.6M** next quarter, which is about **12% higher** than last quarter. We are very sure of this number (96% confidence) because our client signups have been very steady.";
    } else if (msg.includes("risk") || msg.includes("flagged") || msg.includes("accounts") || msg.includes("anomalies")) {
      responseText = "We have marked **3 accounts** that need attention:\n- **Lena Harper** (project steps are moving slowly)\n- **Sophie Kim** (invoice is waiting to be paid)\n- **AlphaTech** (the main person we talk to has left)\n\nIt is best to drop them a friendly message to check how we can help.";
    } else {
      responseText = "Welcome! I've explained the loaded document. The writing is **very simple** (grade-school level) with a **positive tone (76%)**. Ask me anything, and I'll explain it without using complex industry words!";
    }
  }

  res.json({ sender: "ai", text: responseText, date: new Date().toISOString() });
};
