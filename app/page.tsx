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

export default function Home() {
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

          <CardContent className="space-y-4 pt-2 pb-4">
            <div className="space-y-1.5">
              <Label htmlFor="job-description">Job description</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description you&apos;re applying for..."
                className="min-h-24"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="base-cv">Base CV</Label>
              <Textarea
                id="base-cv"
                placeholder="Paste your general CV; we&apos;ll tailor it to this job..."
                className="min-h-32"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
            <Button type="button" className="w-full sm:w-auto">
              Generate tailored CV
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}
