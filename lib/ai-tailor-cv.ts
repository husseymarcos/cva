"use server"

import { generateText, Output } from "ai"
import { google } from "@ai-sdk/google"
import { cvContentSchema } from "./schemas"
import type { CvContent } from "@/types/cv"

const MAX_JOB_LENGTH = 50_000

export async function tailorCvWithAI(
  baseCv: CvContent,
  jobDescription: string,
): Promise<CvContent> {
  const jobText = jobDescription.slice(0, MAX_JOB_LENGTH).trim()
  
  const { output } = await generateText({
    model: google("gemini-1.5-pro-latest"),
    output: Output.object({
      schema: cvContentSchema,
      name: "TailoredCV",
      description: "Structured CV content tailored to a job posting",
    }),
    system: `You are a professional CV writer and ATS expert. Adapt the base CV to fit the job posting.
Rules:
- Preserve factual info (name, email, phone, companies, roles, institutions, dates).
- Keep the source language.
- Rewrite summary to align with the role.
- Rephrase bullets to emphasize relevant achievements/skills.
- Merge skills with job keywords.`,
    prompt: `Base CV:
${JSON.stringify(baseCv, null, 2)}

---

Job posting:
${jobText}

Produce tailored structured CV data.`,
  })

  return output as CvContent
}
