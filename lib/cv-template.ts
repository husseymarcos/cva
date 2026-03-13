import type { CvContent, CvExperience, CvEducation } from "@/types/cv"

const PAGE_MARGIN = 18
const SECTION_GAP = "1.2em"
const BULLET_GAP = "0.4em"

const esc = (s: string) => s.replace(/[\\#\$<>{}]/g, "\\$&")

const section = (title: string, content: string) => content.trim() ? `
#set text(size: 12pt, weight: "bold")
[${esc(title)}]
#v(0.4em)
${content}
#v(${SECTION_GAP})
` : ""

const experienceBlock = (exp: CvExperience) => {
  const header = [exp.role, exp.company, exp.dates].filter(Boolean).join(" | ")
  const bullets = exp.bullets.map(b => `- ${esc(b)}`).join(`\n#v(${BULLET_GAP})\n`)
  return `
#set text(weight: "bold")
[${esc(header)}]
#v(${BULLET_GAP})
${bullets}
#v(0.6em)
`
}

const educationBlock = (edu: CvEducation) => {
  const line = [edu.degree, edu.institution, edu.dates].filter(Boolean).join(" | ")
  return `- ${esc(line)}\n`
}

export function buildTypstDocument(cv: CvContent): string {
  const contact = [cv.email, cv.phone].filter(Boolean).join(" · ")
  
  const blocks = [
    section("Summary", esc(cv.summary)),
    section("Experience", cv.experience.map(experienceBlock).join("")),
    section("Education", cv.education.map(educationBlock).join("")),
    section("Skills", cv.skills.length ? cv.skills.map(s => `- ${esc(s)}`).join(`\n#v(${BULLET_GAP})\n`) : "")
  ]

  return `#set page(margin: ${PAGE_MARGIN}mm)
#set text(size: 11pt, lang: "en")
#set par(justify: true, leading: 0.65em)

#align(center)[
  #set text(size: 14pt, weight: "bold")
  ${esc(cv.name)}
  #v(0.2em)
  #set text(size: 10pt)
  ${esc(contact)}
]
#v(0.8em)

${blocks.join("")}`
}
