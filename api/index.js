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
  })
);

app.use(express.json());

// ==========================================
// MONGODB CONNECTION
// ==========================================

let cachedConnection = null;

async function connectDB() {
  try {
    // Already connected
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return mongoose.connection;
    }

    // Check environment variable
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing from Vercel Environment Variables"
      );
    }

    console.log("Connecting to MongoDB...");

    cachedConnection = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      "MongoDB connected:",
      mongoose.connection.name
    );

    return cachedConnection;

  } catch (error) {

    console.error(
      "MongoDB connection failed:",
      error.message
    );

    throw error;
  }
}

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

    console.error(
      "MongoDB health check failed:",
      error
    );

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

    console.error(
      "Database middleware error:",
      error
    );

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

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/feedback",
  feedbackRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api",
  docRoutes
);

// ==========================================
// 404
// ==========================================

app.use((req, res) => {

  return res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });

});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

  console.error(
    "API ERROR:",
    err
  );

  return res.status(500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });

});

// ==========================================
// VERCEL EXPORT
// ==========================================

export default app;