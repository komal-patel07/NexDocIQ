import express  from "express";
import multer    from "multer";
import path      from "path";
import fs        from "fs";
import os        from "os";
import { uploadFile, getDocuments, deleteDocument } from "../controllers/docController.js";

// ─── Upload directory ─────────────────────────────────────────────────────────
// On Vercel (serverless) the filesystem is read-only EXCEPT for /tmp.
// Locally we use the OS temp dir so no path assumptions are made.
const uploadDir = path.join(os.tmpdir(), "nexdociq-uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = [
      ".pdf", ".csv", ".xlsx", ".xls",
      ".docx", ".txt", ".json", ".xml"
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowed.join(", ")}`));
    }
  }
});

const router = express.Router();

router.post("/upload",          upload.single("file"), uploadFile);
router.get("/documents",        getDocuments);
router.delete("/documents/:id", deleteDocument);

export default router;
