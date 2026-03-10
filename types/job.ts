export interface JobAnalysisResult {
  keywords: string[]
  byCategory?: {
    skills?: string[]
    tools?: string[]
    responsibilities?: string[]
  }
}
