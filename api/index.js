import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { createRequire } from "module";

dotenv.config();

// ─── ESM helpers ─────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ─── Database ─────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes      from "../backend/routes/authRoutes.js";
import feedbackRoutes  from "../backend/routes/feedbackRoutes.js";
import chatRoutes      from "../backend/routes/chatRoutes.js";
import dashboardRoutes from "../backend/routes/dashboardRoutes.js";
import docRoutes       from "../backend/routes/docRoutes.js";

app.use("/api/auth",      authRoutes);
app.use("/api/feedback",  feedbackRoutes);
app.use("/api/chat",      chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api",           docRoutes);   // /api/upload  /api/documents

// ─── Seed default feedback on first run ───────────────────────────────────────
import Feedback from "../backend/models/Feedback.js";

mongoose.connection.once("open", async () => {
  try {
    const count = await Feedback.countDocuments();
    if (count === 0) {
      await Feedback.insertMany([
        {
          name: "Sarah Jenkins",
          email: "sarah@designflow.com",
          category: "usability",
          rating: 5,
          comment:
            "The UI design is absolutely gorgeous. The dark green gradients and glassmorphism mimic modern SaaS setups perfectly.",
          date: new Date(Date.now() - 3600000 * 24),
        },
        {
          name: "Liam O'Connor",
          email: "liam@techstack.io",
          category: "features",
          rating: 4,
          comment:
            "The Document Analyzer is very helpful. Being able to drag in spreadsheets and immediately ask questions saved me a lot of auditing time.",
          date: new Date(Date.now() - 3600000 * 72),
        },
      ]);
      console.log("Default feedbacks seeded.");
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
});

export default app;
