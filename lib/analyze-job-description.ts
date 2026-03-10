import type { JobAnalysisResult } from "@/types/job"

const MAX_INPUT_LENGTH = 50_000

const STOP_WORDS = new Set(
  [
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
    "may", "might", "must", "shall", "can", "need", "dare", "ought", "used",
    "this", "that", "these", "those", "it", "its", "we", "our", "you", "your",
    "they", "them", "their", "he", "she", "his", "her", "i", "me", "my",
    "all", "each", "every", "both", "few", "more", "most", "other", "some",
    "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
    "very", "just", "also", "now", "here", "there", "when", "where", "why", "how",
    "if", "then", "than", "into", "out", "up", "down", "off", "over", "under",
    "about", "between", "through", "during", "before", "after", "above", "below",
  ].map((w) => w.toLowerCase())
)

const MIN_WORD_LENGTH = 2

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

function isStopOrTooShort(token: string): boolean {
  const t = token.toLowerCase().trim()
  if (t.length < MIN_WORD_LENGTH) return true
  return STOP_WORDS.has(t)
}

function extractFromBullets(text: string): string[] {
  const bullets: string[] = []
  const bulletLine = /^[\s]*[-*•·]\s*(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = bulletLine.exec(text)) !== null) {
    bullets.push(m[1].trim())
  }
  return bullets
}

function stripBulletPrefix(s: string): string {
  return s.replace(/^[\s]*[-*•·]\s*/, "").trim()
}

function extractFromListSections(text: string): string[] {
  const items: string[] = []
  const sectionList =
    /(?:requirements?|skills?|qualifications?|responsibilities?|what you(?:'ll)? (?:will )?do|key (?:responsibilities?|skills?)|must have|nice to have)\s*[:\-]\s*([\s\S]*?)(?=\n\n|\n[A-Z][a-z]+[\s\S]*?:|$)/gim
  let m: RegExpExecArray | null
  while ((m = sectionList.exec(text)) !== null) {
    const block = m[1]
    const parts = block
      .split(/[,;]|\n+/)
      .map((p) => stripBulletPrefix(p.trim()))
      .filter(Boolean)
    items.push(...parts)
  }
  return items
}

function phraseToCandidates(phrase: string): string[] {
  const out: string[] = []
  const normalized = phrase.trim()
  if (!normalized) return out
  const split = normalized.split(/[,;/]|(?:\s+and\s+|\s+or\s+)/i).map((s) => s.trim()).filter(Boolean)
  for (const s of split) {
    if (s.length >= MIN_WORD_LENGTH && !isStopOrTooShort(s)) out.push(s)
    const words = s.split(/\s+/).filter((w) => w.length >= MIN_WORD_LENGTH && !isStopOrTooShort(w))
    if (words.length <= 4 && words.length >= 1) out.push(words.join(" "))
  }
  return out
}

function extractTitleCaseAndTech(text: string): string[] {
  const candidates: string[] = []
  const wordBoundary = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s*\.\s*[A-Za-z]+)?|[A-Z]{2,}|[a-z]+(?:\s+[a-z]+){0,2}/g
  let m: RegExpExecArray | null
  while ((m = wordBoundary.exec(text)) !== null) {
    const token = m[0].trim()
    if (token.length < MIN_WORD_LENGTH) continue
    const lower = token.toLowerCase()
    if (STOP_WORDS.has(lower)) continue
    if (/^\d+$/.test(token)) continue
    candidates.push(token)
  }
  return candidates
}

function deduplicate(keywords: string[]): string[] {
  const byLower = new Map<string, string>()
  for (const k of keywords) {
    const n = normalize(k)
    if (!n) continue
    const existing = byLower.get(n)
    if (!existing) byLower.set(n, k)
    else if (k.length > existing.length) byLower.set(n, k)
  }
  let list = [...byLower.values()]
  list = list.filter((s, i) => {
    const ni = normalize(s)
    return !list.some(
      (r, j) => j !== i && normalize(r).length > ni.length && normalize(r).includes(ni)
    )
  })
  return list
}

function groupKeywords(keywords: string[]): JobAnalysisResult["byCategory"] {
  const tools: string[] = []
  const skills: string[] = []
  const responsibilities: string[] = []
  const toolLike = /\.(js|ts|tsx|jsx|py|java|go|rs|rb)$|^(react|vue|angular|node|python|java|typescript|javascript|sql|aws|gcp|azure|docker|kubernetes|linux|git|rest|api|ci\/cd|agile|scrum)$/i
  const responsibilityLike = /^(manage|lead|develop|design|implement|collaborate|communicate|drive|ensure|support|build|create|deliver|own|coordinate)/i
  for (const k of keywords) {
    if (toolLike.test(k) || /^[A-Z][a-z]+\.(js|ts|py|etc)$/.test(k)) {
      tools.push(k)
    } else if (responsibilityLike.test(k) && k.split(/\s+/).length >= 2) {
      responsibilities.push(k)
    } else {
      skills.push(k)
    }
  }
  return {
    ...(skills.length ? { skills } : undefined),
    ...(tools.length ? { tools } : undefined),
    ...(responsibilities.length ? { responsibilities } : undefined),
  }
}


export function analyzeJobDescription(jobDescription: string): JobAnalysisResult {
  const raw = typeof jobDescription === "string" ? jobDescription : ""
  const text = raw.slice(0, MAX_INPUT_LENGTH).replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim()
  const all: string[] = []

  const fromBullets = extractFromBullets(text)
  for (const b of fromBullets) all.push(...phraseToCandidates(b))

  const fromSections = extractFromListSections(text)
  for (const s of fromSections) all.push(...phraseToCandidates(s))

  const fromTitleCase = extractTitleCaseAndTech(text)
  for (const t of fromTitleCase) {
    const n = t.trim()
    if (n.length >= MIN_WORD_LENGTH && !isStopOrTooShort(n)) all.push(n)
  }

  const deduped = deduplicate(all)
  const byCategory = groupKeywords(deduped)
  const hasCategory =
    (byCategory?.skills?.length ?? 0) > 0 ||
    (byCategory?.tools?.length ?? 0) > 0 ||
    (byCategory?.responsibilities?.length ?? 0) > 0

  return {
    keywords: deduped,
    byCategory: hasCategory ? byCategory : undefined,
  }
}
