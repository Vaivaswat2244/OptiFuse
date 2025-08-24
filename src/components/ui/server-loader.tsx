"use client"

import { Server } from "lucide-react"

interface ServerLoaderProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function ServerLoader({ size = "md", className = "" }: ServerLoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-20 h-20",
    lg: "w-20 h-20",
  }

  const iconSizes = {
    sm: 22,
    md: 28,
    lg: 36,
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer rotating ring */}
        <div
          className={`${sizeClasses[size]} border-2 border-slate-600/30 border-t-slate-400 rounded-lg animate-spin`}
        />

        {/* Server icon with pop animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Server
            size={iconSizes[size]}
            className="text-slate-400 animate-pulse"
            style={{
              animation: "serverPop 2s ease-in-out infinite",
            }}
          />
        </div>

        {/* Inner pulsing dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex space-x-1">
            <div
              className="w-1 h-1 bg-slate-500 rounded-full"
              style={{ animation: "dotPulse 1.5s ease-in-out infinite" }}
            />
            <div
              className="w-1 h-1 bg-slate-500 rounded-full"
              style={{ animation: "dotPulse 1.5s ease-in-out infinite 0.2s" }}
            />
            <div
              className="w-1 h-1 bg-slate-500 rounded-full"
              style={{ animation: "dotPulse 1.5s ease-in-out infinite 0.4s" }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes serverPop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
