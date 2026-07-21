import Feedback from "../models/Feedback.js";

export const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ date: -1 });
    res.json(feedback);
  } catch (err) {
    console.error("Fetch feedback error:", err);
    res.status(500).json({ error: "Failed to retrieve feedback list" });
  }
};

export const postFeedback = async (req, res) => {
  try {
    const { name, email, category, rating, comment } = req.body;
    if (!name || !email || !comment || !rating) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newFeedback = await Feedback.create({
      name,
      email,
      category: category || "features",
      rating: parseInt(rating),
      comment,
      date: new Date(),
    });

    res.status(201).json(newFeedback);
  } catch (err) {
    console.error("Submit feedback error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};
