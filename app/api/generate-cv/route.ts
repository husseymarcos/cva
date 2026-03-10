import { NextResponse } from "next/server"
import type { CvContent } from "@/types/cv"
import { compileCvToPdf } from "@/lib/cv-pdf"

function parseBody(body: unknown): CvContent | null {
  if (!body || typeof body !== "object") return null
  const o = body as Record<string, unknown>
  if (typeof o.name !== "string" || typeof o.email !== "string" || typeof o.summary !== "string")
    return null
  if (!Array.isArray(o.experience) || !Array.isArray(o.education) || !Array.isArray(o.skills))
    return null
  const experience = o.experience.map((e: unknown) => {
    if (!e || typeof e !== "object") return null
    const ex = e as Record<string, unknown>
    if (typeof ex.role !== "string" || typeof ex.company !== "string" || !Array.isArray(ex.bullets))
      return null
    return {
      role: ex.role,
      company: ex.company,
      dates: typeof ex.dates === "string" ? ex.dates : undefined,
      bullets: ex.bullets.filter((b): b is string => typeof b === "string"),
    }
  })
  if (experience.some((x) => x === null)) return null
  const education = o.education.map((e: unknown) => {
    if (!e || typeof e !== "object") return null
    const ed = e as Record<string, unknown>
    if (typeof ed.degree !== "string" || typeof ed.institution !== "string") return null
    return {
      degree: ed.degree,
      institution: ed.institution,
      dates: typeof ed.dates === "string" ? ed.dates : undefined,
    }
  })
  if (education.some((x) => x === null)) return null
  const skills = o.skills.filter((s): s is string => typeof s === "string")
  return {
    name: o.name,
    email: o.email,
    phone: typeof o.phone === "string" ? o.phone : undefined,
    summary: o.summary,
    experience: experience as CvContent["experience"],
    education: education as CvContent["education"],
    skills,
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    let cv: CvContent | null = null

    if (contentType.includes("application/json")) {
      const body = await request.json()
      cv = parseBody(body)
    }

    if (!cv) {
      return NextResponse.json(
        {
          error:
            "Invalid request. Send application/json with CvContent (name, email, summary, experience, education, skills).",
        },
        { status: 400 }
      )
    }

    const pdfBuffer = await compileCvToPdf(cv)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="tailored-cv.pdf"',
        "Content-Length": String(pdfBuffer.length),
      },
    })
  } catch (err) {
    console.error("[/api/generate-cv]", err)
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try again." },
      { status: 500 }
    )
  }
}
