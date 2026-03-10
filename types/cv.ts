export interface CvExperience {
  role: string
  company: string
  dates?: string
  bullets: string[]
}

export interface CvEducation {
  degree: string
  institution: string
  dates?: string
}

export interface CvContent {
  name: string
  email: string
  phone?: string
  summary: string
  experience: CvExperience[]
  education: CvEducation[]
  skills: string[]
}
