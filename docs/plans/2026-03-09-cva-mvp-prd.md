## CVA MVP – Product Requirements Document

**Date**: 2026-03-09  
**Product**: CVA — CV adapter for job postings  
**Version**: MVP v1

---

## 1. Product Overview

**Goal**: Help unemployed students quickly adapt their existing CV to a specific job posting and download a polished, ATS-friendly PDF they can send immediately.

**Elevator pitch**: Upload your CV (PDF/DOCX), paste a job description in English or Spanish, and get a tailored, professional CV PDF that matches the role and scores well for ATS.

---

## 2. Target Users & Problems

**Primary user**  
- Unemployed students in their last years of university or recent graduates, looking for internships or junior roles.

**Problems**  
- Tailoring a CV for every job posting is slow and repetitive.  
- Students are unsure which skills/experiences to highlight for each role.  
- CV quality is inconsistent; formatting often breaks after many edits.  

**How CVA helps (MVP)**  
- Uses the user’s existing CV file as the base (no data entry from scratch).  
- Reads the job description and adjusts the CV content to emphasize what matters for that role.  
- Outputs a single, recruiter-friendly, ATS-aware PDF using a fixed professional template.

---

## 3. Scope for MVP

### 3.1 In Scope

- **Platform**
  - Single-page web app (Next.js), no authentication.
  - All data is ephemeral; no user accounts, no content history.

- **Inputs**
  - **CV upload**:
    - Supported formats: **PDF** and **DOCX**.
    - Max size: initial target 5–10 MB (final value can be tuned).
  - **Job description**:
    - Multiline text area for pasting full job postings/requirements.
    - Reasonable character limit (e.g. 5,000–10,000 chars).

- **Processing**
  - Extract text from the uploaded CV (PDF/DOCX).  
  - Detect CV language (English or Spanish) and keep the output CV in the same language.  
  - Analyze job description to extract key requirements, skills, and keywords.  
  - Generate a tailored CV text:
    - Preserves standard sections (Header, Summary, Experience, Education, Skills).  
    - Reorders and rewrites bullets to match the posting.  
    - Uses ATS-friendly structure (no tables/heavy graphics, clear headings).  

- **Output**
  - Generate a **PDF** using a **single fixed, professional template**:
    - Users cannot customize layout, fonts, or colors.  
    - Template is designed to be clean, recruiter-friendly, and ATS-friendly.  
  - Deliver CV as a downloadable PDF file.

- **ATS and keyword features**
  - Extract important keywords from the job description.  
  - Compare against the generated CV to compute:
    - **Keyword coverage** (% of important keywords present in the CV).  
    - **Covered keywords** list.  
    - **Missing important keywords** list (with a note that users should only add skills they truly have).  
  - Compute and return a simple **ATS score** (0–100) based on:
    - Keyword coverage.  
    - Presence of standard sections.  
    - Bullet-based structure.  
    - Clean formatting (enforced by template).  

- **UI**
  - Hero / header with:
    - Product name and one-line value proposition.  
    - Short privacy reassurance (“We don’t save your CV or job descriptions”).  
  - **Step 1: Upload CV (PDF/DOCX)**:
    - Drag-and-drop or file picker.  
    - Show selected file name and size.  
  - **Step 2: Paste job description**:
    - Large textarea with placeholder text.  
  - **Call-to-action**:
    - Primary button: “Generate tailored CV”.  
    - Disabled until both CV file and job description are present.  
  - **Result view**:
    - Download button: “Download tailored CV (PDF)”.  
    - Display of **Keyword coverage (e.g. 78%)** and **ATS score (e.g. 84/100)**.  
    - Optional lists of covered/missing keywords.  

- **Error and state handling**
  - Loading state / spinner while generating.  
  - Clear inline error messages for:
    - Unsupported file type.  
    - File too large.  
    - Missing file or job description.  
    - Generic server errors (“Something went wrong, please try again.”).  

### 3.2 Out of Scope (MVP)

- User accounts, authentication, or onboarding flows.  
- Persistent storage of CVs, job descriptions, or generation history.  
- Multiple templates or layout customization.  
- Full multilingual UI; the UI can be single-language (e.g. English) while supporting English/Spanish CV content.  
- Integrations with job boards (LinkedIn, Indeed, etc.).  
- Advanced analytics/ dashboards beyond basic keyword coverage and ATS score.  
- Native mobile apps (web app should be reasonably responsive on mobile).  

---

## 4. User Stories

### 4.1 Core

1. **Upload & adapt CV**  
   - As a student, I want to upload my existing CV as a PDF or DOCX so CVA can use it as a base template.

2. **Paste job description**  
   - As a student, I want to paste a job posting’s description so CVA understands the requirements of the specific role.

3. **Generate tailored CV**  
   - As a student, I want CVA to generate a new CV tailored to the job description so I highlight my most relevant skills and experience.

4. **Download CV as PDF**  
   - As a student, I want to download the generated CV as a PDF so I can easily upload it to job portals or send it by email.

