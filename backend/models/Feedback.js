import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, lowercase: true, trim: true },
  category: { type: String, enum: ["features", "usability", "performance", "bug"], default: "features" },
  rating:   { type: Number, required: true, min: 1, max: 5 },
  comment:  { type: String, required: true, trim: true },
  date:     { type: Date, default: Date.now },
});

export default mongoose.model("Feedback", FeedbackSchema);
