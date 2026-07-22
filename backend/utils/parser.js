import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

export async function parseFile(file) {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();

  let contentText = "";

  try {
    if ([".txt", ".json", ".csv", ".xml"].includes(ext)) {
      contentText = fs.readFileSync(filePath, "utf8");
    }

    else if (ext === ".pdf") {
      console.log("Parsing PDF:", file.originalname);

      const dataBuffer = fs.readFileSync(filePath);

      const parsed = await pdfParse(dataBuffer);

      contentText = parsed.text || "";

      console.log(
        "PDF parsed successfully. Characters:",
        contentText.length
      );
    }

    else if (ext === ".docx") {
      const result = await mammoth.extractRawText({
        path: filePath,
      });

      contentText = result.value || "";
    }

    else if (ext === ".xlsx" || ext === ".xls") {
      const workbook = xlsx.readFile(filePath);

      let sheetText = "";

      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];

        const csv = xlsx.utils.sheet_to_csv(
          worksheet
        );

        sheetText +=
          `Sheet: ${sheetName}\n` +
          `${csv}\n\n`;
      });

      contentText = sheetText;
    }

    else {
      contentText = fs.readFileSync(
        filePath,
        "utf8"
      );
    }

    return contentText;

  } catch (err) {
    console.error(
      `Failed to parse file ${file.originalname}:`,
      err
    );

    throw new Error(
      `Failed to parse file "${file.originalname}": ${err.message}`
    );
  }
}