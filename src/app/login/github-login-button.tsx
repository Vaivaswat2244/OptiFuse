"use client"

import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"

/*
  Builds the GitHub authorize URL in the browser so redirect_uri can name the
  origin the page is actually running on.

  Without redirect_uri GitHub falls back to the FIRST callback registered on
  the OAuth app. With more than one registered (the Vercel URL and the custom
  domain), a login started on the custom domain came back on the Vercel one,
  and the gateway's CORS policy then refused the token exchange. The value
  sent here must match a registered callback exactly, path included.
*/
export function GitHubLoginButton({ clientId }: { clientId: string }) {
  const login = () => {
    const redirectUri = `${window.location.origin}/auth/callback`
    const url = new URL("https://github.com/login/oauth/authorize")
    url.searchParams.set("client_id", clientId)
    url.searchParams.set("scope", "read:user,repo")
    url.searchParams.set("redirect_uri", redirectUri)
    window.location.assign(url.toString())
  }

  return (
    <Button className="w-full" size="lg" onClick={login}>
      <Github />
      Continue with GitHub
    </Button>
  )
}
