import { PDFParse } from "pdf-parse"
import mammoth from "mammoth"

export type ExtractResult = { ok: true; text: string } | { ok: false; error: string }

export async function extractTextFromCvFile(
  buffer: Buffer,
  mimeType: string,
): Promise<ExtractResult> {
  const type = mimeType.toLowerCase()
  if (type === "application/pdf") {
    return extractFromPdf(buffer)
  }
  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    type === "application/msword"
  ) {
    return extractFromDocx(buffer)
  }
  return { ok: false, error: "Unsupported file type. Use PDF or DOCX." }
}

async function extractFromPdf(buffer: Buffer): Promise<ExtractResult> {
  let parser: PDFParse | null = null
  try {
    parser = new PDFParse({ data: new Uint8Array(buffer) })
    const textResult = await parser.getText()
    const text = (textResult?.text ?? "").trim()
    if (!text) return { ok: false, error: "No text could be extracted from the PDF." }
    return { ok: true, text }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse PDF"
    return { ok: false, error: message }
  } finally {
    if (parser) await parser.destroy()
  }
}

async function extractFromDocx(buffer: Buffer): Promise<ExtractResult> {
  try {
    const result = await mammoth.extractRawText({ buffer })
    const text = (result?.value ?? "").trim()
    if (!text) return { ok: false, error: "No text could be extracted from the DOCX." }
    return { ok: true, text }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse DOCX"
    return { ok: false, error: message }
  }
}
