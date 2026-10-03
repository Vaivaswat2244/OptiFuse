"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/*
  Landing-page call to action that knows whether the visitor is signed in.
  Same approach as SiteNav: `null` until the effect runs, so the server render
  and the first client render agree and React does not report a hydration
  mismatch. Signed-out copy is the fallback because that is what a new visitor
  should see first.
*/
export function AuthCta({
  signedOutLabel,
  signedInLabel = "Go to dashboard",
  className,
}: {
  signedOutLabel: string
  signedInLabel?: string
  className?: string
}) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      setSignedIn(Boolean(localStorage.getItem("optifuse_api_token")))
    } catch {
      setSignedIn(false)
    }
  }, [])

  const href = signedIn ? "/dashboard" : "/login"
  const label = signedIn ? signedInLabel : signedOutLabel

  return (
    <Button asChild size="lg" className={className}>
      <Link href={href}>
        {label}
        <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Button>
  )
}
