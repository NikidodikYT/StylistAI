"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, Send, Camera, X, Wand2, Shirt, Palette, Heart, Upload, CheckCircle, TrendingUp } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { toast } from "sonner"

interface Message {
  role: "user" | "assistant"
  content: string
  image?: string
  analysis?: {
    styleType: string
    colorPalette: string[]
    recommendations: string[]
    score: number
  }
}

export default function StylistPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Привет! Я ваш AI-стилист. Напишите вопрос о стиле или загрузите фото для анализа!",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const saveToWardrobe = (content: string, image?: string, analysis?: Message["analysis"]) => {
    const wardrobeItem = {
      id: Date.now().toString(),
      name: analysis?.styleType || "AI Рекомендация",
      description: content,
      category: "Полные образы" as const,
      image: image,
      addedAt: Date.now(),
    }

    const existing = JSON.parse(localStorage.getItem("wardrobe") || "[]")
    existing.push(wardrobeItem)
    localStorage.setItem("wardrobe", JSON.stringify(existing))

    toast.success("Добавлено в гардероб!", {
      className: "animate-fade-in",
      action: {
        label: "Открыть",
        onClick: () => (window.location.href = "/wardrobe"),
      },
    })
  }

  const handleImageSelect = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result as string)
      toast.success("Фото загружено! Отправьте для анализа")
    }
    reader.readAsDataURL(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleImageSelect(file)
    } else {
      toast.error("Пожалуйста, загрузите изображение")
    }
  }

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return

    const userMessage = input || "Проанализируй это фото"
    const userImage = selectedImage
    setInput("")
    setSelectedImage(null)

    setMessages((prev) => [...prev, { role: "user", content: userMessage, image: userImage || undefined }])
    setIsLoading(true)

    setTimeout(() => {
      if (userImage) {
        // Photo analysis response
        const styles = [
          "Современный минимализм",
          "Классический элегантный",
          "Casual шик",
          "Романтический стиль",
          "Уличная мода",
        ]

        const recommendations = [
          "Добавьте структурированный блейзер для завершенности образа",
          "Попробуйте монохромные сочетания для создания элегантного силуэта",
          "Экспериментируйте с многослойностью для добавления глубины",
          "Используйте аксессуары для создания акцентов",
          "Обратите внимание на качество тканей - это основа стиля",
        ]

        const analysis = {
          styleType: styles[Math.floor(Math.random() * styles.length)],
          colorPalette: ["#2A1B3D", "#D83FB7", "#44318D", "#E98074", "#A4B3B6"],
          recommendations: recommendations.slice(0, 3),
          score: Math.floor(Math.random() * 20) + 80,
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Анализ завершен! Ваш стиль: ${analysis.styleType}. Оценка: ${analysis.score}/100`,
            analysis,
          },
        ])
      } else {
        // Text chat response
        const responses = [
          "Отличный выбор! Я рекомендую сочетать это с нейтральными тонами и добавить яркий аксессуар для акцента.",
          "Ваш стиль выглядит современно! Попробуйте добавить многослойность для создания глубины образа.",
          "Прекрасное сочетание цветов! Рекомендую дополнить образ минималистичными украшениями.",
          "Этот образ идеально подходит для повседневной носки. Можно добавить структурированную сумку для завершенности.",
        ]
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: responses[Math.floor(Math.random() * responses.length)],
          },
        ])
      }
      setIsLoading(false)
    }, 2000)
  }

  const quickActions = [
    { icon: Shirt, text: "Образ для офиса", prompt: "Подбери мне образ для офиса" },
    { icon: Palette, text: "Подбор цветов", prompt: "Какие цвета мне подходят?" },
    { icon: Wand2, text: "Вечерний образ", prompt: "Вечерний образ для свидания" },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in relative z-10">
        <div className="mb-8 animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-purple-pink animate-float shadow-lg">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Стилист</h1>
              <p className="text-muted-foreground">Чат с AI или анализ фото - все в одном месте</p>
            </div>
          </div>
        </div>

        <Card
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-4 p-6 min-h-[500px] max-h-[600px] overflow-y-auto bg-card/50 backdrop-blur-sm border-border animate-scale-in hover:shadow-lg transition-all duration-300 ${
            isDragging ? "border-primary border-2 bg-primary/5" : ""
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm rounded-lg z-10">
              <div className="text-center">
                <Upload className="h-12 w-12 text-primary mx-auto mb-2 animate-bounce" />
                <p className="text-lg font-semibold text-primary">Отпустите для загрузки</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    message.role === "user"
                      ? "bg-gradient-purple-pink text-white ml-auto shadow-lg hover:shadow-xl"
                      : "bg-muted/50 backdrop-blur-sm border border-border"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image || "/placeholder.svg"}
                      alt="Uploaded"
                      className="rounded-lg mb-3 max-w-full h-auto shadow-md"
                    />
                  )}
                  <p className="mb-2">{message.content}</p>

                  {message.analysis && (
                    <div className="mt-4 space-y-3 border-t border-border/50 pt-3">
                      <div className="flex items-center gap-2">
                        <Shirt className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold">Стиль: {message.analysis.styleType}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Palette className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">Палитра:</span>
                        </div>
                        <div className="flex gap-1">
                          {message.analysis.colorPalette.map((color, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">Рекомендации:</span>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {message.analysis.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {message.role === "assistant" && index > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => saveToWardrobe(message.content, message.image, message.analysis)}
                      className="mt-3 w-full bg-gradient-purple-pink/10 hover:bg-gradient-purple-pink/20 text-primary border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105"
                    >
                      <Heart className="mr-2 h-3 w-3" />В гардероб
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-muted/50 backdrop-blur-sm border border-border p-4 rounded-2xl">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </Card>

        {selectedImage && (
          <Card className="mb-4 p-4 bg-card/50 backdrop-blur-sm border-border animate-scale-in">
            <div className="flex items-center gap-3">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg shadow-md"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">Фото готово к отправке</p>
                <p className="text-xs text-muted-foreground">Нажмите отправить для анализа</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedImage(null)}
                className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        <div className="flex gap-2 animate-fade-in-up animate-delay-200">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
          <Button
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-105"
            title="Загрузить фото"
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Напишите вопрос или перетащите фото сюда..."
            className="flex-1 bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-all duration-300"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading}
            className="group bg-gradient-purple-pink hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg text-white min-w-[120px]"
          >
            {selectedImage ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                Анализировать
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                Отправить
              </>
            )}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 animate-fade-in-up animate-delay-300">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInput(action.prompt)}
              className="group hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-105"
            >
              <action.icon className="h-3 w-3 mr-2 transition-transform duration-300 group-hover:rotate-12" />
              {action.text}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
