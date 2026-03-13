import { NextResponse } from "next/server"
import { extractTextFromCvFile } from "@/lib/extract-cv-text"
import { parseCvTextWithAI } from "@/lib/ai-parse-cv"
import { analyzeJobWithAI } from "@/lib/ai-job-analysis"
import { tailorCvWithAI } from "@/lib/ai-tailor-cv"
import { compileCvToPdf } from "@/lib/cv-pdf"
import { computeKeywordCoverage, computeAtsScore } from "@/lib/ats-metrics"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_JOB_LENGTH = 50_000
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
      return NextResponse.json(
        { error: "Google API key is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY in your environment." },
        { status: 503 }
      )
    }

    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data." },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const cvFile = formData.get("cv_file")
    const jobDescription = formData.get("job_description")

    if (!cvFile || !(cvFile instanceof File)) {
      return NextResponse.json(
        { error: "Missing cv_file. Upload a PDF or DOCX file." },
        { status: 400 }
      )
    }
    if (typeof jobDescription !== "string" || !jobDescription.trim()) {
      return NextResponse.json(
        { error: "Missing or empty job_description." },
        { status: 400 }
      )
    }

    if (cvFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large." },
        { status: 400 }
      )
    }

    const mime = cvFile.type || "application/octet-stream"
    if (!ALLOWED_TYPES.includes(mime)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF or DOCX." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await cvFile.arrayBuffer())
    const extractResult = await extractTextFromCvFile(buffer, mime)
    if (!extractResult.ok) {
      return NextResponse.json(
        { error: extractResult.error },
        { status: 400 }
      )
    }

    const jobText = jobDescription.slice(0, MAX_JOB_LENGTH).trim()

    const [baseCv, jobAnalysis] = await Promise.all([
      parseCvTextWithAI(extractResult.text),
      analyzeJobWithAI(jobText),
    ])

    const tailoredCv = await tailorCvWithAI(baseCv, jobText)
    const pdfBuffer = await compileCvToPdf(tailoredCv)

    const { keywordCoverage, coveredKeywords, missingKeywords } = computeKeywordCoverage(
      jobAnalysis,
      tailoredCv,
    )
    const atsScore = computeAtsScore(jobAnalysis, tailoredCv)

    const pdfBase64 = pdfBuffer.toString("base64")
    return NextResponse.json({
      pdfBase64,
      keywordCoverage,
      atsScore,
      coveredKeywords,
      missingKeywords,
    })
  } catch (err) {
    console.error("[/api/generate-cv]", err)
    return NextResponse.json(
      { error: "Failed to generate tailored CV. Please try again." },
      { status: 500 }
    )
  }
}
