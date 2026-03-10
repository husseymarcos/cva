"use server"

import { generateObject } from "ai"
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

export async function tailorCvWithAI(
  baseCv: CvContent,
  jobDescription: string,
): Promise<CvContent> {
  const jobText = jobDescription.slice(0, 30_000).trim()
  const systemPrompt = `You are a professional CV writer and ATS (Applicant Tracking System) expert. Your task is to adapt a candidate's base CV so it best fits a specific job posting.

Rules:
- Preserve the candidate's real information: same name, email, phone, companies, roles, institutions, and dates. Do not invent jobs or education.
- Keep the same language as the base CV (English or Spanish).
- Rewrite the summary to align with the role and highlight relevant experience.
- For each experience entry: reorder, rephrase, or slightly expand bullets to emphasize achievements and skills that match the job. Use similar wording to the job description where it honestly applies. Do not add responsibilities the candidate did not have.
- For skills: merge the base CV skills with important keywords from the job. List the most relevant skills first. Do not add skills the candidate does not have.
- Keep education factual; you may reorder or add a brief relevant detail if implied by the base CV.
- Output must be valid structured CV data (name, email, phone?, summary, experience[], education[], skills[]).`

  const userPrompt = `Base CV (JSON-like structure):
Name: ${baseCv.name}
Email: ${baseCv.email}
${baseCv.phone ? `Phone: ${baseCv.phone}` : ""}

Summary:
${baseCv.summary}

Experience:
${baseCv.experience
  .map(
    (e) =>
      `- ${e.role} at ${e.company}${e.dates ? ` (${e.dates})` : ""}\n  ${e.bullets.map((b) => `• ${b}`).join("\n  ")}`,
  )
  .join("\n\n")}

Education:
${baseCv.education
  .map((e) => `- ${e.degree}, ${e.institution}${e.dates ? ` (${e.dates})` : ""}`)
  .join("\n")}

Skills:
${baseCv.skills.join(", ")}

---

Job posting to tailor the CV for:
${jobText}

Produce the tailored CV as structured data. Preserve all factual information; only rephrase, reorder, and emphasize to match the job.`

  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: cvContentSchema,
    schemaName: "TailoredCV",
    schemaDescription: "Structured CV content tailored to a job posting",
    system: systemPrompt,
    prompt: userPrompt,
  })

  return {
    name: object.name,
    email: object.email,
    phone: object.phone,
    summary: object.summary,
    experience: object.experience.map(
      (e): CvExperience => ({
        role: e.role,
        company: e.company,
        dates: e.dates,
        bullets: e.bullets,
      }),
    ),
    education: object.education.map(
      (e): CvEducation => ({
        degree: e.degree,
        institution: e.institution,
        dates: e.dates,
      }),
    ),
    skills: object.skills,
  }
}
