"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MessageSquare, Send, Phone, Clock, Instagram } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function ContactsPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setFormData({ name: "", email: "", message: "" })
      toast.success("Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-dark-purple">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="orb-1 absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="orb-2 absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in relative z-10">
        <div className="mb-12 text-center animate-fade-in-down">
          <div className="inline-flex p-4 rounded-full bg-gradient-purple-pink mb-6 animate-float">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Давайте поговорим!</h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Мы реальные люди, которые любят помогать. Напишите нам о чём угодно — мы всегда рады общению!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-8 bg-black/30 backdrop-blur-sm border-purple-500/30 animate-scale-in hover:border-pink-400/50 transition-all duration-300">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-pink-400" />
              Напишите нам
            </h2>
            <p className="text-purple-200 mb-6">Мы отвечаем обычно в течение нескольких часов</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Ваше имя"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-purple-900/20 border-purple-500/30 focus:border-pink-400 text-white placeholder:text-purple-300/50 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-purple-900/20 border-purple-500/30 focus:border-pink-400 text-white placeholder:text-purple-300/50 transition-all duration-300"
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Ваше сообщение"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="bg-purple-900/20 border-purple-500/30 focus:border-pink-400 text-white placeholder:text-purple-300/50 min-h-[150px] transition-all duration-300"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full group bg-pink-400 hover:bg-pink-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(249,65,157,0.5)]"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    Отправить
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div className="space-y-6 animate-fade-in-up animate-delay-200">
            <Card className="p-6 bg-black/30 backdrop-blur-sm border-purple-500/30 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gradient-purple-pink group-hover:scale-110 transition-all duration-300">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                  <p className="text-purple-200">support@stylistai.com</p>
                  <p className="text-sm text-purple-200 mt-1">Пишите в любое время!</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-black/30 backdrop-blur-sm border-pink-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gradient-purple-pink group-hover:scale-110 transition-all duration-300">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Телефон</h3>
                  <p className="text-purple-200">+7 (999) 123-45-67</p>
                  <p className="text-sm text-purple-200 mt-1">Звоните с 9:00 до 21:00 МСК</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-black/30 backdrop-blur-sm border-amber-500/30 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gradient-purple-pink group-hover:scale-110 transition-all duration-300">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Социальные сети</h3>
                  <div className="space-y-1 text-purple-200">
                    <p className="hover:text-pink-400 transition-colors cursor-pointer">Instagram: @stylistai</p>
                    <p className="hover:text-cyan-400 transition-colors cursor-pointer">Telegram: @stylistai_bot</p>
                    <p className="hover:text-blue-400 transition-colors cursor-pointer">VK: vk.com/stylistai</p>
                  </div>
                  <p className="text-sm text-purple-200 mt-2">Следите за нашими обновлениями!</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-black/30 backdrop-blur-sm border-amber-500/30 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 group">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gradient-purple-pink group-hover:scale-110 transition-all duration-300">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Время работы</h3>
                  <p className="text-purple-200">Поддержка 24/7</p>
                  <p className="text-sm text-purple-200 mt-1">Мы здесь для вас в любое время дня и ночи</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Card className="mt-12 p-8 text-center bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-purple-500/30 animate-fade-in-up animate-delay-400">
          <h3 className="text-2xl font-bold text-white mb-3">Мы любим обратную связь!</h3>
          <p className="text-purple-200 max-w-2xl mx-auto">
            Ваше мнение помогает нам становиться лучше. Не стесняйтесь делиться идеями, предложениями или просто
            рассказать, как прошёл ваш день. Мы всегда рады услышать от вас!
          </p>
        </Card>
      </div>
    </div>
  )
}
