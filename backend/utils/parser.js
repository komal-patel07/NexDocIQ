import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

/**
 * Reads a multer file object and returns extracted plain text.
 *
 * Supports:
 * .txt
 * .json
 * .csv
 * .xml
 * .pdf
 * .docx
 * .xlsx
 * .xls
 */
export async function parseFile(file) {
  if (!file) {
    throw new Error("No file was provided");
  }

  const filePath = file.path;
  const originalName = file.originalname || "unknown-file";
  const ext = path.extname(originalName).toLowerCase();

  let contentText = "";

  try {
    // ==========================================
    // TEXT / JSON / CSV / XML
    // ==========================================

    if (
      [".txt", ".json", ".csv", ".xml"].includes(ext)
    ) {
      contentText = fs.readFileSync(
        filePath,
        "utf8"
      );
    }

    // ==========================================
    // PDF
    // ==========================================

    else if (ext === ".pdf") {

      console.log(
        "Parsing PDF:",
        originalName
      );

      // Load pdf-parse only when needed
      const pdfParseModule = require(
        "pdf-parse"
      );

      // Support CommonJS/default export variations
      const pdfParse =
        pdfParseModule.default ||
        pdfParseModule;

      const dataBuffer =
        fs.readFileSync(filePath);

      const parsed =
        await pdfParse(dataBuffer);

      contentText =
        parsed?.text || "";

    }

    // ==========================================
    // DOCX
    // ==========================================

    else if (ext === ".docx") {

      const result =
        await mammoth.extractRawText({
          path: filePath,
        });

      contentText =
        result?.value || "";

    }

    // ==========================================
    // XLSX / XLS
    // ==========================================

    else if (
      ext === ".xlsx" ||
      ext === ".xls"
    ) {

      const workbook =
        xlsx.readFile(filePath);

      let sheetText = "";

      workbook.SheetNames.forEach(
        (sheetName) => {

          const worksheet =
            workbook.Sheets[sheetName];

          const csv =
            xlsx.utils.sheet_to_csv(
              worksheet
            );

          sheetText +=
            `Sheet: ${sheetName}\n${csv}\n\n`;
        }
      );

      contentText = sheetText;
    }

    // ==========================================
    // FALLBACK
    // ==========================================

    else {

      contentText =
        fs.readFileSync(
          filePath,
          "utf8"
        );

    }

    console.log(
      `Successfully parsed: ${originalName}`
    );

    return contentText;

  } catch (err) {

    console.error(
      `Failed to parse file ${originalName}:`,
      err
    );

    throw new Error(
      `Failed to parse file "${originalName}": ${
        err.message
      }`
    );
  }
}