"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, Send, Instagram, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { showToast } from "./toast-notification"

export function ContactModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    showToast("success", "Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.")
    setFormData({ name: "", email: "", message: "" })
    setIsSubmitting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-ultra rounded-3xl p-8 max-w-lg w-full animate-scale-in shadow-2xl">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 hover:bg-muted/50" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent via-accent-secondary to-accent-tertiary">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold gradient-text-premium">Свяжитесь с нами</h2>
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            <a
              href="mailto:hello@stylistai.com"
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent transition-all duration-300 hover:scale-105"
            >
              <Mail className="h-5 w-5" />
              <span className="text-sm font-medium">Email</span>
            </a>
            <a
              href="https://t.me/stylistai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-accent-secondary/10 hover:bg-accent-secondary/20 text-accent-secondary transition-all duration-300 hover:scale-105"
            >
              <Send className="h-5 w-5" />
              <span className="text-sm font-medium">Telegram</span>
            </a>
            <a
              href="https://instagram.com/stylistai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-accent-tertiary/10 hover:bg-accent-tertiary/20 text-accent-tertiary transition-all duration-300 hover:scale-105"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-sm font-medium">Instagram</span>
            </a>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Ваше имя
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Иван Иванов"
                required
                className="glass"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ivan@example.com"
                required
                className="glass"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Сообщение
              </label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Расскажите, чем мы можем помочь..."
                rows={4}
                required
                className="glass resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full magnetic-premium bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary text-white border-0 shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Отправка...
                </>
              ) : (
                <>
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Отправить сообщение
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
