import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, User, Mail, Calendar, Edit } from "lucide-react"
import { ProfileEditForm } from "@/components/profile-edit-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: stylePrefs } = await supabase.from("style_preferences").select("*").eq("user_id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 animate-slide-up-fade">
          <Link href="/dashboard" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад к дашборду
          </Link>
        </Button>

        {/* Profile Header */}
        <div className="mb-8 animate-slide-up-fade" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Профиль</span>
          </h1>
          <p className="text-muted-foreground text-lg">Управляйте своей информацией и настройками</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Info Card */}
          <Card className="glass animate-slide-up-fade" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Личная информация</CardTitle>
                  <CardDescription>Ваши основные данные</CardDescription>
                </div>
                <Button size="icon" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary">
                  <User className="h-10 w-10 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{profile?.display_name || "Пользователь"}</h3>
                  <p className="text-sm text-muted-foreground">{profile?.bio || "Добавьте описание о себе"}</p>
                </div>
              </div>

              <div className="grid gap-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Mail className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-secondary/10">
                    <Calendar className="h-5 w-5 text-accent-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Дата регистрации</p>
                    <p className="font-medium">{new Date(user.created_at).toLocaleDateString("ru-RU")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="glass animate-slide-up-fade" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle>Редактировать профиль</CardTitle>
              <CardDescription>Обновите свою информацию</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEditForm profile={profile} userId={user.id} />
            </CardContent>
          </Card>

          {/* Style Preferences Card */}
          <Card className="glass animate-slide-up-fade" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Стилевые предпочтения</CardTitle>
                  <CardDescription>
                    {stylePrefs ? "Ваши настройки стиля" : "Настройте свои предпочтения"}
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/dashboard/style-quiz">{stylePrefs ? "Изменить" : "Настроить"}</Link>
                </Button>
              </div>
            </CardHeader>
            {stylePrefs && (
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Стиль</p>
                  <p className="font-medium capitalize">{stylePrefs.style_type}</p>
                </div>
                {stylePrefs.color_preferences && stylePrefs.color_preferences.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Любимые цвета</p>
                    <div className="flex gap-2 flex-wrap">
                      {stylePrefs.color_preferences.map((color: string) => (
                        <span
                          key={color}
                          className="px-3 py-1 rounded-full bg-accent/10 text-sm font-medium capitalize"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {stylePrefs.budget_range && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Бюджет</p>
                    <p className="font-medium capitalize">{stylePrefs.budget_range}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
