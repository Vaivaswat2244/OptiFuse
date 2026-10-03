"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Zap, FileCode2, AlertCircle, Copy, Check, Cloud, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface RepositoryDetailPageClientProps {
  params: {
    owner: string
    repoName: string
  }
}

interface FileResponse {
  filename: string
  content: string
}

export function RepositoryDetailPageClient({ params }: RepositoryDetailPageClientProps) {
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  // null until the profile has loaded, so the page neither nags nor promises
  // live data before it knows which applies.
  const [awsConnected, setAwsConnected] = useState<boolean | null>(null)
  const { owner, repoName } = params

  useEffect(() => {
    const token = localStorage.getItem("optifuse_api_token")
    const API_URL = process.env.NEXT_PUBLIC_API_URL

    if (!token || !API_URL) {
      setError("Configuration error or not logged in.")
      setLoading(false)
      return
    }

    // Whether a role ARN is on file decides what the analysis will run on.
    // Without one the gateway falls back to the estimates in serverless.yml,
    // and the user should learn that here, before clicking, not from a
    // results page labelled "live".
    fetch(`${API_URL}/api/profile/settings/`, {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((profile: { aws_role_arn?: string | null } | null) => {
        setAwsConnected(Boolean(profile?.aws_role_arn))
      })
      .catch(() => setAwsConnected(false))

    fetch(`${API_URL}/api/repositories/${owner}/${repoName}/file/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 404) {
          throw new Error("serverless.yml not found in this repository.")
        }
        if (!res.ok) {
          throw new Error("Failed to fetch file content.")
        }
        return res.json() as Promise<FileResponse>
      })
      .then((data) => {
        setFileContent(data.content)
      })
      .catch((err: Error) => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [owner, repoName])

  const handleCopy = () => {
    if (!fileContent) return
    navigator.clipboard.writeText(fileContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2.5 rounded-xl border border-border bg-muted/50 p-5">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      )
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Couldn&apos;t read the file</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    if (fileContent) {
      return (
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-2">
            <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <FileCode2 className="h-3.5 w-3.5" />
              serverless.yml
            </span>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5 text-xs">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="max-h-[28rem] overflow-auto bg-muted/30 p-4 text-sm leading-relaxed">
            <code className="font-mono text-foreground">{fileContent}</code>
          </pre>
        </div>
      )
    }

    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
        File found, but it is empty.
      </p>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to repositories
      </Link>

      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-3xl font-bold tracking-tight">{repoName}</h1>
            {fileContent && !error && (
              <Badge variant="secondary" className="gap-1">
                <FileCode2 className="h-3 w-3" />
                serverless.yml
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-muted-foreground">
            {owner}/{repoName}
          </p>
        </div>

        {fileContent && !error && awsConnected !== false && (
          <Button asChild size="lg" className="group shadow-sm shadow-orange-600/20">
            <Link href={`/dashboard/${owner}/${repoName}/optimize`}>
              <Zap />
              Run live analysis
            </Link>
          </Button>
        )}
      </div>

      {/* No role on file: say so before the run, offer the fix, and still
          allow the run on estimates for anyone who wants a quick look. */}
      {fileContent && !error && awsConnected === false && (
        <Alert className="mb-7 border-orange-200 bg-orange-50/60">
          <Cloud className="text-primary" />
          <AlertTitle>Connect your AWS account to analyse real traffic</AlertTitle>
          <AlertDescription>
            <p>
              Optifuse reads your functions&apos; durations, memory and invocation counts from
              CloudWatch through a read-only IAM role. Without one, the analysis uses the
              estimates in your <code className="font-mono text-xs">serverless.yml</code>, which
              are only as good as the guesses in it.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/settings">
                  <Settings />
                  Add IAM role in Settings
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="bg-white/70">
                <Link href={`/dashboard/${owner}/${repoName}/optimize`}>
                  <Zap />
                  Run with YAML estimates
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Function definitions</CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </main>
  )
}
