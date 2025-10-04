import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, Camera, ArrowRight, Sparkles, Zap, TrendingUp, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-accent-secondary/5" />

        <div className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-medium mb-8 animate-bounce-in shadow-lg shadow-accent/10">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="gradient-text font-semibold">Powered by AI</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-balance text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-8 animate-slide-up-fade">
            Создайте идеальные образы с помощью <span className="gradient-text-animated block mt-2">ИИ-стилиста</span>
          </h1>

          {/* Description */}
          <p
            className="mx-auto max-w-2xl text-pretty text-xl leading-relaxed text-muted-foreground mb-12 animate-slide-up-fade"
            style={{ animationDelay: "0.1s" }}
          >
            Персональные рекомендации по стилю, анализ гардероба и подбор образов — всё это с помощью искусственного
            интеллекта
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-20 animate-slide-up-fade"
            style={{ animationDelay: "0.2s" }}
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto magnetic-button bg-gradient-to-r from-accent via-accent-secondary to-accent-tertiary text-white border-0 shadow-xl shadow-accent/30 text-lg px-8 py-6"
            >
              <Link href="/chat" className="gap-3">
                <MessageSquare className="h-6 w-6" />
                Начать чат с AI
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto glass hover-lift text-lg px-8 py-6 bg-transparent"
            >
              <Link href="/analyze" className="gap-3">
                <Camera className="h-6 w-6" />
                Анализ фото
              </Link>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-16">
            <FeatureCard
              icon={Zap}
              title="Умный чат"
              description="Общайтесь с AI-стилистом"
              delay="0.3s"
              gradient="from-accent/20 to-accent-secondary/20"
            />
            <FeatureCard
              icon={Camera}
              title="Анализ образов"
              description="Загрузите фото для рекомендаций"
              delay="0.4s"
              gradient="from-accent-secondary/20 to-accent-tertiary/20"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Каталог луков"
              description="Тысячи готовых образов"
              delay="0.5s"
              gradient="from-accent-tertiary/20 to-accent/20"
            />
            <FeatureCard
              icon={Heart}
              title="Избранное"
              description="Сохраняйте любимые образы"
              delay="0.6s"
              gradient="from-accent/20 to-accent-tertiary/20"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="glass-strong rounded-3xl p-12 shimmer">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <StatItem number="10K+" label="Пользователей" />
              <StatItem number="50K+" label="Образов" />
              <StatItem number="98%" label="Довольных клиентов" />
              <StatItem number="24/7" label="Поддержка AI" />
            </div>
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
  gradient,
}: {
  icon: any
  title: string
  description: string
  delay: string
  gradient: string
}) {
  return (
    <div
      className={`group relative glass rounded-2xl p-6 hover-lift shimmer animate-slide-up-fade bg-gradient-to-br ${gradient}`}
      style={{ animationDelay: delay }}
    >
      <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-accent to-accent-secondary p-3 shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold mb-2 group-hover:gradient-text transition-all duration-300">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      <ArrowRight className="mt-4 h-5 w-5 text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-2" />
    </div>
  )
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-4xl md:text-5xl font-bold gradient-text-animated">{number}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
