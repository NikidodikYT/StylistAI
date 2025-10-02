export interface FavoriteOutfit {
  id: string
  brand: string
  name: string
  price: string
  image: string
  style: string
  season: string
  rating?: number
  likedAt: number
}

export interface OutfitRating {
  outfitId: string
  rating: number
  timestamp: number
}

// Favorites management
export function getFavorites(): FavoriteOutfit[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("stylist-favorites")
  return stored ? JSON.parse(stored) : []
}

export function addToFavorites(outfit: Omit<FavoriteOutfit, "likedAt">): void {
  const favorites = getFavorites()
  const exists = favorites.find((f) => f.id === outfit.id)

  if (!exists) {
    const newFavorite: FavoriteOutfit = {
      ...outfit,
      likedAt: Date.now(),
    }
    favorites.push(newFavorite)
    localStorage.setItem("stylist-favorites", JSON.stringify(favorites))

    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent("favorites-updated"))
  }
}

export function removeFromFavorites(outfitId: string): void {
  const favorites = getFavorites()
  const filtered = favorites.filter((f) => f.id !== outfitId)
  localStorage.setItem("stylist-favorites", JSON.stringify(filtered))
  window.dispatchEvent(new CustomEvent("favorites-updated"))
}

export function isFavorite(outfitId: string): boolean {
  const favorites = getFavorites()
  return favorites.some((f) => f.id === outfitId)
}

// Likes/Dislikes management
export function getLikes(): Set<string> {
  if (typeof window === "undefined") return new Set()
  const stored = localStorage.getItem("stylist-likes")
  return stored ? new Set(JSON.parse(stored)) : new Set()
}

export function getDislikes(): Set<string> {
  if (typeof window === "undefined") return new Set()
  const stored = localStorage.getItem("stylist-dislikes")
  return stored ? new Set(JSON.parse(stored)) : new Set()
}

export function toggleLike(outfitId: string): "liked" | "neutral" {
  const likes = getLikes()
  const dislikes = getDislikes()

  // Remove from dislikes if present
  if (dislikes.has(outfitId)) {
    dislikes.delete(outfitId)
    localStorage.setItem("stylist-dislikes", JSON.stringify([...dislikes]))
  }

  // Toggle like
  if (likes.has(outfitId)) {
    likes.delete(outfitId)
    localStorage.setItem("stylist-likes", JSON.stringify([...likes]))
    return "neutral"
  } else {
    likes.add(outfitId)
    localStorage.setItem("stylist-likes", JSON.stringify([...likes]))
    return "liked"
  }
}

export function toggleDislike(outfitId: string): "disliked" | "neutral" {
  const likes = getLikes()
  const dislikes = getDislikes()

  // Remove from likes if present
  if (likes.has(outfitId)) {
    likes.delete(outfitId)
    localStorage.setItem("stylist-likes", JSON.stringify([...likes]))
  }

  // Toggle dislike
  if (dislikes.has(outfitId)) {
    dislikes.delete(outfitId)
    localStorage.setItem("stylist-dislikes", JSON.stringify([...dislikes]))
    return "neutral"
  } else {
    dislikes.add(outfitId)
    localStorage.setItem("stylist-dislikes", JSON.stringify([...dislikes]))
    return "disliked"
  }
}

// Ratings management
export function getRatings(): Map<string, number> {
  if (typeof window === "undefined") return new Map()
  const stored = localStorage.getItem("stylist-ratings")
  return stored ? new Map(JSON.parse(stored)) : new Map()
}

export function setRating(outfitId: string, rating: number): void {
  const ratings = getRatings()
  ratings.set(outfitId, rating)
  localStorage.setItem("stylist-ratings", JSON.stringify([...ratings]))
  window.dispatchEvent(new CustomEvent("ratings-updated"))
}

export function getRating(outfitId: string): number | undefined {
  const ratings = getRatings()
  return ratings.get(outfitId)
}
