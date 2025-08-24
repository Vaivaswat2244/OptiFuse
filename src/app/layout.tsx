import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Server } from "lucide-react"
import "./global.css"

export const metadata: Metadata = {
  title: "Optifuse - Lambda Function Optimization",
  description: "Optimize your serverless Lambda functions for better performance and lower costs",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
  
      </head>
      <body>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-[#090a0f] to-[#1b2735] backdrop-blur-md border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                
                <Server className="h-8 w-8 text-slate-300" />
                <Link href='/'>
                <span className="text-xl font-bold text-white">Optifuse</span>
                </Link>
                
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/about"
                  className="text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  About Us
                </Link>
                <Link
                  href="/help"
                  className="text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Help
                </Link>
                <Link
                  href="/settings"
                  className="text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-16">{children}</div>
      </body>
    </html>
  )
}
