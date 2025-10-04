"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react"

const STYLE_TYPES = [
  { value: "casual", label: "Casual", description: "Удобный повседневный стиль" },
  { value: "formal", label: "Formal", description: "Деловой и элегантный" },
  { value: "streetwear", label: "Streetwear", description: "Уличная мода" },
  { value: "minimalist", label: "Minimalist", description: "Минимализм и простота" },
  { value: "bohemian", label: "Bohemian", description: "Богемный и свободный" },
  { value: "classic", label: "Classic", description: "Классический и вневременной" },
]

const COLORS = [
  { value: "black", label: "Черный" },
  { value: "white", label: "Белый" },
  { value: "gray", label: "Серый" },
  { value: "blue", label: "Синий" },
  { value: "red", label: "Красный" },
  { value: "green", label: "Зеленый" },
  { value: "beige", label: "Бежевый" },
  { value: "brown", label: "Коричневый" },
]

const SEASONS = [
  { value: "spring", label: "Весна" },
  { value: "summer", label: "Лето" },
  { value: "fall", label: "Осень" },
  { value: "winter", label: "Зима" },
]

const BUDGET_RANGES = [
  { value: "low", label: "Эконом", description: "До 5000₽" },
  { value: "medium", label: "Средний", description: "5000₽ - 15000₽" },
  { value: "high", label: "Премиум", description: "От 15000₽" },
]

export default function StyleQuizPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    style_type: "",
    color_preferences: [] as string[],
    season_preferences: [] as string[],
    budget_range: "",
    body_type: "",
  })

  const handleColorToggle = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      color_preferences: prev.color_preferences.includes(color)
        ? prev.color_preferences.filter((c) => c !== color)
        : [...prev.color_preferences, color],
    }))
  }

  const handleSeasonToggle = (season: string) => {
    setFormData((prev) => ({
      ...prev,
      season_preferences: prev.season_preferences.includes(season)
        ? prev.season_preferences.filter((s) => s !== season)
        : [...prev.season_preferences, season],
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Пользователь не авторизован")

      // Check if preferences already exist
      const { data: existing } = await supabase.from("style_preferences").select("id").eq("user_id", user.id).single()

      if (existing) {
        // Update existing preferences
        const { error } = await supabase
          .from("style_preferences")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)

        if (error) throw error
      } else {
        // Insert new preferences
        const { error } = await supabase.from("style_preferences").insert({
          user_id: user.id,
          ...formData,
        })

        if (error) throw error
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Произошла ошибка")
    } finally {
      setIsLoading(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.style_type !== ""
      case 2:
        return formData.color_preferences.length > 0
      case 3:
        return formData.season_preferences.length > 0
      case 4:
        return formData.budget_range !== ""
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 animate-slide-up-fade">
          <Link href="/dashboard" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Link>
        </Button>

        <Card className="glass-strong animate-slide-up-fade" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary">
                <Sparkles className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Тест стиля</CardTitle>
                <CardDescription>
                  Шаг {step} из 4 - {step === 1 && "Выберите стиль"}
                  {step === 2 && "Любимые цвета"}
                  {step === 3 && "Сезоны"}
                  {step === 4 && "Бюджет"}
                </CardDescription>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Style Type */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <Label className="text-lg font-semibold">Какой стиль вам ближе?</Label>
                <RadioGroup
                  value={formData.style_type}
                  onValueChange={(value) => setFormData({ ...formData, style_type: value })}
                >
                  <div className="grid gap-3">
                    {STYLE_TYPES.map((style) => (
                      <label
                        key={style.value}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-accent ${
                          formData.style_type === style.value
                            ? "border-accent bg-accent/5"
                            : "border-border/50 bg-background/50"
                        }`}
                      >
                        <RadioGroupItem value={style.value} className="mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold">{style.label}</p>
                          <p className="text-sm text-muted-foreground">{style.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Colors */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <Label className="text-lg font-semibold">Выберите любимые цвета (минимум 1)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {COLORS.map((color) => (
                    <label
                      key={color.value}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-accent ${
                        formData.color_preferences.includes(color.value)
                          ? "border-accent bg-accent/5"
                          : "border-border/50 bg-background/50"
                      }`}
                    >
                      <Checkbox
                        checked={formData.color_preferences.includes(color.value)}
                        onCheckedChange={() => handleColorToggle(color.value)}
                      />
                      <span className="font-medium">{color.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Seasons */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <Label className="text-lg font-semibold">Для каких сезонов подбираем образы? (минимум 1)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {SEASONS.map((season) => (
                    <label
                      key={season.value}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-accent ${
                        formData.season_preferences.includes(season.value)
                          ? "border-accent bg-accent/5"
                          : "border-border/50 bg-background/50"
                      }`}
                    >
                      <Checkbox
                        checked={formData.season_preferences.includes(season.value)}
                        onCheckedChange={() => handleSeasonToggle(season.value)}
                      />
                      <span className="font-medium">{season.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Budget */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <Label className="text-lg font-semibold">Какой у вас бюджет на одежду?</Label>
                <RadioGroup
                  value={formData.budget_range}
                  onValueChange={(value) => setFormData({ ...formData, budget_range: value })}
                >
                  <div className="grid gap-3">
                    {BUDGET_RANGES.map((budget) => (
                      <label
                        key={budget.value}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-accent ${
                          formData.budget_range === budget.value
                            ? "border-accent bg-accent/5"
                            : "border-border/50 bg-background/50"
                        }`}
                      >
                        <RadioGroupItem value={budget.value} className="mt-1" />
                        <div className="flex-1">
                          <p className="font-semibold">{budget.label}</p>
                          <p className="text-sm text-muted-foreground">{budget.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Назад
                </Button>
              )}

              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex-1">
                  Далее
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed() || isLoading} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      Завершить
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
