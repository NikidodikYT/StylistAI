"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Zap, Heart, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
    if (!hasSeenWelcome) {
      // Show modal after a short delay
      setTimeout(() => setIsOpen(true), 500)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem("hasSeenWelcome", "true")
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl glass-strong rounded-3xl p-8 md:p-12 shadow-2xl animate-bounce-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent/10 transition-all duration-200 group"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
        </button>

        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-accent via-accent-secondary to-accent-tertiary opacity-20 blur-3xl animate-pulse-glow" />

        {/* Content */}
        <div className="relative text-center space-y-6">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent via-accent-secondary to-accent-tertiary p-0.5 animate-rotate-slow">
            <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-accent" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Добро пожаловать в <span className="gradient-text-animated">StylistAI</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Ваш персональный ИИ-стилист готов помочь создать идеальные образы. Получайте рекомендации, анализируйте фото
            и находите вдохновение!
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <FeatureItem icon={Zap} title="Умный чат" description="Общайтесь с AI" />
            <FeatureItem icon={Heart} title="Избранное" description="Сохраняйте образы" />
            <FeatureItem icon={TrendingUp} title="Каталог" description="Тысячи луков" />
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleClose}
            size="lg"
            className="magnetic-button bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary text-accent-foreground border-0 shadow-lg shadow-accent/30 mt-6"
          >
            Начать работу
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent/5 transition-all duration-300 group">
      <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-all duration-300 group-hover:scale-110">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
