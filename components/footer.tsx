"use client"

import type React from "react"

import Link from "next/link"
import { Sparkles, Instagram, Send, Heart, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background to-muted/20 mt-20">
      {/* Decorative wave */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden leading-none">
        <svg
          className="relative block w-full h-12"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-background"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent via-accent-secondary to-accent-tertiary group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text">StylistAI</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ваш персональный ИИ-стилист для создания идеальных образов
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <SocialLink href="https://instagram.com" icon={Instagram} label="Instagram" />
              <SocialLink href="https://t.me" icon={Send} label="Telegram" />
              <SocialLink href="mailto:hello@stylistai.com" icon={Mail} label="Email" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Навигация</h3>
            <ul className="space-y-3">
              <FooterLink href="/">Главная</FooterLink>
              <FooterLink href="/chat">Чат с AI</FooterLink>
              <FooterLink href="/analyze">Анализ фото</FooterLink>
              <FooterLink href="/catalog">Каталог</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Ресурсы</h3>
            <ul className="space-y-3">
              <FooterLink href="/favorites">Избранное</FooterLink>
              <FooterLink href="/history">История</FooterLink>
              <FooterLink href="/profile">Профиль</FooterLink>
              <FooterLink href="/help">Помощь</FooterLink>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Информация</h3>
            <ul className="space-y-3">
              <FooterLink href="/privacy">Конфиденциальность</FooterLink>
              <FooterLink href="/terms">Условия использования</FooterLink>
              <FooterLink href="/about">О проекте</FooterLink>
              <FooterLink href="/contact">Контакты</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © {currentYear} StylistAI. Создано с <Heart className="h-4 w-4 text-red-500 animate-pulse" /> для вас
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by <span className="font-semibold text-accent">Искусственный Интеллект</span>
          </p>
        </div>
      </div>

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary opacity-50" />
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200 inline-flex items-center gap-1 group"
      >
        <span className="group-hover:translate-x-1 transition-transform duration-200">{children}</span>
      </Link>
    </li>
  )
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-all duration-300 hover:scale-110 hover:-translate-y-1"
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </a>
  )
}
