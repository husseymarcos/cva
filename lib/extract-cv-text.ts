import { PDFParse } from "pdf-parse"
import mammoth from "mammoth"

export type ExtractResult = { ok: true; text: string } | { ok: false; error: string }

const extractors = {
  "application/pdf": async (buf: Buffer): Promise<string> => {
    const parser = new PDFParse({ data: new Uint8Array(buf) })
    try {
      const { text } = await parser.getText()
      return text?.trim() || ""
    } finally {
      await parser.destroy()
    }
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": async (buf: Buffer) => 
    (await mammoth.extractRawText({ buffer: buf })).value.trim(),
  "application/msword": async (buf: Buffer) => 
    (await mammoth.extractRawText({ buffer: buf })).value.trim(),
}

export async function extractTextFromCvFile(buffer: Buffer, mimeType: string): Promise<ExtractResult> {
  const type = mimeType.toLowerCase() as keyof typeof extractors
  const extractor = extractors[type]

  if (!extractor) return { ok: false, error: "Unsupported file type. Use PDF or DOCX." }

  try {
    const text = await extractor(buffer)
    if (!text) return { ok: false, error: "No text could be extracted." }
    return { ok: true, text }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Extraction failed" }
  }
}
