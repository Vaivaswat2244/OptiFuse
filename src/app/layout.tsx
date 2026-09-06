import type React from "react"
import type { Metadata } from "next"
import { SiteNav } from "@/components/site-nav"
import "./global.css"

export const metadata: Metadata = {
  title: "Optifuse - Lambda Function Optimization",
  description:
    "Optimize your serverless Lambda functions for better performance and lower costs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {/* Sticky rather than fixed, so it occupies flow and pages no longer
            need a matching pt-16 spacer to avoid sliding underneath it. */}
        <SiteNav />
        {children}
      </body>
    </html>
  )
}
