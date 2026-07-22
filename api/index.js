import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "../routes/authRoutes.js";
import feedbackRoutes from "../routes/feedbackRoutes.js";
import chatRoutes from "../routes/chatRoutes.js";
import dashboardRoutes from "../routes/dashboardRoutes.js";
import docRoutes from "../routes/docRoutes.js";

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

      // Allow configured frontend
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
// MONGODB CONNECTION
// ======================================================

let isConnected = false;

const connectDB = async () => {
  // Reuse existing connection in Vercel serverless
  if (
    isConnected &&
    mongoose.connection.readyState === 1
  ) {
    return;
  }

  // Check environment variable
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined in Vercel Environment Variables"
    );
  }

  try {
    const db = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    isConnected =
      db.connections[0].readyState === 1;

    console.log(
      "MongoDB Atlas connected successfully"
    );

  } catch (error) {
    isConnected = false;

    console.error(
      "MongoDB Atlas connection error:",
      error.message
    );

    throw error;
  }
};

// ======================================================
// BACKEND HEALTH CHECK
// ======================================================

app.get("/api/test", async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "NexDocIQ Backend is working!",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ======================================================
// MONGODB ATLAS CONNECTION CHECK
// ======================================================

app.get("/api/test-db", async (req, res) => {
  try {
    // Try connecting to MongoDB Atlas
    await connectDB();

    // Check actual Mongoose connection state
    const isMongoConnected =
      mongoose.connection.readyState === 1;

    if (!isMongoConnected) {
      return res.status(503).json({
        success: false,
        message: "MongoDB Atlas is not connected",
        readyState:
          mongoose.connection.readyState,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "MongoDB Atlas connected successfully",
      database:
        mongoose.connection.name,
      host:
        mongoose.connection.host,
      readyState:
        mongoose.connection.readyState,
    });

  } catch (error) {
    console.error(
      "MongoDB health check failed:",
      error
    );

    return res.status(503).json({
      success: false,
      message:
        "MongoDB Atlas connection failed",
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
      error.message
    );

    return res.status(503).json({
      success: false,
      error:
        "Database connection failed. Check MONGODB_URI in Vercel and MongoDB Atlas Network Access.",
    });
  }
});

// ======================================================
// API ROUTES
// ======================================================

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
// ======================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Unhandled server error:",
      err
    );

    if (
      err.code === "LIMIT_FILE_SIZE"
    ) {
      return res.status(413).json({
        success: false,
        error:
          "File too large. Maximum allowed size is 10 MB.",
      });
    }

    if (
      err.code ===
      "LIMIT_UNEXPECTED_FILE"
    ) {
      return res.status(400).json({
        success: false,
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