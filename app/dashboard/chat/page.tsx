"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useChat } from "ai/react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, ImageIcon, Loader2, Sparkles, Trash2 } from "lucide-react"
import { ChatMessage } from "@/components/chat-message"
import { EmptyState } from "@/components/empty-state"
import { useToast } from "@/hooks/use-toast"

export default function ChatPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    body: {
      image: selectedImage,
    },
    onFinish: async (message) => {
      // Save assistant's response to database
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("chat_messages").insert({
          user_id: user.id,
          role: "assistant",
          content: message.content,
        })
      }
      setSelectedImage(null)
    },
    onError: (error) => {
      console.error("Chat error:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    loadChatHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadChatHistory() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) throw error

      if (data && data.length > 0) {
        const formattedMessages = data.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }))
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  async function clearHistory() {
    if (!confirm("Очистить всю историю чата?")) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("chat_messages").delete().eq("user_id", user.id)

      if (error) throw error

      setMessages([])
      toast({
        title: "Успешно",
        description: "История чата очищена",
      })
    } catch (error) {
      console.error("Error clearing history:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось очистить историю",
        variant: "destructive",
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() && !selectedImage) return
    handleSubmit(e)
  }

  if (loadingHistory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent" />
              AI-Стилист
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Персональный помощник по стилю и моде</p>
          </div>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              Очистить
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {messages.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Начните диалог с AI-стилистом"
              description="Задайте вопрос о стиле, попросите совет по образу или отправьте фото для анализа"
            />
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={message.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <ChatMessage
                    message={{
                      id: message.id,
                      role: message.role,
                      content: message.content,
                      timestamp: new Date(),
                    }}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground animate-fade-in">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-sm">AI-стилист думает...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background/95 backdrop-blur-xl shadow-lg">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
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
                onChange={handleInputChange}
                placeholder="Напишите сообщение..."
                className="min-h-[48px] max-h-32 resize-none transition-all duration-200 focus:border-accent"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    onSubmit(e as any)
                  }
                }}
              />

              <Button
                type="submit"
                size="icon"
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="bg-gradient-to-r from-accent to-accent-secondary transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 disabled:hover:scale-100"
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
