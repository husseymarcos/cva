import type { JobAnalysisResult } from "@/types/job"
import type { CvContent } from "@/types/cv"

function cvToSearchableText(cv: CvContent): string {
  const parts: string[] = [
    cv.summary,
    ...cv.experience.flatMap((e) => [e.role, e.company, ...e.bullets]),
    ...cv.education.flatMap((e) => [e.degree, e.institution]),
    ...cv.skills,
  ]
  return parts.join(" ").toLowerCase()
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

export function computeKeywordCoverage(
  jobAnalysis: JobAnalysisResult,
  cv: CvContent,
): {
  keywordCoverage: number
  coveredKeywords: string[]
  missingKeywords: string[]
} {
  const keywords = jobAnalysis.keywords
  if (keywords.length === 0) {
    return { keywordCoverage: 100, coveredKeywords: [], missingKeywords: [] }
  }

  const text = cvToSearchableText(cv)
  const covered: string[] = []
  const missing: string[] = []

  for (const kw of keywords) {
    const n = normalizeForMatch(kw)
    if (!n) continue
    if (text.includes(n) || text.includes(n.replace(/\s+/g, ""))) {
      covered.push(kw)
    } else {
      missing.push(kw)
    }
  }

  const keywordCoverage =
    keywords.length === 0 ? 100 : Math.round((covered.length / keywords.length) * 100)
  return { keywordCoverage, coveredKeywords: covered, missingKeywords: missing }
}

export function computeAtsScore(
  jobAnalysis: JobAnalysisResult,
  cv: CvContent,
): number {
  const { keywordCoverage } = computeKeywordCoverage(jobAnalysis, cv)
  let score = keywordCoverage * 0.7 // 70% weight on keyword match

  if (cv.summary?.trim()) score += 5
  if (cv.experience.length > 0) score += 5
  if (cv.education.length > 0) score += 5
  if (cv.skills.length > 0) score += 5

  const hasBullets = cv.experience.some((e) => e.bullets.length > 0)
  if (hasBullets) score += 5

  return Math.min(100, Math.round(score))
}
