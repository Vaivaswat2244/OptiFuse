"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Cloud, Menu, X, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/*
  Shown only once we know the visitor is signed in. A signed-out visitor
  following either link would land on an empty state or be bounced to /login,
  so they get the login action instead.
*/
const SIGNED_IN_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
]

export function SiteNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  // `null` until the effect runs, so server and first client render agree and
  // React does not report a hydration mismatch over the auth-dependent slot.
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    setSignedIn(Boolean(localStorage.getItem("optifuse_api_token")))
  }, [pathname])

  // Route changes should never leave the mobile panel hanging open.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleSignOut = () => {
    localStorage.removeItem("optifuse_api_token")
    localStorage.removeItem("optifuse_token")
    setSignedIn(false)
    router.push("/")
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm shadow-orange-600/25 transition-transform duration-300 group-hover:scale-105">
            <Cloud className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Opti<span className="text-primary">fuse</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {signedIn &&
            SIGNED_IN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}

          <div
            className={cn(
              "flex items-center gap-2",
              // The divider only earns its place when there is a link to divide from.
              signedIn && "ml-3 border-l border-border pl-3"
            )}
          >
            {signedIn === null ? (
              // Reserve the slot so the bar does not jump once auth resolves.
              <div className="h-9 w-24" aria-hidden />
            ) : signedIn ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link href="/login">Log in</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile trigger. Previously there was no mobile nav at all. */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {signedIn &&
              SIGNED_IN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            <div className={cn(signedIn && "pt-2")}>
              {signedIn ? (
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login">Log in</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
