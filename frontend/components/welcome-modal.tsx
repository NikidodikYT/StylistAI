"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Shield } from "lucide-react"

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    const hasAccepted = localStorage.getItem("privacy-accepted")
    if (!hasAccepted) {
      setIsOpen(true)
    }
  }, [])

  const handleAccept = () => {
    if (accepted) {
      localStorage.setItem("privacy-accepted", "true")
      setIsOpen(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <Card className="max-w-2xl mx-4 p-8 bg-gradient-to-br from-[#0f1f3a] to-[#0a1628] border-cyan-500/30 shadow-2xl animate-scale-in">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-cyan-500/20 animate-float">
              <Sparkles className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Добро пожаловать в StylistAI!</h2>
              <p className="text-cyan-400 text-sm mt-1">Ваш персональный AI-стилист</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Что мы предлагаем:
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Персональные рекомендации по стилю на основе AI</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Анализ вашего гардероба и подбор образов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Каталог готовых луков для любого случая</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">✓</span>
                <span>Сохранение избранных образов</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <h3 className="text-lg font-semibold text-white mb-2">Политика конфиденциальности</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Мы ценим вашу конфиденциальность. Все данные обрабатываются в соответствии с GDPR. Мы используем cookies
              для улучшения работы сайта и персонализации рекомендаций. Ваши фотографии и данные не передаются третьим
              лицам и используются только для генерации стилистических рекомендаций.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Checkbox
              id="accept"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked as boolean)}
              className="mt-1 border-amber-500/50 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
            />
            <label htmlFor="accept" className="text-sm text-gray-300 cursor-pointer leading-relaxed">
              Я принимаю политику конфиденциальности и даю согласие на обработку персональных данных. Я понимаю, что без
              принятия этих условий я не смогу пользоваться сервисом.
            </label>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleAccept}
            disabled={!accepted}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] group"
          >
            <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
            Начать пользоваться
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Нажимая кнопку, вы подтверждаете, что прочитали и согласны с условиями
        </p>
      </Card>
    </div>
  )
}
