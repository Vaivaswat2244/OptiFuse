import Link from "next/link"
import { Cloud } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm shadow-orange-600/25">
                <Cloud className="h-5 w-5 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-semibold tracking-tight">
                Opti<span className="text-primary">fuse</span>
              </span>
            </div>
            <p className="mb-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Optifuse analyses how your Lambda functions actually call each other,
              then works out which ones are cheaper to deploy fused together.
            </p>
            <a
              href="mailto:contact@optifuse.com"
              className="text-sm font-medium text-primary hover:underline"
            >
              contact@optifuse.com
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Product</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-primary">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-muted-foreground transition-colors hover:text-primary">
                  AWS settings
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground transition-colors hover:text-primary">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://github.com/Vaivaswat2244/OptiFuse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@optifuse.com"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Optifuse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
