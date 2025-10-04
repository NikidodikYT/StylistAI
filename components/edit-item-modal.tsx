"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

type EditItemModalProps = {
  item: WardrobeItem
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditItemModal({ item, isOpen, onClose, onSuccess }: EditItemModalProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(item.image_url || null)
  const [formData, setFormData] = useState({
    name: item.name,
    category: item.category,
    color: item.color,
    season: item.season,
    brand: item.brand || "",
  })
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const categories = ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"]
  const seasons = ["spring", "summer", "fall", "winter", "all-season"]

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = item.image_url

      // Upload new image if provided
      if (imageFile) {
        setUploading(true)

        // Delete old image if exists
        if (item.image_url) {
          await fetch("/api/wardrobe/delete-image", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: item.image_url }),
          })
        }

        // Upload new image
        const formDataUpload = new FormData()
        formDataUpload.append("file", imageFile)

        const response = await fetch("/api/wardrobe/upload", {
          method: "POST",
          body: formDataUpload,
        })

        if (!response.ok) throw new Error("Failed to upload image")
        const data = await response.json()
        imageUrl = data.url
        setUploading(false)
      }

      // Update in database
      const { error } = await supabase
        .from("wardrobe_items")
        .update({
          name: formData.name,
          category: formData.category,
          color: formData.color,
          season: formData.season,
          brand: formData.brand || null,
          image_url: imageUrl,
        })
        .eq("id", item.id)

      if (error) throw error

      toast({
        title: "Успешно!",
        description: "Вещь обновлена",
      })

      onSuccess()
    } catch (error) {
      console.error("Error updating item:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось обновить вещь",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Редактировать вещь</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Фото</label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="absolute top-2 right-2 p-2 bg-background rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Нажмите для загрузки фото</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG до 10MB</p>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Название <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Белая рубашка"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Категория <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Цвет <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-12 w-20 rounded-lg cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Season */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Сезон <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {seasons.map((season) => (
                <option key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium mb-2">Бренд</label>
            <Input
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Например: Zara"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-accent to-accent-secondary"
              disabled={loading || uploading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? "Загрузка фото..." : "Сохранение..."}
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
