"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ToastType = "success" | "error" | "info"

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

let toastListeners: Array<(toast: Toast) => void> = []

export function showToast(type: ToastType, message: string, duration = 5000) {
  const toast: Toast = {
    id: Math.random().toString(36).substring(7),
    type,
    message,
    duration,
  }
  toastListeners.forEach((listener) => listener(toast))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast])

      if (toast.duration) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, toast.duration)
      }
    }

    toastListeners.push(listener)

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`glass-premium rounded-xl p-4 shadow-xl animate-toast-in flex items-start gap-3 ${
            toast.type === "success"
              ? "border-l-4 border-success"
              : toast.type === "error"
                ? "border-l-4 border-destructive"
                : "border-l-4 border-accent"
          }`}
        >
          {toast.type === "success" && <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />}
          {toast.type === "error" && <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />}
          {toast.type === "info" && <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />}

          <p className="text-sm flex-1 leading-relaxed">{toast.message}</p>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0 hover:bg-muted/50"
            onClick={() => removeToast(toast.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
