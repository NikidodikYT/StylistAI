"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, CheckCircle2, X } from "lucide-react"
import { EmptyState } from "@/components/empty-state"

type AnalysisResult = {
  style: string
  colors: string[]
  recommendations: string[]
  rating: number
}

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setResult(null)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleAnalyze = async () => {
    if (!selectedFile) return

    setIsAnalyzing(true)

    // Simulate AI analysis
    setTimeout(() => {
      setResult({
        style: "Современный минимализм",
        colors: ["Черный", "Белый", "Серый", "Бежевый"],
        recommendations: [
          "Добавьте яркий акцент — например, красную сумку или шарф",
          "Попробуйте заменить кроссовки на классические ботинки",
          "Рассмотрите многослойность — добавьте легкий кардиган",
          "Аксессуары помогут завершить образ — часы или минималистичные украшения",
        ],
        rating: 8.5,
      })
      setIsAnalyzing(false)
    }, 2000)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
  }

  return (
    <div className="min-h-screen pt-16 animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Анализ фото</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Загрузите фото вашего образа и получите профессиональные рекомендации от AI
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Area */}
          <div className="space-y-6">
            {!preview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`flex min-h-[400px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${
                  isDragging
                    ? "border-accent bg-accent/10 scale-105 shadow-lg shadow-accent/20"
                    : "border-border hover:border-accent/50 hover:bg-accent/5"
                }`}
              >
                <label htmlFor="file-upload" className="flex cursor-pointer flex-col items-center">
                  <div
                    className={`rounded-full bg-muted p-6 transition-all duration-300 ${isDragging ? "scale-110 bg-accent/20" : ""}`}
                  >
                    <Upload
                      className={`h-12 w-12 text-muted-foreground transition-all duration-300 ${isDragging ? "text-accent" : ""}`}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-6 text-lg font-medium">Перетащите фото сюда</p>
                  <p className="mt-2 text-sm text-muted-foreground">или нажмите для выбора файла</p>
                  <p className="mt-4 text-xs text-muted-foreground">PNG, JPG, WEBP до 10MB</p>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                    aria-label="Выбрать файл"
                  />
                </label>
              </div>
            ) : (
              <div className="relative animate-fade-in-scale">
                <img
                  src={preview || "/placeholder.svg"}
                  alt="Предпросмотр"
                  className="w-full rounded-2xl border border-border object-cover shadow-lg transition-transform duration-300 hover:scale-[1.02]"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute right-4 top-4 transition-all duration-200 hover:scale-110"
                  onClick={handleReset}
                  aria-label="Удалить фото"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            {preview && !result && (
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105 disabled:hover:scale-100"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Анализируем...
                  </>
                ) : (
                  "Анализировать образ"
                )}
              </Button>
            )}
          </div>

          {/* Results Area */}
          <div>
            {!result ? (
              <EmptyState
                icon={CheckCircle2}
                title="Результаты появятся здесь"
                description="Загрузите фото и нажмите 'Анализировать', чтобы получить рекомендации"
              />
            ) : (
              <div className="space-y-6">
                {/* Style & Rating */}
                <div className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Определенный стиль</p>
                      <p className="mt-1 text-2xl font-semibold">{result.style}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Оценка</p>
                      <p className="mt-1 text-3xl font-bold text-accent">{result.rating}/10</p>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div
                  className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: "0.1s" }}
                >
                  <h3 className="text-lg font-semibold">Цветовая палитра</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.colors.map((color, index) => (
                      <span
                        key={color}
                        className="rounded-full bg-muted px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent/10 hover:text-accent hover:scale-105 animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div
                  className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  <h3 className="text-lg font-semibold">Рекомендации</h3>
                  <ul className="mt-4 space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="flex gap-3 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                        <span className="text-pretty leading-relaxed text-muted-foreground">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full bg-transparent transition-all duration-300 hover:bg-accent/5 hover:border-accent hover:scale-105"
                  size="lg"
                >
                  Анализировать другое фото
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
