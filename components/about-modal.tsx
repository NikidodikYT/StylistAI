"use client"
import { X, Sparkles, Zap, Heart, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AboutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-ultra rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 hover:bg-muted/50" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent via-accent-secondary to-accent-tertiary">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold gradient-text-premium">О проекте StylistAI</h2>
          </div>

          {/* Content */}
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              <span className="font-semibold text-foreground">StylistAI</span> — это инновационный сервис персонального
              стилиста на базе искусственного интеллекта, который помогает создавать идеальные образы для любого случая.
            </p>

            <p>
              Мы используем передовые технологии машинного обучения и компьютерного зрения, чтобы анализировать ваш
              стиль, предпочтения и особенности внешности, предлагая персонализированные рекомендации по подбору одежды.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <FeatureItem icon={Zap} title="Мгновенный анализ" description="AI анализирует ваши фото за секунды" />
              <FeatureItem icon={Heart} title="Персональный подход" description="Рекомендации учитывают ваш стиль" />
              <FeatureItem icon={TrendingUp} title="Актуальные тренды" description="Следим за модными тенденциями" />
              <FeatureItem icon={Sparkles} title="Умные советы" description="Профессиональные рекомендации 24/7" />
            </div>

            <p className="mt-6 text-sm">
              Присоединяйтесь к тысячам пользователей, которые уже открыли для себя новый уровень стиля с StylistAI!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
      <div className="p-2 rounded-lg bg-accent/20">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm">{description}</p>
      </div>
    </div>
  )
}
