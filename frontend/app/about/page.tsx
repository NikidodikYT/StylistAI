"use client"

import { Card } from "@/components/ui/card"
import { Sparkles, Zap, Target, Users } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Image from "next/image"

export default function AboutPage() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-технологии",
      description: "Используем передовые алгоритмы машинного обучения для анализа стиля",
    },
    {
      icon: Zap,
      title: "Быстрый результат",
      description: "Получайте персональные рекомендации за считанные секунды",
    },
    {
      icon: Target,
      title: "Точность",
      description: "Высокая точность подбора образов на основе ваших предпочтений",
    },
    {
      icon: Users,
      title: "Для всех",
      description: "Подходит для любого стиля, возраста и случая",
    },
  ]

  const creators = [
    {
      name: "Команда StylistAI",
      role: "Team work makes the dream work",
      image: "/images/creator-1.jpg",
      description: "Вместе мы создаем будущее персонального стиля, объединяя креативность и технологии",
      rotate: true,
    },
    {
      name: "Илюша",
      role: "Developer & AI Specialist",
      image: "/images/creator-2.jpg",
      description: "Специалист по разработке и внедрению AI-технологий в fashion-индустрию",
    },
    {
      name: "Никитосик",
      role: "Lead Developer & Product Designer",
      image: "/images/creator-3.jpg",
      description: "Ведущий разработчик и дизайнер продукта с фокусом на пользовательский опыт",
    },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in relative z-10">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in-down">
          <div className="inline-flex p-4 rounded-full bg-gradient-purple-pink mb-6 animate-float">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">О проекте StylistAI</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Революционная платформа для создания идеальных образов с помощью искусственного интеллекта
          </p>
        </div>

        {/* Mission */}
        <Card className="p-8 mb-12 bg-card/50 backdrop-blur-sm border-border animate-scale-in">
          <h2 className="text-2xl font-bold text-white mb-4">Наша миссия</h2>
          <p className="text-purple-100 leading-relaxed mb-4">
            Мы создали StylistAI, чтобы сделать профессиональные стилистические рекомендации доступными каждому. Наша
            платформа использует передовые технологии искусственного интеллекта для анализа вашего стиля и
            предоставления персонализированных советов.
          </p>
          <p className="text-purple-100 leading-relaxed">
            Независимо от того, ищете ли вы образ для важной встречи, повседневный лук или вечерний наряд — StylistAI
            поможет вам выглядеть на все сто.
          </p>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-gradient-purple-pink group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-purple-200 text-sm">{feature.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mb-8">
          <div className="text-center mb-12 animate-fade-in-down">
            <h2 className="text-3xl font-bold text-white mb-4">О создателях</h2>
            <p className="text-purple-200 max-w-3xl mx-auto leading-relaxed">
              StylistAI был создан командой энтузиастов, объединивших опыт в области искусственного интеллекта, дизайна
              и модной индустрии. Наша история началась в 2023 году, когда мы поняли, что технологии могут сделать
              профессиональные стилистические советы доступными каждому. Сегодня мы продолжаем развивать платформу,
              добавляя новые функции и улучшая алгоритмы на основе отзывов пользователей.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {creators.map((creator, index) => {
              return (
                <Card
                  key={index}
                  className="overflow-hidden bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] animate-fade-in-up group"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative h-[500px] overflow-hidden">
                    <Image
                      src={creator.image || "/placeholder.svg"}
                      alt={`${creator.name} - ${creator.role}`}
                      fill
                      className={`object-contain transition-transform duration-500 group-hover:scale-110 ${
                        creator.rotate ? "rotate-90" : ""
                      }`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-bold mb-1">{creator.name}</h3>
                      <p className="text-sm text-primary font-medium">{creator.role}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-muted-foreground text-sm leading-relaxed">{creator.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
