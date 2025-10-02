import type { LucideIcon } from "lucide-react"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center animate-fade-in-scale">
      <div className="rounded-full bg-muted p-6 transition-all duration-300 hover:bg-accent/10 hover:scale-110 group">
        <Icon
          className="h-12 w-12 text-muted-foreground transition-colors duration-300 group-hover:text-accent"
          aria-hidden="true"
        />
      </div>
      <h2 className="mt-6 text-xl font-semibold animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {title}
      </h2>
      <p className="mt-2 max-w-md text-pretty text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
        {description}
      </p>
    </div>
  )
}
