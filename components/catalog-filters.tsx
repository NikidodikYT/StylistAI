"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

type Filters = {
  style: string
  season: string
  priceRange: string
  color: string
}

type CatalogFiltersProps = {
  filters: Filters
  setFilters: (filters: Filters) => void
}

export function CatalogFilters({ filters, setFilters }: CatalogFiltersProps) {
  const styles = ["all", "Минимализм", "Кэжуал", "Деловой", "Стрит", "Романтика", "Спорт", "Бохо"]
  const seasons = ["all", "Весна", "Лето", "Осень", "Зима", "Межсезонье"]
  const priceRanges = [
    { value: "all", label: "Все цены" },
    { value: "budget", label: "До 5 000 ₽" },
    { value: "mid", label: "5 000 - 15 000 ₽" },
    { value: "premium", label: "От 15 000 ₽" },
  ]
  const colors = [
    { value: "all", label: "Все цвета", color: "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" },
    { value: "Черный", label: "Черный", color: "bg-black" },
    { value: "Белый", label: "Белый", color: "bg-white border-2 border-border" },
    { value: "Серый", label: "Серый", color: "bg-gray-500" },
    { value: "Бежевый", label: "Бежевый", color: "bg-amber-200" },
    { value: "Синий", label: "Синий", color: "bg-blue-600" },
    { value: "Красный", label: "Красный", color: "bg-red-600" },
    { value: "Зеленый", label: "Зеленый", color: "bg-green-600" },
    { value: "Розовый", label: "Розовый", color: "bg-pink-400" },
  ]

  const activeFiltersCount = Object.values(filters).filter((v) => v !== "all").length

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-lg transition-all duration-300 hover:border-accent/50 hover:shadow-xl animate-fade-in-scale">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Фильтры</h2>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ style: "all", season: "all", priceRange: "all", color: "all" })}
            className="gap-2 text-xs transition-all duration-300 hover:bg-accent/10 hover:text-accent"
          >
            <X className="h-3 w-3" />
            Сбросить ({activeFiltersCount})
          </Button>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Стиль</h3>
        <div className="flex flex-wrap gap-2">
          {styles.map((style, index) => (
            <Button
              key={style}
              variant={filters.style === style ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, style })}
              className="transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {style === "all" ? "Все стили" : style}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Цвет</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((colorOption, index) => (
            <button
              key={colorOption.value}
              onClick={() => setFilters({ ...filters, color: colorOption.value })}
              className={`group relative flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in ${
                filters.color === colorOption.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-background hover:border-accent/50"
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
              aria-label={`Фильтр по цвету: ${colorOption.label}`}
            >
              <div className={`h-5 w-5 rounded-full ${colorOption.color} shadow-sm`} />
              <span>{colorOption.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Сезон</h3>
        <div className="flex flex-wrap gap-2">
          {seasons.map((season, index) => (
            <Button
              key={season}
              variant={filters.season === season ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, season })}
              className="transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {season === "all" ? "Все сезоны" : season}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Цена</h3>
        <div className="flex flex-wrap gap-2">
          {priceRanges.map((range, index) => (
            <Button
              key={range.value}
              variant={filters.priceRange === range.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilters({ ...filters, priceRange: range.value })}
              className="transition-all duration-300 hover:scale-105 hover:shadow-md animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
