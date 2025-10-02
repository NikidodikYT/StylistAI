import { User, Sparkles } from "lucide-react"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  image?: string
  timestamp: Date
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"} animate-fade-in`}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 ${
          isUser ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" : "bg-muted"
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
        )}
      </div>

      <div className={`flex max-w-[80%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        {message.image && (
          <img
            src={message.image || "/placeholder.svg"}
            alt="Прикрепленное изображение"
            className="max-h-64 rounded-2xl border border-border object-cover shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in-scale"
          />
        )}

        <div
          className={`rounded-2xl px-4 py-3 transition-all duration-300 hover:shadow-md ${
            isUser
              ? "bg-accent text-accent-foreground shadow-lg shadow-accent/10"
              : "bg-muted text-foreground hover:bg-muted/80"
          }`}
        >
          <p className="text-pretty leading-relaxed">{message.content}</p>
        </div>

        <time className="text-xs text-muted-foreground transition-colors duration-200 hover:text-accent">
          {message.timestamp.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </div>
  )
}
