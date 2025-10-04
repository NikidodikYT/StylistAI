"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, MessageSquare, Camera, Heart, Zap, TrendingUp, Palette, Star } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { WelcomeModal } from "@/components/welcome-modal"
import { AnimatedBackground } from "@/components/animated-background"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />
      <WelcomeModal />
      <Navigation />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <section className="container mx-auto px-4 py-32 text-center relative z-10">
        <div className="mb-6 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Star className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">AI-Powered Fashion Assistant</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance animate-fade-in-up">
          Создайте идеальные образы с помощью <span className="text-gradient">ИИ-стилиста</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 text-pretty animate-fade-in-up animate-delay-100">
          Персональные рекомендации по стилю, анализ гардероба и подбор образов — всё это с помощью искусственного
          интеллекта
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20 animate-fade-in-up animate-delay-200">
          <Link href="/stylist">
            <Button
              size="lg"
              className="group bg-gradient-purple-pink hover:opacity-90 text-white px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] relative overflow-hidden"
              aria-label="Начать чат с AI стилистом"
            >
              <span className="absolute inset-0 animate-shimmer" />
              <MessageSquare className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              Начать чат с AI
            </Button>
          </Link>
          <Link href="/stylist">
            <Button
              size="lg"
              variant="outline"
              className="group border-border hover:border-primary/50 hover:bg-primary/10 px-8 py-6 text-lg transition-all duration-300 hover:scale-105 bg-transparent"
              aria-label="Анализ фото с помощью AI"
            >
              <Camera className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
              Анализ фото
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link href="/stylist">
            <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(216,63,183,0.2)] animate-fade-in-up group cursor-pointer">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 animate-float">
                  <Palette className="w-8 h-8 text-primary transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <h3 className="text-xl font-semibold">Умный чат</h3>
                <p className="text-sm text-muted-foreground">Общайтесь с AI-стилистом</p>
              </div>
            </Card>
          </Link>

          <Link href="/stylist">
            <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(216,63,183,0.2)] animate-fade-in-up animate-delay-100 group cursor-pointer">
              <div className="flex flex-col items-center text-center gap-4">
                <div
                  className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 animate-float"
                  style={{ animationDelay: "0.5s" }}
                >
                  <Zap className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold">Анализ образов</h3>
                <p className="text-sm text-muted-foreground">Загрузите фото для рекомендаций</p>
              </div>
            </Card>
          </Link>

          <Link href="/wardrobe">
            <Card className="p-8 bg-card border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(216,63,183,0.2)] animate-fade-in-up animate-delay-200 group cursor-pointer">
              <div className="flex flex-col items-center text-center gap-4">
                <div
                  className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 animate-float"
                  style={{ animationDelay: "1s" }}
                >
                  <TrendingUp className="w-8 h-8 text-primary transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <h3 className="text-xl font-semibold">Мой гардероб</h3>
                <p className="text-sm text-muted-foreground">Сохраненные образы</p>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 hover:border-primary/50 transition-all duration-500 hover:scale-105 animate-fade-in-up backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-рекомендации</h3>
                  <p className="text-muted-foreground">
                    Наш продвинутый ИИ анализирует ваши предпочтения, тип фигуры и стиль, чтобы предложить
                    персонализированные образы.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 animate-fade-in-up animate-delay-100 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Heart className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Сохраняйте любимое</h3>
                  <p className="text-muted-foreground">
                    Создайте свою личную коллекцию стиля, сохраняя образы, которые вам нравятся. Доступ в любое время.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-pink-500/10 to-orange-500/10 border-pink-500/20 hover:border-pink-400/50 transition-all duration-500 hover:scale-105 animate-fade-in-up animate-delay-200 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-pink-500/20">
                  <Camera className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Анализ фото</h3>
                  <p className="text-muted-foreground">
                    Загрузите фото вашего гардероба или вдохновляющие изображения, и наш ИИ поможет создать гармоничные
                    образы.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-orange-500/10 to-primary/10 border-orange-500/20 hover:border-orange-400/50 transition-all duration-500 hover:scale-105 animate-fade-in-up animate-delay-300 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-orange-500/20">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Трендовые инсайты</h3>
                  <p className="text-muted-foreground">
                    Будьте в курсе модных трендов с AI-подборками и открывайте новые стили, дополняющие вашу эстетику.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
