"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    const currentTheme = theme || "system"

    if (currentTheme === "light") {
      setTheme("dark")
    } else if (currentTheme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full border-2 border-border bg-background"
        disabled
        aria-label="Загрузка переключателя темы"
      >
        <Sun className="h-5 w-5 text-muted-foreground" />
      </Button>
    )
  }

  const currentTheme = theme || "system"
  const displayTheme = currentTheme === "system" ? resolvedTheme : currentTheme

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-10 w-10 rounded-full border-2 border-primary/30 hover:border-primary/60 bg-background hover:bg-primary/10 transition-all duration-300 hover:scale-110 active:scale-95 shadow-sm hover:shadow-md"
      title={`Текущая тема: ${currentTheme === "light" ? "Светлая" : currentTheme === "dark" ? "Темная" : "Системная"} - Нажмите для переключения`}
      aria-label={`Переключить тему. Текущая: ${currentTheme === "light" ? "светлая" : currentTheme === "dark" ? "темная" : "системная"}`}
    >
      {displayTheme === "light" && (
        <Sun className="h-5 w-5 text-amber-500 transition-all duration-300 rotate-0 scale-100" />
      )}
      {displayTheme === "dark" && (
        <Moon className="h-5 w-5 text-blue-400 transition-all duration-300 rotate-0 scale-100" />
      )}
      {currentTheme === "system" && displayTheme !== "light" && displayTheme !== "dark" && (
        <Laptop className="h-5 w-5 text-purple-400 transition-all duration-300 rotate-0 scale-100" />
      )}
    </Button>
  )
}
