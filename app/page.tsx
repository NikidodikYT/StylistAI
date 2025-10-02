import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Camera, ArrowRight, Sparkles, Zap, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 grid-overlay opacity-40" aria-hidden="true" />

      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent mb-6 animate-fade-in-scale">
            <Sparkles className="h-4 w-4" />
            <span>Powered by AI</span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Создайте идеальные образы с помощью{" "}
            <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">ИИ-стилиста</span>
          </h1>

          {/* Description */}
          <p
            className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Персональные рекомендации по стилю, анализ гардероба и подбор образов — всё это с помощью искусственного
            интеллекта
          </p>

          <div
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto group transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:scale-105"
            >
              <Link href="/chat" className="gap-2">
                <MessageSquare className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                Начать чат с AI
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-transparent group transition-all duration-300 hover:bg-accent/5 hover:border-accent hover:scale-105"
            >
              <Link href="/analyze" className="gap-2">
                <Camera className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                Анализ фото
              </Link>
            </Button>
          </div>

          <div className="mt-24 grid gap-8 sm:grid-cols-3">
            <FeatureCard
              icon={Zap}
              title="Умный чат"
              description="Общайтесь с AI-стилистом и получайте персональные советы"
              delay="0.4s"
            />
            <FeatureCard
              icon={Camera}
              title="Анализ образов"
              description="Загрузите фото и получите рекомендации по улучшению стиля"
              delay="0.5s"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Каталог луков"
              description="Тысячи готовых образов с фильтрами по стилю и сезону"
              delay="0.6s"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: { icon: any; title: string; description: string; delay: string }) {
  return (
    <div
      className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="mb-4 inline-flex rounded-xl bg-accent/10 p-3 transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <h3 className="text-balance text-xl font-semibold transition-colors duration-200 group-hover:text-accent">
        {title}
      </h3>
      <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{description}</p>
      <ArrowRight className="mt-4 h-5 w-5 text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
    </div>
  )
}
