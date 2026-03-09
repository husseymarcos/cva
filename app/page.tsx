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

export default function Home() {
  const [jobDescription, setJobDescription] = useState("")
  const [baseCv, setBaseCv] = useState("")
  const [jobDescriptionFileName, setJobDescriptionFileName] = useState<
    string | null
  >(null)
  const [baseCvFileName, setBaseCvFileName] = useState<string | null>(null)

  const handleClear = () => {
    setJobDescription("")
    setBaseCv("")
    setJobDescriptionFileName(null)
    setBaseCvFileName(null)
  }

  const handleJobDescriptionFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    setJobDescriptionFileName(file ? file.name : null)
  }

  const handleBaseCvFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    setBaseCvFileName(file ? file.name : null)
  }

  const handleGenerate = () => {
    // Placeholder for future integration with backend or API
    // For now, this keeps the UI wired without side effects.
    console.log("Generate tailored CV", {
      jobDescription,
      baseCv,
      jobDescriptionFileName,
      baseCvFileName,
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
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
              />
              <div className="flex flex-col gap-1 text-[11px] md:text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Input
                    id="job-description-file"
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleJobDescriptionFileChange}
                  />
                </div>
                <p>
                  You can either paste the job description above or upload it as
                  a file.
                </p>
                {jobDescriptionFileName && (
                  <p className="text-[11px] text-muted-foreground">
                    Selected file:{" "}
                    <span className="font-medium">{jobDescriptionFileName}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base-cv">Base CV</Label>
              <Textarea
                id="base-cv"
                value={baseCv}
                onChange={(event) => setBaseCv(event.target.value)}
                placeholder="Paste your general CV; we&apos;ll tailor it to this job..."
                className="min-h-32"
              />
              <div className="flex flex-col gap-1 text-[11px] md:text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Input
                    id="base-cv-file"
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleBaseCvFileChange}
                  />
                </div>
                <p>
                  You can paste your base CV above or upload it as a file in any
                  common document format.
                </p>
                {baseCvFileName && (
                  <p className="text-[11px] text-muted-foreground">
                    Selected file:{" "}
                    <span className="font-medium">{baseCvFileName}</span>
                  </p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleClear}
            >
              Clear
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleGenerate}
              disabled={
                !jobDescription &&
                !baseCv &&
                !jobDescriptionFileName &&
                !baseCvFileName
              }
            >
              Generate tailored CV
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
