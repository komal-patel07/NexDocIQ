import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    id:            { type: String, required: true, unique: true, index: true },
    userId:        { type: String, index: true },
    name:          { type: String, required: true, trim: true },
    type:          { type: String, required: true },
    size:          { type: String, required: true },
    extractedText: { type: String, default: "" },
    stats:         { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Document", DocumentSchema);
