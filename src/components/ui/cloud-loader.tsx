import { Cloud } from "lucide-react"
import { cn } from "@/lib/utils"

interface CloudLoaderProps {
  size?: "sm" | "md" | "lg"
  label?: string
  className?: string
}

const SIZES = {
  sm: { ring: "h-14 w-14", icon: "h-5 w-5" },
  md: { ring: "h-20 w-20", icon: "h-7 w-7" },
  lg: { ring: "h-24 w-24", icon: "h-9 w-9" },
}

/*
  Replaces the old ServerLoader. Built from Tailwind's own animation
  utilities rather than a styled-jsx <style> block, so the keyframes are
  shared with the rest of the app instead of being injected per instance.
*/
export default function CloudLoader({
  size = "md",
  label,
  className,
}: CloudLoaderProps) {
  const { ring, icon } = SIZES[size]

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        <div
          className={cn(
            ring,
            "animate-spin rounded-full border-[3px] border-orange-100 border-t-orange-500"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Cloud className={cn(icon, "animate-pulse text-primary")} strokeWidth={2.25} />
        </div>
      </div>
      {label && (
        <p className="text-sm font-medium text-muted-foreground" role="status">
          {label}
        </p>
      )}
    </div>
  )
}
