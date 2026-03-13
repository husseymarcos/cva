import { z } from "zod"

export const cvExperienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  dates: z.string().nullable(),
  bullets: z.array(z.string()),
})

export const cvEducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  dates: z.string().nullable(),
})

export const cvContentSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  summary: z.string(),
  experience: z.array(cvExperienceSchema),
  education: z.array(cvEducationSchema),
  skills: z.array(z.string()),
})

export const jobAnalysisSchema = z.object({
  keywords: z.array(z.string()),
  byCategory: z.object({
    skills: z.array(z.string()).nullable(),
    tools: z.array(z.string()).nullable(),
    responsibilities: z.array(z.string()).nullable(),
  }).nullable(),
})
