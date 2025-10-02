"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, ThumbsUp, ThumbsDown, Star, Share2 } from "lucide-react"
import { RatingModal } from "@/components/rating-modal"
import {
  addToFavorites,
  removeFromFavorites,
  isFavorite,
  toggleLike,
  toggleDislike,
  getLikes,
  getDislikes,
  setRating,
  getRating,
} from "@/lib/favorites"

type Outfit = {
  id: string
  image: string
  brand: string
  name: string
  price: number
  style: string
  season: string
  rating: number
}

type OutfitCardProps = {
  outfit: Outfit
  onShare?: (outfit: Outfit) => void
}

export function OutfitCard({ outfit, onShare }: OutfitCardProps) {
  const [isFav, setIsFav] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [userRating, setUserRating] = useState<number | undefined>(undefined)

  useEffect(() => {
    setIsFav(isFavorite(outfit.id))
    setIsLiked(getLikes().has(outfit.id))
    setIsDisliked(getDislikes().has(outfit.id))
    setUserRating(getRating(outfit.id))
  }, [outfit.id])

  const handleToggleFavorite = () => {
    if (isFav) {
      removeFromFavorites(outfit.id)
      setIsFav(false)
    } else {
      addToFavorites({
        id: outfit.id,
        brand: outfit.brand,
        name: outfit.name,
        price: outfit.price.toLocaleString("ru-RU") + " ₽",
        image: outfit.image,
        style: outfit.style,
        season: outfit.season,
        rating: outfit.rating,
      })
      setIsFav(true)
    }
  }

  const handleLike = () => {
    const result = toggleLike(outfit.id)
    setIsLiked(result === "liked")
    setIsDisliked(false)
  }

  const handleDislike = () => {
    const result = toggleDislike(outfit.id)
    setIsDisliked(result === "disliked")
    setIsLiked(false)
  }

  const handleRatingSubmit = (rating: number, feedback?: string) => {
    setRating(outfit.id, rating)
    setUserRating(rating)
    console.log("[v0] Rating submitted:", { outfitId: outfit.id, rating, feedback })
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-2 animate-fade-in-scale">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={outfit.image || "/placeholder.svg"}
          alt={outfit.name}
          className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-3 top-3 bg-background/90 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 ${
            isFav ? "text-red-500" : ""
          }`}
          onClick={handleToggleFavorite}
          aria-label={isFav ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Heart className={`h-5 w-5 transition-all duration-300 ${isFav ? "fill-current scale-110" : ""}`} />
        </Button>

        {onShare && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-14 bg-background/90 backdrop-blur-sm transition-all duration-300 hover:bg-background hover:scale-110 opacity-0 group-hover:opacity-100"
            onClick={() => onShare(outfit)}
            aria-label="Поделиться"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors duration-200 group-hover:text-accent">
              {outfit.brand}
            </p>
            <h3 className="mt-1 truncate text-base font-semibold transition-colors duration-200 group-hover:text-accent">
              {outfit.name}
            </h3>
          </div>

          <button
            onClick={() => setShowRatingModal(true)}
            className="flex items-center gap-1 text-sm transition-transform duration-300 hover:scale-110"
            aria-label="Оценить образ"
          >
            <Star
              className={`h-4 w-4 transition-colors duration-200 ${
                userRating ? "fill-yellow-400 text-yellow-400" : "fill-yellow-400 text-yellow-400"
              }`}
              aria-hidden="true"
            />
            <span className="font-medium">{userRating || outfit.rating}</span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold transition-colors duration-200 group-hover:text-accent">
            {outfit.price.toLocaleString("ru-RU")} ₽
          </p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="transition-colors duration-200 group-hover:text-accent">{outfit.style}</span>
            <span>•</span>
            <span className="transition-colors duration-200 group-hover:text-accent">{outfit.season}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 transition-all duration-200 ${
              isLiked ? "bg-accent/10 text-accent hover:bg-accent/20" : "hover:bg-accent/5"
            }`}
            onClick={handleLike}
            aria-label="Понравилось"
          >
            <ThumbsUp className={`h-4 w-4 mr-1.5 transition-all duration-200 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-xs font-medium">Нравится</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 transition-all duration-200 ${
              isDisliked ? "bg-muted text-muted-foreground hover:bg-muted" : "hover:bg-muted/50"
            }`}
            onClick={handleDislike}
            aria-label="Не понравилось"
          >
            <ThumbsDown className={`h-4 w-4 mr-1.5 transition-all duration-200 ${isDisliked ? "fill-current" : ""}`} />
            <span className="text-xs font-medium">Не нравится</span>
          </Button>
        </div>
      </div>

      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        outfitName={outfit.name}
      />
    </div>
  )
}
