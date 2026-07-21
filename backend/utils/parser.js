import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import xlsx from "xlsx";
import mammoth from "mammoth";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// pdf-parse is a CommonJS module — use createRequire for ESM compatibility
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function parseFile(file) {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();
  let contentText = "";

  if ([".txt", ".json", ".csv", ".xml"].includes(ext)) {
    contentText = fs.readFileSync(filePath, "utf8");
  } else if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const parsed = await pdfParse(dataBuffer);
    contentText = parsed.text;
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    contentText = result.value;
  } else if (ext === ".xlsx" || ext === ".xls") {
    const workbook = xlsx.readFile(filePath);
    let sheetText = "";
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const csv = xlsx.utils.sheet_to_csv(worksheet);
      sheetText += `Sheet: ${sheetName}\n${csv}\n\n`;
    });
    contentText = sheetText;
  } else {
    contentText = fs.readFileSync(filePath, "utf8");
  }

  return contentText;
}
