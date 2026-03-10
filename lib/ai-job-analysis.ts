"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import type { JobAnalysisResult } from "@/types/job"

const MAX_JOB_LENGTH = 50_000

const jobAnalysisSchema = z.object({
  keywords: z.array(z.string()).describe("Important keywords and phrases from the job posting for ATS and matching"),
  byCategory: z
    .object({
      skills: z.array(z.string()).optional().describe("Soft and hard skills mentioned"),
      tools: z.array(z.string()).optional().describe("Technologies, tools, frameworks (e.g. React, Python, AWS)"),
      responsibilities: z.array(z.string()).optional().describe("Key responsibilities or action phrases"),
    })
    .optional(),
})

export async function analyzeJobWithAI(jobDescription: string): Promise<JobAnalysisResult> {
  const text = jobDescription.slice(0, MAX_JOB_LENGTH).trim()
  if (!text) {
    return { keywords: [], byCategory: undefined }
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: jobAnalysisSchema,
    schemaName: "JobAnalysis",
    schemaDescription: "Structured analysis of a job posting: keywords and categorized requirements",
    prompt: `Analyze this job posting and extract:
1. Important keywords and phrases that should appear on a candidate's CV for ATS and recruiter matching (skills, technologies, qualifications, action verbs).
2. Optionally group them into: skills (soft/hard skills), tools (technologies, frameworks, software), responsibilities (key responsibility phrases).

Job posting:
${text}`,
  })

  return {
    keywords: object.keywords,
    byCategory:
      object.byCategory &&
      (object.byCategory.skills?.length ||
        object.byCategory.tools?.length ||
        object.byCategory.responsibilities?.length)
        ? {
            ...(object.byCategory.skills?.length ? { skills: object.byCategory.skills } : undefined),
            ...(object.byCategory.tools?.length ? { tools: object.byCategory.tools } : undefined),
            ...(object.byCategory.responsibilities?.length
              ? { responsibilities: object.byCategory.responsibilities }
              : undefined),
          }
        : undefined,
  }
}
