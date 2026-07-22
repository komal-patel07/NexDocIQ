import Feedback from "../models/Feedback.js";

export const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback
      .find()
      .sort({ date: -1 });

    return res.status(200).json(feedback);

  } catch (err) {
    console.error(
      "Fetch feedback error:",
      err
    );

    return res.status(500).json({
      success: false,
      error: "Failed to retrieve feedback list",
    });
  }
};


export const postFeedback = async (req, res) => {
  try {
    console.log(
      "Feedback request received:",
      req.body
    );

    const {
      name,
      email,
      category,
      rating,
      comment,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !comment ||
      rating === undefined ||
      rating === null
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Name, email, rating and comment are required",
      });
    }

    const newFeedback =
      await Feedback.create({
        name: name.trim(),
        email: email.trim(),
        category:
          category || "features",
        rating: Number(rating),
        comment: comment.trim(),
        date: new Date(),
      });

    console.log(
      "Feedback created:",
      newFeedback
    );

    return res.status(201).json({
      success: true,
      message:
        "Feedback submitted successfully",
      feedback: newFeedback,
    });

  } catch (err) {
    console.error(
      "Submit feedback error:",
      err
    );

    return res.status(500).json({
      success: false,
      error:
        err.message ||
        "Failed to submit feedback",
    });
  }
};