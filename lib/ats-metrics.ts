import type { JobAnalysisResult } from "@/types/job"
import type { CvContent } from "@/types/cv"

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ")

const cvToText = (cv: CvContent) => [
  cv.summary,
  ...cv.experience.flatMap(e => [e.role, e.company, ...e.bullets]),
  ...cv.education.flatMap(e => [e.degree, e.institution]),
  ...cv.skills,
].join(" ").toLowerCase()

export function computeKeywordCoverage(job: JobAnalysisResult, cv: CvContent) {
  const keywords = job.keywords.filter(Boolean)
  if (!keywords.length) return { keywordCoverage: 100, coveredKeywords: [], missingKeywords: [] }

  const text = cvToText(cv)
  const covered = keywords.filter(kw => {
    const n = normalize(kw)
    return text.includes(n) || text.includes(n.replace(/\s+/g, ""))
  })
  
  const missing = keywords.filter(kw => !covered.includes(kw))
  const coverage = Math.round((covered.length / keywords.length) * 100)

  return { keywordCoverage: coverage, coveredKeywords: covered, missingKeywords: missing }
}

export function computeAtsScore(job: JobAnalysisResult, cv: CvContent) {
  const { keywordCoverage } = computeKeywordCoverage(job, cv)
  
  let score = keywordCoverage * 0.7
  const bonuses = [
    cv.summary.trim(),
    cv.experience.length > 0,
    cv.education.length > 0,
    cv.skills.length > 0,
    cv.experience.some(e => e.bullets.length > 0)
  ]
  
  score += bonuses.filter(Boolean).length * 5
  return Math.min(100, Math.round(score))
}
