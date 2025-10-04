"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shirt, Trash2, ShoppingBag, Watch, Sparkles } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import Link from "next/link"

interface WardrobeItem {
  id: string
  name: string
  description: string
  category: "Верх" | "Низ" | "Обувь" | "Аксессуары" | "Полные образы"
  image?: string
  addedAt: number
}

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("Все")

  const categories = ["Все", "Верх", "Низ", "Обувь", "Аксессуары", "Полные образы"]

  useEffect(() => {
    const stored = localStorage.getItem("wardrobe")
    if (stored) {
      setItems(JSON.parse(stored))
    }
  }, [])

  const removeItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id)
    setItems(updated)
    localStorage.setItem("wardrobe", JSON.stringify(updated))
    toast.success("Удалено из гардероба", {
      className: "animate-fade-in",
    })
  }

  const filteredItems = activeCategory === "Все" ? items : items.filter((item) => item.category === activeCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Верх":
        return Shirt
      case "Низ":
        return ShoppingBag
      case "Обувь":
        return ShoppingBag
      case "Аксессуары":
        return Watch
      default:
        return Sparkles
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navigation />

      <div className="container mx-auto px-4 py-8 animate-fade-in relative z-10">
        <div className="mb-8 animate-fade-in-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-purple-pink animate-float shadow-lg">
                <Shirt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Мой Гардероб</h1>
                <p className="text-purple-200">Ваши сохраненные образы ({items.length})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 animate-fade-in-up">
          {categories.map((category, index) => (
            <Button
              key={category}
              onClick={() => setActiveCategory(category)}
              variant={activeCategory === category ? "default" : "outline"}
              className={`whitespace-nowrap transition-all duration-300 hover:scale-105 ${
                activeCategory === category
                  ? "bg-gradient-purple-pink text-white shadow-lg"
                  : "bg-black/30 border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {category}
            </Button>
          ))}
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => {
              const Icon = getCategoryIcon(item.category)
              return (
                <Card
                  key={item.id}
                  className="group bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] animate-fade-in-up overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Icon className="w-16 h-16 text-muted-foreground group-hover:scale-110 transition-transform duration-300" />
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 hover:scale-110"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Удалить ${item.name} из гардероба`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-300">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="p-16 text-center bg-card/50 backdrop-blur-sm border-border border-2 border-dashed animate-scale-in hover:border-primary/50 transition-all duration-300">
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 rounded-full bg-primary/10 animate-float">
                <Shirt className="w-20 h-20 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2">Ваш гардероб пуст</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Начните чат с AI или загрузите фото для анализа, чтобы найти стильные образы и сохранить их в
                  гардероб!
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <Link href="/stylist">
                  <Button className="bg-gradient-purple-pink hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg text-white">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Начать чат с AI
                  </Button>
                </Link>
                <Link href="/stylist">
                  <Button
                    variant="outline"
                    className="border-border hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 bg-transparent"
                  >
                    Анализ фото
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
