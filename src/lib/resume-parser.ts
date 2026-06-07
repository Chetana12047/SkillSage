import pdfParse from "pdf-parse";

export async function parseResume(
  buffer: Buffer
) {
  const data =
    await pdfParse(buffer);

  return data.text;
}