"use server"

import { generateText, Output } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import type { CvContent, CvExperience, CvEducation } from "@/types/cv"

const cvExperienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  dates: z.string().optional(),
  bullets: z.array(z.string()),
})

const cvEducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  dates: z.string().optional(),
})

const cvContentSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  summary: z.string(),
  experience: z.array(cvExperienceSchema),
  education: z.array(cvEducationSchema),
  skills: z.array(z.string()),
})

const MAX_CV_TEXT_LENGTH = 25_000

export async function parseCvTextWithAI(rawCvText: string): Promise<CvContent> {
  const text = rawCvText.slice(0, MAX_CV_TEXT_LENGTH).trim()
  if (!text) {
    throw new Error("CV text is empty")
  }

  const { output } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({
      schema: cvContentSchema,
      name: "ParsedCV",
      description: "Structured CV content extracted from raw text",
    }),
    prompt: `Extract structured CV/resume data from the following raw text. Preserve the candidate's exact name, email, phone, job titles, companies, education, and skills. For experience entries, extract 2-6 bullet points per role. For skills, produce a clean list (comma-separated or one per line in the output array). If something is missing (e.g. no phone), omit it. Keep the same language (English or Spanish) as the source.

Raw CV text:
${text}`,
  })

  return {
    name: output.name,
    email: output.email,
    phone: output.phone,
    summary: output.summary,
    experience: output.experience.map(
      (e): CvExperience => ({
        role: e.role,
        company: e.company,
        dates: e.dates,
        bullets: e.bullets,
      }),
    ),
    education: output.education.map(
      (e): CvEducation => ({
        degree: e.degree,
        institution: e.institution,
        dates: e.dates,
      }),
    ),
    skills: output.skills,
  }
}
