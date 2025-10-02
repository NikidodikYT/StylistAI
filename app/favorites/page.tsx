"use client"

import { useState, useEffect } from "react"
import { Heart, Trash2 } from "lucide-react"
import { OutfitCard } from "@/components/outfit-card"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { getFavorites, removeFromFavorites, type FavoriteOutfit } from "@/lib/favorites"

type SortOption = "newest" | "oldest" | "price-high" | "price-low" | "rating"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteOutfit[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFavorites()

    const handleUpdate = () => {
      loadFavorites()
    }

    window.addEventListener("favorites-updated", handleUpdate)
    return () => window.removeEventListener("favorites-updated", handleUpdate)
  }, [])

  const loadFavorites = () => {
    setIsLoading(true)
    setTimeout(() => {
      const favs = getFavorites()
      setFavorites(favs)
      setIsLoading(false)
    }, 300)
  }

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.likedAt - a.likedAt
      case "oldest":
        return a.likedAt - b.likedAt
      case "price-high":
        return Number.parseFloat(b.price.replace(/[^\d]/g, "")) - Number.parseFloat(a.price.replace(/[^\d]/g, ""))
      case "price-low":
        return Number.parseFloat(a.price.replace(/[^\d]/g, "")) - Number.parseFloat(b.price.replace(/[^\d]/g, ""))
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })

  const handleClearAll = () => {
    if (confirm("Вы уверены, что хотите удалить все избранные образы?")) {
      favorites.forEach((fav) => removeFromFavorites(fav.id))
    }
  }

  const convertToOutfit = (fav: FavoriteOutfit) => ({
    id: fav.id,
    image: fav.image,
    brand: fav.brand,
    name: fav.name,
    price: Number.parseFloat(fav.price.replace(/[^\d]/g, "")),
    style: fav.style,
    season: fav.season,
    rating: fav.rating || 4.5,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Избранное</h1>
            <p className="mt-2 text-muted-foreground">
              {favorites.length === 0
                ? "У вас пока нет избранных образов"
                : `${favorites.length} ${favorites.length === 1 ? "образ" : favorites.length < 5 ? "образа" : "образов"}`}
            </p>
          </div>

          {favorites.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="price-high">Цена: по убыванию</option>
                <option value="price-low">Цена: по возрастанию</option>
                <option value="rating">По рейтингу</option>
              </select>

              <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-2 bg-transparent">
                <Trash2 className="h-4 w-4" />
                Очистить всё
              </Button>
            </div>
          )}
        </div>

        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Нет избранных образов"
            description="Добавляйте понравившиеся образы в избранное, нажимая на иконку сердца"
            actionLabel="Перейти в каталог"
            actionHref="/catalog"
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedFavorites.map((fav, index) => (
              <div key={fav.id} className="animate-fade-in-scale" style={{ animationDelay: `${index * 50}ms` }}>
                <OutfitCard outfit={convertToOutfit(fav)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
