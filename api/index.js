import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "../backend/routes/authRoutes.js";
import feedbackRoutes from "../backend/routes/feedbackRoutes.js";
import chatRoutes from "../backend/routes/chatRoutes.js";
import dashboardRoutes from "../backend/routes/dashboardRoutes.js";
import docRoutes from "../backend/routes/docRoutes.js";

dotenv.config();

const app = express();

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ==========================================
// MONGODB CONNECTION
// ==========================================

let cachedConnection = null;

const connectDB = async () => {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing from Vercel Environment Variables"
    );
  }

  // Reuse existing connection promise
  if (!cachedConnection) {
    cachedConnection = mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );
  }

  await cachedConnection;

  console.log(
    "MongoDB Atlas connected:",
    mongoose.connection.name
  );

  return mongoose.connection;
};

// ==========================================
// BACKEND HEALTH CHECK
// ==========================================

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexDocIQ backend is working",
  });
});

// ==========================================
// DATABASE HEALTH CHECK
// ==========================================

app.get("/api/test-db", async (req, res) => {
  try {
    await connectDB();

    return res.status(200).json({
      success: true,
      message: "MongoDB Atlas connected successfully",
      database: mongoose.connection.name,
      readyState: mongoose.connection.readyState,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);

    return res.status(500).json({
      success: false,
      message: "MongoDB Atlas connection failed",
      error: error.message,
    });
  }
});

// ==========================================
// DATABASE MIDDLEWARE
// ==========================================

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database middleware error:", error);

    return res.status(503).json({
      success: false,
      error: "Database connection failed",
      details: error.message,
    });
  }
});

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/feedback", feedbackRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api", docRoutes);

// ==========================================
// API 404
// ==========================================

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("API Error:", err);

  return res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// ==========================================
// VERCEL SERVERLESS EXPORT
// ==========================================

export default app;