"use client"

import { Button } from "@/components/ui/button"
import { Sparkles, Menu, X, Shirt, History, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switcher"

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Главная" },
    { href: "/stylist", label: "AI Стилист", icon: Sparkles },
    { href: "/wardrobe", label: "Гардероб", icon: Shirt },
    { href: "/history", label: "История", icon: History },
    { href: "/profile", label: "Профиль", icon: User },
    { href: "/about", label: "О проекте" },
    { href: "/contacts", label: "Контакты" },
  ]

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md sticky top-0 z-50 animate-fade-in-down">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Sparkles className="w-5 h-5 text-primary transition-transform duration-300 group-hover:rotate-12 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
              StylistAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 text-sm transition-all duration-300 hover:scale-105 relative group ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {Icon && <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />}
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-pink-500 animate-scale-in" />
                  )}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              )
            })}
            <LanguageSwitcher />
            <div className="h-6 w-px bg-border/50" />
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-border/50" />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:bg-primary/10 transition-all duration-300 hover:scale-110"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 animate-fade-in-down">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] animate-slide-in-right ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
