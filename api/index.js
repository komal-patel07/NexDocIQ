import express  from "express";
import cors     from "cors";
import mongoose from "mongoose";
import dotenv   from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow localhost dev ports and any *.vercel.app deployment
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
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/test", (_req, res) => {
  res.json({ message: "Backend is working!" });
});

// ─── DB Connection Guard ──────────────────────────────────────────────────────
app.use((req, res, next) => {
  // readyState 1 = connected, 2 = connecting
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    return res.status(503).json({ error: "Backend is running, but the database connection failed. Please check your MongoDB URI and Network Access (IP Whitelist)." });
  }
  next();
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
app.use("/api",           docRoutes);  // handles /api/upload and /api/documents

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
          comment: "The UI design is absolutely gorgeous. The dark green gradients and glassmorphism mimic modern SaaS setups perfectly.",
          date: new Date(Date.now() - 3600000 * 24),
        },
        {
          name: "Liam O'Connor",
          email: "liam@techstack.io",
          category: "features",
          rating: 4,
          comment: "The Document Analyzer is very helpful. Being able to drag in spreadsheets and immediately ask questions saved me a lot of auditing time.",
          date: new Date(Date.now() - 3600000 * 72),
        },
      ]);
      console.log("Default feedbacks seeded.");
    }
  } catch (err) {
    console.error("Seeding error:", err);
  }
});

// ─── Global error handler (MUST be registered last) ───────────────────────────
// Catches all errors (multer, parser, DB, etc.) and always returns JSON —
// so the frontend never receives an empty body or HTML that breaks JSON.parse.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error("Unhandled server error:", err.message || err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large. Maximum allowed size is 10 MB." });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ error: "Unexpected file field name. Use 'file'." });
  }

  const status  = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ error: message });
});

// ─── Export app for Vercel serverless runtime ─────────────────────────────────
export default app;

// ─── Local development: start HTTP server when run directly ───────────────────
// In ESM, import.meta.url is the file URL of THIS module.
// process.argv[1] is the script Node was told to run.
// When they match, this file is the entry point → start the HTTP listener.
// When Vercel imports this file as a serverless handler, they DON'T match → skip listen().
const isMain = fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n  🚀 NexDocIQ backend running at http://localhost:${PORT}`);
    console.log(`  📡 Health check:  http://localhost:${PORT}/api/test\n`);
  });
}
