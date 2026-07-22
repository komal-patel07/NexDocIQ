import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import mammoth from "mammoth";
import { createRequire } from "module";

// pdf-parse is CommonJS
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export default async function parseFile(file) {
  const filePath = file.path;
  const ext = path
    .extname(file.originalname)
    .toLowerCase();

  let contentText = "";

  try {
    // ==========================================
    // TXT / JSON / CSV / XML
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
        file.originalname
      );

      const dataBuffer =
        fs.readFileSync(filePath);

      const parsed =
        await pdfParse(dataBuffer);

      contentText =
        parsed.text || "";

      console.log(
        "PDF parsed successfully"
      );

      console.log(
        "Extracted characters:",
        contentText.length
      );
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
        result.value || "";
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
            `Sheet: ${sheetName}\n` +
            `${csv}\n\n`;
        }
      );

      contentText =
        sheetText;
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

    return contentText;

  } catch (error) {
    console.error(
      `Failed to parse file "${file.originalname}":`,
      error
    );

    throw new Error(
      `Failed to parse file "${file.originalname}": ${error.message}`
    );
  }
}