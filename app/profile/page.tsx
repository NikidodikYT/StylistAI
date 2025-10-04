"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navigation } from "@/components/navigation"
import { AnimatedBackground } from "@/components/animated-background"
import { User, Mail, Calendar, Save, Edit2 } from "lucide-react"
import { toast } from "sonner"

interface UserProfile {
  name: string
  email: string
  joinDate: string
  preferences: {
    style: string
    colors: string[]
    occasions: string[]
  }
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: "Пользователь",
    email: "user@example.com",
    joinDate: new Date().toISOString(),
    preferences: {
      style: "Современный минимализм",
      colors: ["Черный", "Белый", "Серый"],
      occasions: ["Офис", "Повседневный", "Вечерний"],
    },
  })

  useEffect(() => {
    const saved = localStorage.getItem("user-profile")
    if (saved) {
      setProfile(JSON.parse(saved))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("user-profile", JSON.stringify(profile))
    setIsEditing(false)
    toast.success("Профиль сохранен!")
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in relative z-10">
        <div className="mb-8 flex items-center justify-between animate-fade-in-down">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-purple-pink animate-float shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Профиль</h1>
              <p className="text-muted-foreground">Управляйте своими данными и предпочтениями</p>
            </div>
          </div>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="bg-gradient-purple-pink hover:opacity-90 text-white"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </>
            ) : (
              <>
                <Edit2 className="h-4 w-4 mr-2" />
                Редактировать
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border animate-scale-in">
            <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-primary" />
                  Имя
                </Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditing}
                  className="bg-background"
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  disabled={!isEditing}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Дата регистрации
                </Label>
                <Input value={new Date(profile.joinDate).toLocaleDateString("ru-RU")} disabled className="bg-muted" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border animate-scale-in animate-delay-100">
            <h2 className="text-xl font-semibold mb-4">Стилистические предпочтения</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="style" className="mb-2 block">
                  Предпочитаемый стиль
                </Label>
                <Input
                  id="style"
                  value={profile.preferences.style}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, style: e.target.value },
                    })
                  }
                  disabled={!isEditing}
                  className="bg-background"
                />
              </div>
              <div>
                <Label className="mb-2 block">Любимые цвета</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.preferences.colors.map((color, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Типичные случаи</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.preferences.occasions.map((occasion, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm border border-purple-500/20"
                    >
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
