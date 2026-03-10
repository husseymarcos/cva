import { NextResponse } from "next/server"
import { analyzeJobWithAI } from "@/lib/ai-job-analysis"

const MAX_BODY_LENGTH = 50_000

function parseBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  const o = body as Record<string, unknown>
  if (typeof o.jobDescription !== "string") return null
  return o.jobDescription
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json." },
        { status: 400 }
      )
    }

    const body = await request.json()
    const jobDescription = parseBody(body)
    if (jobDescription === null) {
      return NextResponse.json(
        { error: "Invalid request. Send { jobDescription: string }." },
        { status: 400 }
      )
    }

    if (jobDescription.length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        {
          error: `Job description must be at most ${MAX_BODY_LENGTH} characters.`,
        },
        { status: 400 }
      )
    }

    const result = await analyzeJobWithAI(jobDescription)
    return NextResponse.json(result)
  } catch (err) {
    console.error("[/api/analyze-job]", err)
    return NextResponse.json(
      { error: "Failed to analyze job description. Please try again." },
      { status: 500 }
    )
  }
}
