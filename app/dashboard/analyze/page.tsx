"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Camera, Upload, Loader2, Sparkles, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type AnalysisResult = {
  description: string
  items: {
    name: string
    category: string
    color: string
    season: string
    style: string
  }[]
  suggestions: string[]
}

export default function AnalyzePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [addingToWardrobe, setAddingToWardrobe] = useState<number | null>(null)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setAnalysis(null)
      }
      reader.readAsDataURL(file)
    }
  }

  async function analyzePhoto() {
    if (!selectedImage) return

    setAnalyzing(true)
    try {
      const response = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage }),
      })

      if (!response.ok) throw new Error("Analysis failed")

      const data = await response.json()
      setAnalysis(data)
      toast({
        title: "Анализ завершен!",
        description: "Фото успешно проанализировано",
      })
    } catch (error) {
      console.error("Analysis error:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось проанализировать фото",
        variant: "destructive",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  async function addToWardrobe(item: AnalysisResult["items"][0], index: number) {
    setAddingToWardrobe(index)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Upload image to blob
      let imageUrl = null
      if (selectedImage) {
        const blob = await fetch(selectedImage).then((r) => r.blob())
        const file = new File([blob], "analyzed-item.jpg", { type: "image/jpeg" })
        const formData = new FormData()
        formData.append("file", file)

        const uploadResponse = await fetch("/api/wardrobe/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          imageUrl = uploadData.url
        }
      }

      // Add to wardrobe
      const { error } = await supabase.from("wardrobe_items").insert({
        user_id: user.id,
        name: item.name,
        category: item.category,
        color: item.color,
        season: item.season,
        image_url: imageUrl,
      })

      if (error) throw error

      toast({
        title: "Добавлено!",
        description: "Вещь добавлена в гардероб",
      })
    } catch (error) {
      console.error("Error adding to wardrobe:", error)
      toast({
        title: "Ошибка",
        description: "Не удалось добавить в гардероб",
        variant: "destructive",
      })
    } finally {
      setAddingToWardrobe(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary bg-clip-text text-transparent flex items-center gap-3">
            <Camera className="w-10 h-10 text-accent" />
            Анализ фото
          </h1>
          <p className="text-muted-foreground mt-2">
            Загрузите фото одежды или образа для AI-анализа и получите рекомендации
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="glass-card p-8">
              {!selectedImage ? (
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-accent transition-colors">
                    <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Загрузите фото</h3>
                    <p className="text-sm text-muted-foreground mb-4">Нажмите или перетащите изображение</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG до 10MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={selectedImage || "/placeholder.svg"}
                      alt="Selected"
                      className="w-full rounded-lg border border-border"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null)
                        setAnalysis(null)
                      }}
                      className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <Button
                    onClick={analyzePhoto}
                    disabled={analyzing}
                    className="w-full bg-gradient-to-r from-accent to-accent-secondary"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Анализируем...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Анализировать фото
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Советы для лучшего анализа
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Используйте четкие фото с хорошим освещением</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Снимайте одежду на однотонном фоне</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>Можно загрузить фото полного образа или отдельной вещи</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  <span>AI определит стиль, цвета и даст рекомендации</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {analysis ? (
              <>
                {/* Description */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    Общий анализ
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{analysis.description}</p>
                </div>

                {/* Detected Items */}
                {analysis.items.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-accent" />
                      Обнаруженные вещи
                    </h3>
                    <div className="space-y-4">
                      {analysis.items.map((item, index) => (
                        <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.style}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                              {item.category}
                            </span>
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
                          <Button
                            onClick={() => addToWardrobe(item, index)}
                            disabled={addingToWardrobe === index}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            {addingToWardrobe === index ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                Добавляем...
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3 mr-2" />
                                Добавить в гардероб
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      Рекомендации стилиста
                    </h3>
                    <ul className="space-y-3">
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </span>
                          <span className="text-sm text-muted-foreground leading-relaxed">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card p-12 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <h3 className="text-lg font-semibold mb-2">Загрузите фото для анализа</h3>
                <p className="text-sm text-muted-foreground">
                  AI проанализирует одежду и даст персональные рекомендации
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
