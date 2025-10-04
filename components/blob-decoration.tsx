"use client"

export function BlobDecoration() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Blob 1 - Top Right */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float"
        style={{
          background: "radial-gradient(circle, oklch(0.7 0.2 220), transparent 70%)",
        }}
      />

      {/* Blob 2 - Bottom Left */}
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl animate-float-slow"
        style={{
          background: "radial-gradient(circle, oklch(0.65 0.18 180), transparent 70%)",
          animationDelay: "2s",
        }}
      />

      {/* Blob 3 - Center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl animate-pulse-glow"
        style={{
          background: "radial-gradient(circle, oklch(0.6 0.16 160), transparent 70%)",
        }}
      />

      {/* Gradient Orbs */}
      <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full opacity-20 blur-2xl animate-float">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-accent/40 via-accent-secondary/30 to-transparent" />
      </div>

      <div
        className="absolute bottom-32 left-1/3 w-80 h-80 rounded-full opacity-15 blur-2xl animate-float-slow"
        style={{ animationDelay: "3s" }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-accent-tertiary/40 via-accent/30 to-transparent" />
      </div>
    </div>
  )
}
