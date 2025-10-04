import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Sparkles, Shirt, MessageSquare, Camera, TrendingUp, Heart, Settings, LogOut, Palette } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch wardrobe count
  const { count: wardrobeCount } = await supabase
    .from("wardrobe_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Fetch outfits count
  const { count: outfitsCount } = await supabase
    .from("outfits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Check if user has style preferences
  const { data: stylePrefs } = await supabase.from("style_preferences").select("*").eq("user_id", user.id).single()

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="glass-strong border-b border-border/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary">
                <Sparkles className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">StylistAI</h1>
                <p className="text-xs text-muted-foreground">Ваш AI-стилист</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/profile">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
              <form action={handleSignOut}>
                <Button variant="ghost" size="icon" type="submit">
                  <LogOut className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up-fade">
          <h2 className="text-4xl font-bold mb-2">
            Привет, <span className="gradient-text">{profile?.display_name || "Стилист"}!</span>
          </h2>
          <p className="text-muted-foreground text-lg">Готовы создать идеальный образ сегодня?</p>
        </div>

        {/* Style Preferences Alert */}
        {!stylePrefs && (
          <Card
            className="mb-8 border-accent/50 bg-gradient-to-r from-accent/10 via-accent-secondary/10 to-accent-tertiary/10 animate-slide-up-fade"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                  <Palette className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <CardTitle>Настройте свой стиль</CardTitle>
                  <CardDescription className="mt-1">
                    Пройдите короткий тест, чтобы получить персонализированные рекомендации
                  </CardDescription>
                </div>
                <Button asChild className="bg-gradient-to-r from-accent to-accent-secondary">
                  <Link href="/dashboard/style-quiz">Начать тест</Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8 animate-slide-up-fade" style={{ animationDelay: "0.2s" }}>
          <Card className="glass hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Гардероб</CardTitle>
              <Shirt className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{wardrobeCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">вещей в коллекции</p>
            </CardContent>
          </Card>

          <Card className="glass hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Образы</CardTitle>
              <Heart className="h-4 w-4 text-accent-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{outfitsCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">созданных луков</p>
            </CardContent>
          </Card>

          <Card className="glass hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Стиль</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent-tertiary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold gradient-text">{stylePrefs ? "✓" : "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">{stylePrefs ? "настроен" : "не настроен"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-4 animate-slide-up-fade" style={{ animationDelay: "0.3s" }}>
            Быстрые действия
          </h3>
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-up-fade"
            style={{ animationDelay: "0.4s" }}
          >
            <ActionCard
              icon={MessageSquare}
              title="AI Чат"
              description="Спросите совет у стилиста"
              href="/dashboard/chat"
              gradient="from-accent/20 to-accent-secondary/20"
            />
            <ActionCard
              icon={Camera}
              title="Анализ фото"
              description="Загрузите фото для оценки"
              href="/dashboard/analyze"
              gradient="from-accent-secondary/20 to-accent-tertiary/20"
            />
            <ActionCard
              icon={Shirt}
              title="Гардероб"
              description="Управляйте вещами"
              href="/dashboard/wardrobe"
              gradient="from-accent-tertiary/20 to-accent/20"
            />
            <ActionCard
              icon={Sparkles}
              title="Генератор"
              description="Создайте новый образ"
              href="/dashboard/generator"
              gradient="from-accent/20 to-accent-tertiary/20"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="animate-slide-up-fade" style={{ animationDelay: "0.5s" }}>
          <h3 className="text-2xl font-bold mb-4">Последняя активность</h3>
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Пока нет активности</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Начните с добавления вещей в гардероб или создания образа
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  gradient,
}: {
  icon: any
  title: string
  description: string
  href: string
  gradient: string
}) {
  return (
    <Link href={href}>
      <Card className={`glass hover-lift shimmer bg-gradient-to-br ${gradient} h-full`}>
        <CardHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-secondary mb-3 shadow-lg shadow-accent/20">
            <Icon className="h-6 w-6 text-accent-foreground" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
