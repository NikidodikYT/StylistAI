"use client"

import { useState } from "react"
import { Star } from "lucide-react"

type RatingStarsProps = {
  rating: number
  onRate?: (rating: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
}

export function RatingStars({ rating, onRate, readonly = false, size = "md" }: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  const handleClick = (value: number) => {
    if (!readonly && onRate) {
      onRate(value)
    }
  }

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= (hoverRating || rating)
        return (
          <button
            key={value}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoverRating(value)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`transition-all duration-200 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
            aria-label={`Оценить ${value} из 5`}
          >
            <Star
              className={`${sizeClasses[size]} transition-all duration-200 ${
                isFilled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
