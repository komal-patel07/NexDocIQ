export const postFeedback = async (req, res) => {
  try {
    console.log("Feedback request received:", req.body);

    const {
      name,
      email,
      category,
      rating,
      comment,
    } = req.body;

    if (
      !name ||
      !email ||
      !comment ||
      rating === undefined ||
      rating === null
    ) {
      return res.status(400).json({
        error: "Name, email, comment and rating are required",
      });
    }

    const newFeedback = await Feedback.create({
      name: name.trim(),
      email: email.trim(),
      category: category || "features",
      rating: Number(rating),
      comment: comment.trim(),
      date: new Date(),
    });

    console.log("Feedback saved:", newFeedback);

    return res.status(201).json(newFeedback);

  } catch (err) {
    console.error("REAL FEEDBACK ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};