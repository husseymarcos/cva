import * as fs from "node:fs/promises"
import * as path from "node:path"
import * as os from "node:os"
import * as typst from "typst"
import type { CvContent } from "@/types/cv"
import { buildTypstDocument } from "./cv-template"

export async function compileCvToPdf(cv: CvContent): Promise<Buffer> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "cva-"))
  const typPath = path.join(tmpDir, "cv.typ")
  const pdfPath = path.join(tmpDir, "cv.pdf")

  try {
    const typSource = buildTypstDocument(cv)
    await fs.writeFile(typPath, typSource, "utf-8")
    await typst.compile(typPath, pdfPath)
    const pdfBuffer = await fs.readFile(pdfPath)
    return pdfBuffer
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  }
}
