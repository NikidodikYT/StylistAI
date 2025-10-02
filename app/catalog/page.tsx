"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Filter } from "lucide-react"
import { OutfitCard } from "@/components/outfit-card"
import { CatalogFilters } from "@/components/catalog-filters"
import { ShareModal } from "@/components/share-modal"
import { SkeletonCard } from "@/components/skeleton-card"

type Outfit = {
  id: string
  image: string
  brand: string
  name: string
  price: number
  style: string
  season: string
  rating: number
  color: string
}

const mockOutfits: Outfit[] = [
  {
    id: "1",
    image: "/minimalist-black-outfit.jpg",
    brand: "Zara",
    name: "Минималистичный черный образ",
    price: 12500,
    style: "Минимализм",
    season: "Весна",
    rating: 4.8,
    color: "Черный",
  },
  {
    id: "2",
    image: "/casual-beige-outfit.jpg",
    brand: "H&M",
    name: "Повседневный бежевый лук",
    price: 8900,
    style: "Кэжуал",
    season: "Лето",
    rating: 4.5,
    color: "Бежевый",
  },
  {
    id: "3",
    image: "/elegant-business-outfit.jpg",
    brand: "Mango",
    name: "Элегантный деловой стиль",
    price: 15600,
    style: "Деловой",
    season: "Осень",
    rating: 4.9,
    color: "Серый",
  },
  {
    id: "4",
    image: "/street-style-outfit.png",
    brand: "Pull&Bear",
    name: "Уличный стиль с акцентами",
    price: 9800,
    style: "Стрит",
    season: "Весна",
    rating: 4.6,
    color: "Синий",
  },
  {
    id: "5",
    image: "/romantic-pastel-outfit.jpg",
    brand: "Bershka",
    name: "Романтичный пастельный образ",
    price: 7500,
    style: "Романтика",
    season: "Лето",
    rating: 4.7,
    color: "Розовый",
  },
  {
    id: "6",
    image: "/winter-cozy-outfit.jpg",
    brand: "Uniqlo",
    name: "Уютный зимний комплект",
    price: 18900,
    style: "Кэжуал",
    season: "Зима",
    rating: 4.8,
    color: "Белый",
  },
  {
    id: "7",
    image: "/sport-active-outfit.jpg",
    brand: "Nike",
    name: "Спортивный активный образ",
    price: 11200,
    style: "Спорт",
    season: "Межсезонье",
    rating: 4.4,
    color: "Черный",
  },
  {
    id: "8",
    image: "/boho-green-outfit.jpg",
    brand: "Zara",
    name: "Бохо стиль с зелеными акцентами",
    price: 13400,
    style: "Бохо",
    season: "Весна",
    rating: 4.6,
    color: "Зеленый",
  },
]

type SortOption = "popularity" | "price-low" | "price-high" | "rating"

export default function CatalogPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("popularity")
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    style: "all",
    season: "all",
    priceRange: "all",
    color: "all",
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  const filteredOutfits = mockOutfits.filter((outfit) => {
    if (filters.style !== "all" && outfit.style !== filters.style) return false
    if (filters.season !== "all" && outfit.season !== filters.season) return false
    if (filters.color !== "all" && outfit.color !== filters.color) return false

    if (filters.priceRange === "budget" && outfit.price > 5000) return false
    if (filters.priceRange === "mid" && (outfit.price < 5000 || outfit.price > 15000)) return false
    if (filters.priceRange === "premium" && outfit.price <= 15000) return false

    return true
  })

  const sortedOutfits = [...filteredOutfits].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      case "popularity":
      default:
        return b.rating - a.rating
    }
  })

  const handleShare = (outfit: Outfit) => {
    setSelectedOutfit(outfit)
    setShareModalOpen(true)
  }

  return (
    <div className="min-h-screen pt-16 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Каталог образов</h1>
            <p className="mt-2 text-muted-foreground">
              {isLoading
                ? "Загрузка..."
                : `${sortedOutfits.length} ${sortedOutfits.length === 1 ? "образ" : sortedOutfits.length < 5 ? "образа" : "образов"}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-all duration-300 hover:border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="popularity">По популярности</option>
              <option value="rating">По рейтингу</option>
              <option value="price-low">Цена: по возрастанию</option>
              <option value="price-high">Цена: по убыванию</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              disabled={isLoading}
              className="gap-2 transition-all duration-300 hover:bg-accent/10 hover:border-accent hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Filter className={`h-4 w-4 transition-transform duration-300 ${showFilters ? "rotate-180" : ""}`} />
              Фильтры
            </Button>
          </div>
        </div>

        {showFilters && !isLoading && (
          <div className="animate-slide-down">
            <CatalogFilters filters={filters} setFilters={setFilters} />
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} style={{ animationDelay: `${index * 50}ms` }}>
                  <SkeletonCard />
                </div>
              ))
            : sortedOutfits.map((outfit, index) => (
                <div key={outfit.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <OutfitCard outfit={outfit} onShare={handleShare} />
                </div>
              ))}
        </div>

        {!isLoading && sortedOutfits.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center text-center animate-fade-in-scale">
            <div className="rounded-full bg-muted p-6">
              <Heart className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-xl font-semibold">Ничего не найдено</h2>
            <p className="mt-2 max-w-md text-muted-foreground">Попробуйте изменить фильтры или сортировку</p>
          </div>
        )}
      </div>

      {selectedOutfit && (
        <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} outfit={selectedOutfit} />
      )}
    </div>
  )
}
