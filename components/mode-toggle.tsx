"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun03Icon, Moon02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-6 w-11 rounded-full bg-muted",
          className
        )}
      />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative h-6 w-11 cursor-pointer rounded-full bg-muted p-1 transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDark && "bg-primary/20",
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span
        className={cn(
          "relative flex size-4 items-center justify-center rounded-full bg-background shadow-sm transition-all duration-500 ease-[cubic-bezier(0.68,-0.2,0.32,1.2)]",
          isDark ? "translate-x-5 rotate-[360deg]" : "translate-x-0 rotate-0"
        )}
      >
        {/* Sun icon */}
        <HugeiconsIcon
          icon={Sun03Icon}
          strokeWidth={2}
          className={cn(
            "absolute size-2.5 text-foreground transition-all duration-500",
            isDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
          )}
        />
        {/* Moon icon */}
        <HugeiconsIcon
          icon={Moon02Icon}
          strokeWidth={2}
          className={cn(
            "absolute size-2.5 text-foreground transition-all duration-500",
            isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"
          )}
        />
      </span>
    </button>
  )
}
