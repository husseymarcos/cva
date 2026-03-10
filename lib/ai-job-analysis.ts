"use server"

import { generateText, Output } from "ai"
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

  const { output } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({
      schema: jobAnalysisSchema,
      name: "JobAnalysis",
      description: "Structured analysis of a job posting: keywords and categorized requirements",
    }),
    prompt: `Analyze this job posting and extract:
1. Important keywords and phrases that should appear on a candidate's CV for ATS and recruiter matching (skills, technologies, qualifications, action verbs).
2. Optionally group them into: skills (soft/hard skills), tools (technologies, frameworks, software), responsibilities (key responsibility phrases).

Job posting:
${text}`,
  })

  return {
    keywords: output.keywords,
    byCategory:
      output.byCategory &&
      (output.byCategory.skills?.length ||
        output.byCategory.tools?.length ||
        output.byCategory.responsibilities?.length)
        ? {
            ...(output.byCategory.skills?.length ? { skills: output.byCategory.skills } : undefined),
            ...(output.byCategory.tools?.length ? { tools: output.byCategory.tools } : undefined),
            ...(output.byCategory.responsibilities?.length
              ? { responsibilities: output.byCategory.responsibilities }
              : undefined),
          }
        : undefined,
  }
}
