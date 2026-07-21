import fs       from "fs";
import path     from "path";
import os       from "os";
import { fileURLToPath } from "url";
import Document from "../models/Document.js";
import { parseFile } from "../utils/parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // parseFile reads from req.file.path (multer's tmp location in os.tmpdir())
    const text   = await parseFile(req.file);
    const docId  = Date.now().toString();
    const userId = req.body.userId;

    const newDoc = await Document.create({
      id: docId,
      userId: userId || null,
      name: req.file.originalname,
      type: path.extname(req.file.originalname).slice(1).toUpperCase(),
      size: `${(req.file.size / 1024).toFixed(1)} KB`,
      extractedText: text,
      stats: {},
    });

    // Clean up the temp file after processing
    try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore — may already be gone */ }

    res.status(201).json({
      id:   newDoc.id,
      name: newDoc.name,
      type: newDoc.type,
      size: newDoc.size,
    });
  } catch (err) {
    console.error("File upload error:", err);
    res.status(500).json({ error: "Failed to process file upload: " + err.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const docs = await Document.find({ userId })
      .select("id name type size -_id")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    console.error("Fetch documents error:", err);
    res.status(500).json({ error: "Failed to fetch uploaded documents" });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Document.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Document not found" });
    }
    res.json({ success: true, message: "Document deleted successfully" });
  } catch (err) {
    console.error("Delete document error:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
};
