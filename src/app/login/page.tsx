import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Github, Cloud, ShieldCheck, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID

  if (!GITHUB_CLIENT_ID) {
    return (
      <main className="sky flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Configuration error</AlertTitle>
              <AlertDescription>
                GitHub Client ID is not configured. Please contact support.
              </AlertDescription>
            </Alert>
          </CardHeader>
        </Card>
      </main>
    )
  }

  const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=read:user,repo`

  return (
    <main className="sky relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="cloud animate-drift left-[-8%] top-[12%] h-52 w-[24rem] bg-white/80" />
        <div className="cloud animate-drift animation-delay-2000 left-[62%] top-[8%] h-56 w-[28rem] bg-orange-100/60" />
        <div className="cloud animate-drift animation-delay-1000 left-[30%] top-[68%] h-44 w-[22rem] bg-white/70" />
      </div>

      <Card className="relative w-full max-w-sm border-orange-100 shadow-xl shadow-orange-900/5">
        <CardHeader className="text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md shadow-orange-600/25">
            <Cloud className="h-6 w-6 text-white" strokeWidth={2.5} />
          </span>
          <CardTitle className="text-2xl">Sign in to Optifuse</CardTitle>
          <CardDescription>
            Authorize with GitHub to analyse the repositories you already have.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Button asChild className="w-full" size="lg">
            <Link href={GITHUB_AUTH_URL}>
              <Github />
              Continue with GitHub
            </Link>
          </Button>

          <div className="flex items-start gap-2.5 rounded-xl bg-secondary p-3.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-secondary-foreground">
              Optifuse requests read access so it can find the{" "}
              <code className="font-mono">serverless.yml</code> in your repositories.
              It never pushes commits or deploys on your behalf.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
