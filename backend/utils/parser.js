import fs       from "fs";
import path     from "path";
import xlsx     from "xlsx";
import mammoth  from "mammoth";

// pdf-parse is a CommonJS-only package — use createRequire to import it in ESM
import { createRequire } from "module";
const require   = createRequire(import.meta.url);
const pdfParse  = require("pdf-parse");

/**
 * Reads a multer file object and returns its extracted plain-text content.
 * Supports: .txt, .json, .csv, .xml, .pdf, .docx, .xlsx, .xls
 */
export async function parseFile(file) {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();
  let contentText = "";

  try {
    if ([".txt", ".json", ".csv", ".xml"].includes(ext)) {
      // Plain text files — read directly
      contentText = fs.readFileSync(filePath, "utf8");

    } else if (ext === ".pdf") {
      // pdf-parse expects a Buffer, returns { text, numpages, ... }
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);
      contentText = parsed.text || "";

    } else if (ext === ".docx") {
      // mammoth extracts raw text from Word documents
      const result = await mammoth.extractRawText({ path: filePath });
      contentText = result.value || "";

    } else if (ext === ".xlsx" || ext === ".xls") {
      // xlsx converts each sheet to CSV and concatenates
      const workbook = xlsx.readFile(filePath);
      let sheetText = "";
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const csv = xlsx.utils.sheet_to_csv(worksheet);
        sheetText += `Sheet: ${sheetName}\n${csv}\n\n`;
      });
      contentText = sheetText;

    } else {
      // Fallback: try reading as UTF-8 text
      contentText = fs.readFileSync(filePath, "utf8");
    }
  } catch (err) {
    throw new Error(`Failed to parse file "${file.originalname}": ${err.message}`);
  }

  return contentText;
}
