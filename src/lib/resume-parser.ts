// FIX: Import from pdf-parse/lib/pdf-parse.js directly.
// The default `import pdfParse from "pdf-parse"` triggers an ENOENT crash
// under Next.js webpack because pdf-parse tries to read a test file at load
// time via a top-level require.  Importing the inner module bypasses that.
// Reference: https://github.com/vercel/next.js/issues/58168

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

export async function parseResume(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text ?? "";
  } catch (err) {
    console.error("[resume-parser] pdf-parse failed:", err);
    return "";
  }
}
