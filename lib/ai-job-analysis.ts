"use server"

import { generateText, Output } from "ai"
import { fastModel } from "./ai"
import { jobAnalysisSchema } from "./schemas"
import type { JobAnalysisResult } from "@/types/job"

const MAX_JOB_LENGTH = 50_000

export async function analyzeJobWithAI(jobDescription: string): Promise<JobAnalysisResult> {
  const text = jobDescription.slice(0, MAX_JOB_LENGTH).trim()
  if (!text) {
    return { keywords: [], byCategory: undefined }
  }

  const { output } = await generateText({
    model: fastModel,
    output: Output.object({
      schema: jobAnalysisSchema,
      name: "JobAnalysis",
      description: "Structured analysis of a job posting: keywords and categorized requirements",
    }),
    prompt: `Analyze this job posting and extract keywords and categorized requirements for ATS and matching:
    
    Job posting:
    ${text}`,
  })

  const entries = Object.entries(output.byCategory ?? {}).filter(([_, v]) => v?.length)
  const byCategory = entries.length ? Object.fromEntries(entries) : undefined

  return {
    keywords: output.keywords,
    byCategory: byCategory as JobAnalysisResult['byCategory'],
  }
}
