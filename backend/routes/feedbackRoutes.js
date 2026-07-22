import express from "express";
import {
  getFeedback,
  postFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

router.get("/", getFeedback);

router.post("/", postFeedback);

export default router;