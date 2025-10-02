"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

export function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
    }

    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-5">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-accent/10 p-2">
            <Download className="h-5 w-5 text-accent" aria-hidden="true" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold">Установить StylistAI</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Добавьте приложение на главный экран для быстрого доступа
            </p>

            <div className="mt-3 flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1">
                Установить
              </Button>
              <Button onClick={() => setShowPrompt(false)} variant="ghost" size="sm">
                Позже
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowPrompt(false)}
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
