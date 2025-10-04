"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Plus, Search, Filter, Trash2, Edit2, Shirt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddItemModal } from "@/components/add-item-modal"
import { EditItemModal } from "@/components/edit-item-modal"
import { useToast } from "@/hooks/use-toast"

type WardrobeItem = {
  id: string
  user_id: string
  name: string
  category: string
  color: string
  season: string
  brand?: string
  image_url?: string
  created_at: string
}

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedSeason, setSelectedSeason] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const categories = ["all", "tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"]
  const seasons = ["all", "spring", "summer", "fall", "winter", "all-season"]

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [items, searchQuery, selectedCategory, selectedSeason])

  async function loadItems() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from("wardrobe_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error("Error loading items:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить гардероб",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function filterItems() {
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brand?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (selectedSeason !== "all") {
      filtered = filtered.filter((item) => item.season === selectedSeason)
    }

    setFilteredItems(filtered)
  }

  async function handleDelete(id: string, imageUrl?: string) {
    if (!confirm("Удалить эту вещь из гардероба?")) return

    try {
      // Delete image from Blob if exists
      if (imageUrl) {
        await fetch("/api/wardrobe/delete-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl }),
        })
      }

      // Delete from database
      const { error } = await supabase.from("wardrobe_items").delete().eq("id", id)

      if (error) throw error

      setItems(items.filter((item) => item.id !== id))
      toast({
        title: "Удалено",
        description: "Вещь удалена из гардероба",
      })
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось удалить вещь",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary bg-clip-text text-transparent">
              Мой гардероб
            </h1>
            <p className="text-muted-foreground mt-2">
              {items.length} {items.length === 1 ? "вещь" : "вещей"} в коллекции
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-accent to-accent-secondary hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить вещь
          </Button>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="w-4 h-4" />
            Фильтры
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или бренду..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Все категории" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Season filter */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season === "all" ? "Все сезоны" : season.charAt(0).toUpperCase() + season.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Shirt className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{items.length === 0 ? "Гардероб пуст" : "Ничего не найдено"}</h3>
            <p className="text-muted-foreground mb-6">
              {items.length === 0
                ? "Добавьте первую вещь в свой виртуальный гардероб"
                : "Попробуйте изменить фильтры поиска"}
            </p>
            {items.length === 0 && (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-accent to-accent-secondary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить вещь
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="glass-card overflow-hidden group hover:scale-105 transition-transform duration-300"
              >
                {/* Image */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shirt className="w-16 h-16 text-muted-foreground opacity-30" />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.image_url)}
                      className="p-2 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{item.name}</h3>
                  {item.brand && <p className="text-sm text-muted-foreground mb-2">{item.brand}</p>}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">{item.category}</span>
                    <span className="px-2 py-1 rounded-full text-xs bg-accent-secondary/10 text-accent-secondary">
                      {item.season}
                    </span>
                    <span
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor: `${item.color}20`,
                        color: item.color,
                      }}
                    >
                      {item.color}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          loadItems()
          setIsAddModalOpen(false)
        }}
      />

      {editingItem && (
        <EditItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            loadItems()
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}
