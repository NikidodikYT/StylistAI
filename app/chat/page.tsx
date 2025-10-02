"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ImageIcon, Loader2 } from "lucide-react"
import { ChatMessage } from "@/components/chat-message"
import { EmptyState } from "@/components/empty-state"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  image?: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !selectedImage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      image: selectedImage || undefined,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setSelectedImage(null)
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Отличный вопрос! Я проанализировал ваш запрос и могу порекомендовать несколько стильных образов. Для создания современного минималистичного лука советую сочетать базовые вещи нейтральных оттенков с одним ярким акцентом.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col pt-16 animate-fade-in">
      <div className="border-b border-border bg-background/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-semibold tracking-tight">Чат с AI-стилистом</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Задайте вопрос о стиле, моде или попросите совет по образу
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {messages.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Начните диалог"
              description="Задайте вопрос AI-стилисту или отправьте фото для анализа"
            />
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={message.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <ChatMessage message={message} />
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-sm">AI-стилист печатает...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/95 backdrop-blur-xl shadow-lg">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {selectedImage && (
              <div className="relative inline-block animate-fade-in-scale">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Выбранное изображение"
                  className="h-20 w-20 rounded-lg border border-border object-cover shadow-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full transition-transform duration-200 hover:scale-110"
                  onClick={() => setSelectedImage(null)}
                >
                  ×
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                aria-label="Выбрать изображение"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="transition-all duration-200 hover:bg-accent/10 hover:border-accent hover:scale-105"
                aria-label="Прикрепить фото"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите сообщение..."
                className="min-h-[48px] max-h-32 resize-none transition-all duration-200 focus:border-accent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />

              <Button
                type="submit"
                size="icon"
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 disabled:hover:scale-100"
                aria-label="Отправить сообщение"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
