"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Sparkles, Moon, Sun, Heart } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { getFavorites } from "@/lib/favorites"

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/chat", label: "Чат с AI" },
  { href: "/analyze", label: "Анализ фото" },
  { href: "/catalog", label: "Каталог" },
  { href: "/favorites", label: "Избранное" },
  { href: "/history", label: "История" },
  { href: "/profile", label: "Профиль" },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const updateCount = () => {
      setFavoritesCount(getFavorites().length)
    }

    updateCount()
    window.addEventListener("favorites-updated", updateCount)
    return () => window.removeEventListener("favorites-updated", updateCount)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-border/60 bg-background/95 backdrop-blur-xl shadow-sm"
          : "border-transparent bg-background/80 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight group">
            <Sparkles
              className="h-5 w-5 text-accent transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="transition-colors duration-200 group-hover:text-accent">StylistAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 hover:text-accent flex items-center gap-1.5 ${
                  pathname === item.href ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {item.href === "/favorites" && (
                  <>
                    <Heart className="h-4 w-4" />
                    {favoritesCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                        {favoritesCount}
                      </span>
                    )}
                  </>
                )}
                {item.href !== "/favorites" && item.label}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-accent animate-fade-in" />
                )}
              </Link>
            ))}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative overflow-hidden transition-all duration-200 hover:bg-accent/10 hover:text-accent"
              aria-label="Переключить тему"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden transition-all duration-200 hover:bg-accent/10 hover:text-accent"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Открыть меню"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 transition-transform duration-200 rotate-90" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-200" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden animate-slide-down">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-accent/5 hover:text-accent"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.href === "/favorites" && (
                  <>
                    <Heart className="h-4 w-4 mr-1" />
                    {favoritesCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                        {favoritesCount}
                      </span>
                    )}
                  </>
                )}
                {item.href !== "/favorites" && item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
