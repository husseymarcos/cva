"use server"

import { generateText, Output } from "ai"
import { fastModel } from "./ai"
import { cvContentSchema } from "./schemas"
import type { CvContent } from "@/types/cv"

const MAX_CV_TEXT_LENGTH = 25_000

export async function parseCvTextWithAI(rawCvText: string): Promise<CvContent> {
  const text = rawCvText.slice(0, MAX_CV_TEXT_LENGTH).trim()
  if (!text) {
    throw new Error("CV text is empty")
  }

  const { output } = await generateText({
    model: fastModel,
    output: Output.object({
      schema: cvContentSchema,
      name: "ParsedCV",
      description: "Structured CV content extracted from raw text",
    }),
    prompt: `Extract structured CV/resume data from the following raw text. Preserve names, contact info, job titles, companies, education, and skills. Extract 2-6 bullet points per role. Keep the source language. Use null for missing fields.

    Raw CV text:
    ${text}`,
  })

  return output as CvContent
}
