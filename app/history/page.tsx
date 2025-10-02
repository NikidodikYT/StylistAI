"use client"

import { MessageSquare, Camera, Heart, Clock } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

type HistoryItem = {
  id: string
  type: "chat" | "analysis" | "favorite"
  title: string
  description: string
  timestamp: Date
  image?: string
}

const mockHistory: HistoryItem[] = [
  {
    id: "1",
    type: "chat",
    title: "Консультация по летнему гардеробу",
    description: "Обсудили базовые вещи для летнего сезона и цветовую палитру",
    timestamp: new Date(2025, 1, 8, 14, 30),
  },
  {
    id: "2",
    type: "analysis",
    title: "Анализ делового образа",
    description: "Оценка 8.5/10 • Стиль: Современный минимализм",
    timestamp: new Date(2025, 1, 7, 10, 15),
    image: "/minimalist-black-outfit.jpg",
  },
  {
    id: "3",
    type: "favorite",
    title: "Добавлено в избранное",
    description: "Повседневный бежевый лук от H&M",
    timestamp: new Date(2025, 1, 6, 16, 45),
    image: "/casual-beige-outfit.jpg",
  },
  {
    id: "4",
    type: "chat",
    title: "Подбор аксессуаров",
    description: "Рекомендации по выбору сумки и обуви для офисного стиля",
    timestamp: new Date(2025, 1, 5, 11, 20),
  },
  {
    id: "5",
    type: "analysis",
    title: "Анализ уличного стиля",
    description: "Оценка 7.8/10 • Стиль: Стрит",
    timestamp: new Date(2025, 1, 4, 13, 0),
    image: "/street-style-outfit.png",
  },
]

export default function HistoryPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case "chat":
        return MessageSquare
      case "analysis":
        return Camera
      case "favorite":
        return Heart
      default:
        return Clock
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "chat":
        return "Чат"
      case "analysis":
        return "Анализ"
      case "favorite":
        return "Избранное"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen pt-16 animate-fade-in">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">История</h1>
          <p className="mt-2 text-muted-foreground">Все ваши действия и запросы в одном месте</p>
        </div>

        {mockHistory.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="История пуста"
            description="Начните использовать StylistAI, и здесь появится история ваших действий"
          />
        ) : (
          <div className="space-y-4">
            {mockHistory.map((item, index) => {
              const Icon = getIcon(item.type)
              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.image ? (
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt=""
                      className="h-20 w-20 shrink-0 rounded-lg border border-border object-cover transition-all duration-300 hover:scale-110 hover:shadow-md"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted transition-all duration-300 hover:bg-accent/10 group">
                      <Icon
                        className="h-8 w-8 text-muted-foreground transition-all duration-300 group-hover:text-accent group-hover:scale-110"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent transition-all duration-200 hover:bg-accent/20">
                            {getTypeLabel(item.type)}
                          </span>
                        </div>
                        <h3 className="mt-2 font-semibold transition-colors duration-200 hover:text-accent">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>

                    <time className="mt-2 block text-xs text-muted-foreground transition-colors duration-200 hover:text-accent">
                      {item.timestamp.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
