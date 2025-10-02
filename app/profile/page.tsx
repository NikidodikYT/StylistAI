"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Bell, Moon, Sun, LogOut, Save } from "lucide-react"
import { useTheme } from "next-themes"

export default function ProfilePage() {
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState("Анна Иванова")
  const [email, setEmail] = useState("anna@example.com")
  const [notifications, setNotifications] = useState(true)

  const handleSave = () => {
    // Save profile logic here
    alert("Профиль сохранен!")
  }

  return (
    <div className="min-h-screen pt-16 animate-fade-in">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Профиль</h1>
          <p className="mt-2 text-muted-foreground">Управляйте своими настройками и предпочтениями</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg animate-fade-in">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/20 transition-all duration-300 hover:scale-110">
                <User className="h-10 w-10" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Личная информация</h2>
                <p className="text-sm text-muted-foreground">Обновите свои данные</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите имя"
                  className="transition-all duration-200 focus:border-accent focus:shadow-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите email"
                  className="transition-all duration-200 focus:border-accent focus:shadow-md"
                />
              </div>

              <Button
                onClick={handleSave}
                className="w-full gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105"
              >
                <Save className="h-4 w-4" />
                Сохранить изменения
              </Button>
            </div>
          </div>

          <div
            className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="mb-4 flex items-center gap-3">
              {theme === "dark" ? (
                <Moon
                  className="h-6 w-6 text-accent transition-transform duration-300 hover:rotate-12"
                  aria-hidden="true"
                />
              ) : (
                <Sun
                  className="h-6 w-6 text-accent transition-transform duration-300 hover:rotate-90"
                  aria-hidden="true"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">Тема оформления</h2>
                <p className="text-sm text-muted-foreground">Выберите светлую или темную тему</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex-1 gap-2 transition-all duration-300 hover:scale-105"
              >
                <Sun className="h-4 w-4" />
                Светлая
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex-1 gap-2 transition-all duration-300 hover:scale-105"
              >
                <Moon className="h-4 w-4" />
                Темная
              </Button>
            </div>
          </div>

          <div
            className="rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell
                  className="h-6 w-6 text-accent transition-transform duration-300 hover:rotate-12"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-xl font-semibold">Уведомления</h2>
                  <p className="text-sm text-muted-foreground">Получайте новости и рекомендации</p>
                </div>
              </div>

              <Button
                variant={notifications ? "default" : "outline"}
                onClick={() => setNotifications(!notifications)}
                className="transition-all duration-300 hover:scale-105"
              >
                {notifications ? "Включены" : "Выключены"}
              </Button>
            </div>
          </div>

          <div
            className="rounded-2xl border border-destructive/50 bg-card p-6 transition-all duration-300 hover:border-destructive hover:shadow-lg hover:shadow-destructive/10 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogOut
                  className="h-6 w-6 text-destructive transition-transform duration-300 hover:-translate-x-1"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="text-xl font-semibold">Выход из аккаунта</h2>
                  <p className="text-sm text-muted-foreground">Завершить текущий сеанс</p>
                </div>
              </div>

              <Button variant="destructive" className="transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
