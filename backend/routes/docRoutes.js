import express  from "express";
import multer    from "multer";
import path      from "path";
import fs        from "fs";
import { fileURLToPath } from "url";
import { uploadFile, getDocuments, deleteDocument } from "../controllers/docController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DATA_DIR  = path.join(__dirname, "../data");
const uploadDir = path.join(DATA_DIR, "uploads");

if (!fs.existsSync(DATA_DIR))  fs.mkdirSync(DATA_DIR,  { recursive: true });
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

const router = express.Router();

router.post("/upload",          upload.single("file"), uploadFile);
router.get("/documents",        getDocuments);
router.delete("/documents/:id", deleteDocument);

export default router;
