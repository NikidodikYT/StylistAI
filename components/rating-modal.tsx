"use client"

import { useState } from "react"
import { X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RatingStars } from "@/components/rating-stars"

type RatingModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, feedback?: string) => void
  outfitName: string
}

export function RatingModal({ isOpen, onClose, onSubmit, outfitName }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")

  if (!isOpen) return null

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback)
      setRating(0)
      setFeedback("")
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 transition-colors hover:bg-muted"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <Star className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-bold">Оцените рекомендацию</h2>
          </div>
          <p className="text-sm text-muted-foreground">Как вам понравился образ "{outfitName}"?</p>
        </div>

        <div className="mb-6 flex justify-center">
          <RatingStars rating={rating} onRate={setRating} size="lg" />
        </div>

        <div className="mb-6">
          <label htmlFor="feedback" className="mb-2 block text-sm font-medium">
            Комментарий (необязательно)
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Поделитесь своим мнением..."
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0} className="flex-1">
            Отправить оценку
          </Button>
        </div>
      </div>
    </div>
  )
}