5. **Keyword coverage & ATS score**  
   - As a student, I want to see keyword coverage and an ATS score so I can quickly judge how well my CV matches the job and how ATS-friendly it is.

### 4.2 Supporting

6. **Consistent professional template**  
   - As a student, I want CVA to choose a proven professional template so I don’t have to worry about layout and design choices.

7. **Language consistency (English/Spanish)**  
   - As a student, I want the generated CV to stay in the same language as my original CV (English or Spanish) so it feels natural and coherent.

8. **Clear feedback and privacy reassurance**  
   - As a student, I want clear feedback on errors and a short message explaining that my data isn’t stored so I feel safe using the tool.

---

## 5. User Flow (Happy Path)

1. User navigates to the CVA web page.  
2. Reads a short explanation and privacy note.  
3. Uploads their CV file (PDF/DOCX).  
4. Pastes the job description into the textarea.  
5. Clicks “Generate tailored CV”.  
6. Sees a loading state while the system processes their CV and the job description.  
7. On success:
   - Sees a message that the CV has been adapted.  
   - Sees keyword coverage and ATS score.  
   - Sees a button to download the tailored CV as a PDF.  
8. Clicks the button and downloads the PDF.  

---

## 6. Functional Requirements

### 6.1 Frontend

- Implemented as the main page in `app/page.tsx`.  
- File upload component:
  - Accepts `.pdf` and `.docx`.  
  - Client-side checks for file presence and approximate size before calling backend.  
- Job description input:
  - Multiline textarea with placeholder.  
  - Optional character limit or warning for very long text.  
- Generate button:
  - Disabled until both inputs are present.  
  - On click:
    - Sends a `POST` request (multipart/form-data) to `/api/generate-cv`.  
    - Shows a loading spinner and disables inputs while waiting.  
- Result handling:
  - On success:
    - Presents download link/button for PDF.  
    - Shows keyword coverage and ATS score, plus optional keyword lists.  
  - On error:
    - Shows user-friendly error text and a retry option.  

### 6.2 Backend

- API route: `POST /api/generate-cv`.  
- Request:
  - `multipart/form-data` with fields:
    - `cv_file`: required, PDF or DOCX.  
    - `job_description`: required, string.  
- Validation:
  - Ensure both fields are present.  
  - Enforce file type and size limits.  
- Processing:
  1. Parse and extract text from the CV file (PDF/DOCX).  
  2. Detect CV language (English or Spanish) based on the extracted text (and optionally job description).  
  3. Analyze the job description to extract core responsibilities, skills, and keywords.  
  4. Use LLM or domain logic to generate a structured CV text in the same language as the original CV, optimized for the target role and ATS.  
  5. Derive ATS-related metrics:
     - Important keywords from job description.  
     - Which of those appear in the generated CV.  
     - Keyword coverage percentage.  
     - Simple ATS score (0–100) based on keyword coverage and structural checks.  
  6. Render the generated CV text into a PDF using a single Typst (or equivalent) template.  
- Response (success):
  - Return generated PDF (direct binary) or JSON with base64-encoded PDF plus:
    - `keywordCoverage` (0–100).  
    - `atsScore` (0–100).  
    - `coveredKeywords`: string[].  
    - `missingKeywords`: string[].  
- Response (errors):
  - Appropriate HTTP status codes (4xx for validation, 5xx for server issues) with a JSON `{ error: string }`.  

---

## 7. Non-Functional Requirements

- **Performance**
  - End-to-end generation time target: under 15 seconds for typical CV + job description.  
  - Frontend must always show a visible loading state during processing.  

- **Reliability**
  - Handle transient LLM/Typst errors gracefully with human-readable messages.  
  - Log server errors (without storing user content long-term).  

- **Security & Privacy**
  - Do not persist CVs, job descriptions, or generated PDFs in any long-term storage.  
  - Use in-memory processing and short-lived temporary files only, deleted immediately after use.  
  - Communicate this clearly via a brief privacy note on the main page.  

- **Accessibility**
  - Keyboard-navigable form and buttons.  
  - Sufficient color contrast and readable font sizes.  
  - Clear focus states on interactive elements.  

- **Localization**
  - MVP: single-language UI (e.g. English).  
  - Generated CV content supports English and Spanish, following the language of the input CV.  
  - Structure UI copy so future localization is easy.  

---

## 8. Success Metrics (MVP)

- **Activation**
  - % of visitors who upload a CV and paste a job description.  

- **Completion**
  - % of sessions that successfully generate and download a tailored CV PDF.  

- **Perceived value (qualitative)**
  - Early user feedback:
    - “Does this CV feel better tailored to the job?” (thumbs up/down or 1–5 scale).  
    - “Is the ATS score and keyword coverage understandable and useful?”  

---

## 9. Open Questions / Future Iterations

- Offer multiple visual templates while preserving ATS-friendliness.  
- Persistent user accounts with saved base CVs and generation history.  
- Full Spanish UI and additional languages.  
- Deeper ATS analysis (per-section scores, benchmark vs. other candidates).  
- Job board integrations to pull job descriptions directly.  

