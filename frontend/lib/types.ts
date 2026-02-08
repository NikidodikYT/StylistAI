// ============================================
// StylistAI - Type Definitions
// ============================================

export interface User {
 id: string;
 name: string;
 email: string;
 avatar?: string;
 createdAt: Date;
 // Body measurements for "My Fit" card
 height?: number;
 size?: string;
 shoeSize?: number;
}

export type ClothingCategory = "all" | "tops" | "bottoms" | "shoes" | "accessories" | "outerwear";
export type ClothingTag = "casual" | "formal" | "summer" | "winter" | "spring" | "autumn" | "sport" | "business" | "date" | "travel";

export interface ClothingItem {
 id: string;
 name: string;
 brand: string;
 category: Exclude<ClothingCategory, "all">;
 imageUrl: string;
 tags: ClothingTag[];
 color?: string;
 price: number;
 buyLink: string;
 createdAt: Date;
}

export interface OutfitSuggestion {
 id: string;
 name: string;
 items: ClothingItem[];
 style: string;
}

export interface Outfit {
 id: string;
 name: string;
 items: ClothingItem[];
 occasion: string;
 tags: ClothingTag[];
 createdAt: Date;
 isFavorite: boolean;
}

export interface ChatMessage {
 id: string;
 content: string;
 sender: "user" | "ai";
 timestamp: Date;
 attachments?: string[];
 suggestedItems?: ClothingItem[];
 outfitSuggestions?: OutfitSuggestion[];
}

export interface ChatSession {
 id: string;
 title: string;
 messages: ChatMessage[];
 createdAt: Date;
 updatedAt: Date;
}

export type Tab = "chat" | "wardrobe" | "collections" | "profile";
export type Theme = "dark" | "light";

// Quick action chips for chat
export const QUICK_ACTIONS = [
 { id: "generate", label: "Создать образ", icon: "sparkles" },
 { id: "office", label: "Офис", icon: "building" },
 { id: "date", label: "Свидание", icon: "wine" },
 { id: "travel", label: "Путешествие", icon: "plane" },
 { id: "analyze", label: "Анализ фото", icon: "camera" },
] as const;

export type QuickAction = (typeof QUICK_ACTIONS)[number]["id"];

// Filter options for Collections
export const COLLECTION_FILTERS = ["all", "business", "date", "casual", "travel"] as const;
export type CollectionFilter = (typeof COLLECTION_FILTERS)[number];

// Category labels in Russian
export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
 all: "Все",
 tops: "Верх",
 bottoms: "Низ",
 shoes: "Обувь",
 accessories: "Аксессуары",
 outerwear: "Верхняя одежда",
};

// Collection filter labels in Russian
export const COLLECTION_FILTER_LABELS: Record<CollectionFilter, string> = {
 all: "Все",
 business: "Бизнес",
 date: "Свидание",
 casual: "Повседневный",
 travel: "Путешествие",
};
