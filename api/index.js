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

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin
      // Example: Postman, server-to-server
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured frontend URL
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Vercel frontend deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS: origin ${origin} not allowed`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);


// ======================================================
// BODY PARSER
// ======================================================

app.use(express.json());


// ======================================================
// DATABASE CONNECTION
// ======================================================

let isConnected = false;

const connectDB = async () => {
  // Already connected
  if (
    isConnected &&
    mongoose.connection.readyState === 1
  ) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined in Vercel environment variables"
    );
  }

  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 5000,
      }
    );

    isConnected =
      db.connections[0].readyState === 1;

    console.log(
      "MongoDB connected successfully"
    );

  } catch (error) {
    isConnected = false;

    console.error(
      "MongoDB connection error:",
      error
    );

    throw error;
  }
};


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/test", async (req, res) => {
  try {
    await connectDB();

    return res.status(200).json({
      success: true,
      message: "NexDocIQ Backend is working!",
      database: "MongoDB connected",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Backend is running but database connection failed",
      error: error.message,
    });
  }
});


// ======================================================
// DATABASE CONNECTION MIDDLEWARE
// ======================================================

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
      error:
        "Database connection failed. Check MONGODB_URI and MongoDB Atlas Network Access.",
    });
  }
});


// ======================================================
// API ROUTES
// ======================================================

// Authentication
app.use(
  "/api/auth",
  authRoutes
);


// Feedback
app.use(
  "/api/feedback",
  feedbackRoutes
);


// Chat
app.use(
  "/api/chat",
  chatRoutes
);


// Dashboard
app.use(
  "/api/dashboard",
  dashboardRoutes
);


// Documents
// Handles:
// POST /api/upload
// GET  /api/documents
app.use(
  "/api",
  docRoutes
);


// ======================================================
// API 404 HANDLER
// ======================================================

app.use(
  "/api",
  (req, res) => {
    return res.status(404).json({
      success: false,
      error: `API route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);


// ======================================================
// GLOBAL ERROR HANDLER
// MUST BE LAST
// ======================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Unhandled server error:",
      err
    );

    // File too large
    if (
      err.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(413).json({
        error:
          "File too large. Maximum allowed size is 10 MB.",
      });
    }

    // Unexpected file
    if (
      err.code ===
      "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        error:
          "Unexpected file field name. Use 'file'.",
      });
    }

    const status =
      err.status ||
      err.statusCode ||
      500;

    return res.status(status).json({
      success: false,
      error:
        err.message ||
        "Internal server error",
    });
  }
);


// ======================================================
// EXPORT FOR VERCEL
// ======================================================

export default app;