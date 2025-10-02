"use client"

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[3/4] bg-muted animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-muted rounded animate-shimmer" />
        <div className="h-4 w-3/4 bg-muted rounded animate-shimmer" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 bg-muted rounded animate-shimmer" />
          <div className="h-4 w-20 bg-muted rounded animate-shimmer" />
        </div>
        <div className="flex gap-2 pt-3 border-t border-border">
          <div className="h-8 flex-1 bg-muted rounded animate-shimmer" />
          <div className="h-8 flex-1 bg-muted rounded animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
