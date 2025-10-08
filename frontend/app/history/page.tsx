"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { History, Trash2, Calendar, MessageSquare, ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface HistoryItem {
  id: string
  type: "chat" | "analysis"
  content: string
  image?: string
  timestamp: number
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("stylist-history")
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  const deleteItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id)
    setHistory(updated)
    localStorage.setItem("stylist-history", JSON.stringify(updated))
    toast.success("Удалено из истории")
  }

  const clearAll = () => {
    setHistory([])
    localStorage.removeItem("stylist-history")
    toast.success("История очищена")
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in relative z-10">
        <div className="mb-8 flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-purple-pink animate-float shadow-lg">
              <History className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">История</h1>
              <p className="text-muted-foreground">Ваши прошлые консультации и анализы</p>
            </div>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAll}
              className="hover:bg-destructive/10 hover:text-destructive bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить все
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur-sm border-border animate-scale-in">
            <History className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">История пуста</h3>
            <p className="text-muted-foreground mb-6">Начните общаться с AI-стилистом, чтобы увидеть историю здесь</p>
            <Button
              onClick={() => (window.location.href = "/stylist")}
              className="bg-gradient-purple-pink hover:opacity-90 text-white"
            >
              Перейти к AI Стилисту
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => (
              <Card
                key={item.id}
                className="p-6 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {item.type === "chat" ? (
                      <MessageSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    {item.image && (
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt="History"
                        className="w-32 h-32 object-cover rounded-lg mb-3 shadow-md"
                      />
                    )}
                    <p className="text-sm mb-2">{item.content}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.timestamp).toLocaleString("ru-RU")}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteItem(item.id)}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
