"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Sparkles, Moon, Sun, Heart, Info, Mail } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { getFavorites } from "@/lib/favorites"
import { AboutModal } from "./about-modal"
import { ContactModal } from "./contact-modal"

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/chat", label: "Чат с AI" },
  { href: "/analyze", label: "Анализ фото" },
  { href: "/catalog", label: "Каталог" },
  { href: "/favorites", label: "Избранное", icon: Heart },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [aboutModalOpen, setAboutModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
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
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 border-b transition-all duration-300 ${
          scrolled ? "border-border/60 glass-premium shadow-lg" : "border-transparent bg-background/60 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent via-accent-secondary to-accent-tertiary group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="gradient-text-premium">StylistAI</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 hover:text-accent flex items-center gap-1.5 rounded-lg hover:bg-accent/5 ${
                      pathname === item.href ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.label}
                    {item.href === "/favorites" && favoritesCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary text-[10px] font-bold text-white shadow-lg">
                        {favoritesCount}
                      </span>
                    )}
                    {pathname === item.href && (
                      <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary animate-fade-in" />
                    )}
                  </Link>
                )
              })}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAboutModalOpen(true)}
                className="text-sm font-medium text-muted-foreground hover:text-accent hover:bg-accent/5"
              >
                <Info className="h-4 w-4 mr-1.5" />О проекте
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setContactModalOpen(true)}
                className="text-sm font-medium text-muted-foreground hover:text-accent hover:bg-accent/5"
              >
                <Mail className="h-4 w-4 mr-1.5" />
                Контакты
              </Button>
            </div>

            {/* Theme Toggle & Mobile Menu */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative overflow-hidden transition-all duration-200 hover:bg-accent/10 hover:text-accent magnetic-premium"
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border glass-premium md:hidden animate-slide-down">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:bg-accent/5 hover:text-accent"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {item.label}
                    {item.href === "/favorites" && favoritesCount > 0 && (
                      <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary text-xs font-bold text-white">
                        {favoritesCount}
                      </span>
                    )}
                  </Link>
                )
              })}

              <Button
                variant="ghost"
                onClick={() => {
                  setAboutModalOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full justify-start text-base font-medium text-muted-foreground hover:text-accent hover:bg-accent/5"
              >
                <Info className="h-5 w-5 mr-2" />О проекте
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setContactModalOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full justify-start text-base font-medium text-muted-foreground hover:text-accent hover:bg-accent/5"
              >
                <Mail className="h-5 w-5 mr-2" />
                Контакты
              </Button>
            </div>
          </div>
        )}
      </nav>

      <AboutModal isOpen={aboutModalOpen} onClose={() => setAboutModalOpen(false)} />
      <ContactModal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </>
  )
}
