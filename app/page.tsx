"use client";

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type GenerateResult = {
  pdfBase64: string
  keywordCoverage: number
  atsScore: number
  coveredKeywords: string[]
  missingKeywords: string[]
}

export default function Home() {
  const [jobDescription, setJobDescription] = useState("")
  const [baseCvFile, setBaseCvFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerateResult | null>(null)

  const handleClear = () => {
    setJobDescription("")
    setBaseCvFile(null)
    setResult(null)
    setError(null)
    setFileInputKey((k) => k + 1)
  }

  const handleBaseCvFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    setBaseCvFile(file ?? null)
  }

  const handleGenerate = async () => {
    if (!baseCvFile || !jobDescription.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.set("cv_file", baseCvFile)
      formData.set("job_description", jobDescription.trim())
      const res = await fetch("/api/generate-cv", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setResult({
        pdfBase64: data.pdfBase64,
        keywordCoverage: data.keywordCoverage ?? 0,
        atsScore: data.atsScore ?? 0,
        coveredKeywords: data.coveredKeywords ?? [],
        missingKeywords: data.missingKeywords ?? [],
      })
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result?.pdfBase64) return
    const bin = atob(result.pdfBase64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    const blob = new Blob([bytes], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tailored-cv.pdf"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl space-y-6">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl md:text-2xl font-semibold">
              CVA
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Turn any job description into a tailored CV in seconds.
            </CardDescription>
            <p className="text-[11px] md:text-xs text-muted-foreground">
              Your CV and job descriptions are never saved or shared.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pt-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="job-description">Job description</Label>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the job description you&apos;re applying for..."
                className="min-h-24"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-cv-file">Base CV</Label>
              <div className="flex flex-col gap-1 text-[11px] md:text-xs text-muted-foreground">
                <Input
                  key={`base-cv-file-${fileInputKey}`}
                  id="base-cv-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleBaseCvFileChange}
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleClear}
              disabled={loading}
            >
              Clear
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleGenerate}
              disabled={!jobDescription.trim() || !baseCvFile || loading}
            >
              {loading ? "Generating…" : "Generate tailored CV"}
            </Button>
          </CardFooter>
        </Card>

        {result && (
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">Your tailored CV is ready</CardTitle>
              <CardDescription>
                Keyword coverage and ATS score are based on the job posting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Keyword coverage: </span>
                  <span className="font-medium">{result.keywordCoverage}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ATS score: </span>
                  <span className="font-medium">{result.atsScore}/100</span>
                </div>
              </div>
              {result.missingKeywords.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Consider adding only skills you have:{" "}
                  {result.missingKeywords.slice(0, 12).join(", ")}
                  {result.missingKeywords.length > 12 && " …"}
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full sm:w-auto" onClick={handleDownload}>
                Download tailored CV (PDF)
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  )
}
