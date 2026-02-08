// ============================================
// StylistAI - Mock Data for Development
// ============================================

import type { ClothingItem, Outfit, ChatMessage, User, OutfitSuggestion } from "./types";

// Mock User with body measurements
export const mockUser: User = {
 id: "user-1",
 name: "Александра",
 email: "alex@example.com",
 avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
 createdAt: new Date("2024-01-15"),
 height: 172,
 size: "M",
 shoeSize: 38,
};

// Mock Clothing Items with prices and buy links
export const mockClothingItems: ClothingItem[] = [
 {
 id: "item-1",
 name: "Белая футболка",
 brand: "COS",
 category: "tops",
 imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
 tags: ["casual", "summer"],
 color: "white",
 price: 2990,
 buyLink: "https://www.cos.com",
 createdAt: new Date("2024-06-01"),
 },
 {
 id: "item-2",
 name: "Черные джинсы",
 brand: "Levi's",
 category: "bottoms",
 imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
 tags: ["casual", "autumn"],
 color: "black",
 price: 7990,
 buyLink: "https://www.levi.com",
 createdAt: new Date("2024-05-15"),
 },
 {
 id: "item-3",
 name: "Кожаная куртка",
 brand: "AllSaints",
 category: "outerwear",
 imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
 tags: ["casual", "autumn", "spring"],
 color: "black",
 price: 34990,
 buyLink: "https://www.allsaints.com",
 createdAt: new Date("2024-04-10"),
 },
 {
 id: "item-4",
 name: "Белые кроссовки",
 brand: "Nike",
 category: "shoes",
 imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop",
 tags: ["casual", "sport"],
 color: "white",
 price: 12990,
 buyLink: "https://www.nike.com",
 createdAt: new Date("2024-03-20"),
 },
 {
 id: "item-5",
 name: "Шелковая блузка",
 brand: "Massimo Dutti",
 category: "tops",
 imageUrl: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=500&fit=crop",
 tags: ["formal", "business"],
 color: "cream",
 price: 6990,
 buyLink: "https://www.massimodutti.com",
 createdAt: new Date("2024-02-28"),
 },
 {
 id: "item-6",
 name: "Брюки палаццо",
 brand: "Zara",
 category: "bottoms",
 imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop",
 tags: ["formal", "business", "summer"],
 color: "beige",
 price: 4990,
 buyLink: "https://www.zara.com",
 createdAt: new Date("2024-02-15"),
 },
 {
 id: "item-7",
 name: "Туфли на каблуке",
 brand: "Jimmy Choo",
 category: "shoes",
 imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=500&fit=crop",
 tags: ["formal", "date"],
 color: "black",
 price: 54990,
 buyLink: "https://www.jimmychoo.com",
 createdAt: new Date("2024-01-25"),
 },
 {
 id: "item-8",
 name: "Худи оверсайз",
 brand: "Acne Studios",
 category: "tops",
 imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop",
 tags: ["casual", "winter", "sport"],
 color: "grey",
 price: 21990,
 buyLink: "https://www.acnestudios.com",
 createdAt: new Date("2024-01-10"),
 },
 {
 id: "item-9",
 name: "Шерстяное пальто",
 brand: "Max Mara",
 category: "outerwear",
 imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop",
 tags: ["formal", "winter", "business"],
 color: "camel",
 price: 89990,
 buyLink: "https://www.maxmara.com",
 createdAt: new Date("2023-12-20"),
 },
 {
 id: "item-10",
 name: "Кожаная сумка",
 brand: "Saint Laurent",
 category: "accessories",
 imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop",
 tags: ["formal", "casual"],
 color: "black",
 price: 129990,
 buyLink: "https://www.ysl.com",
 createdAt: new Date("2023-12-01"),
 },
 {
 id: "item-11",
 name: "Льняная рубашка",
 brand: "Uniqlo",
 category: "tops",
 imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop",
 tags: ["casual", "summer", "travel"],
 color: "blue",
 price: 2490,
 buyLink: "https://www.uniqlo.com",
 createdAt: new Date("2023-11-15"),
 },
 {
 id: "item-12",
 name: "Юбка миди",
 brand: "Reformation",
 category: "bottoms",
 imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj97?w=400&h=500&fit=crop",
 tags: ["casual", "summer", "date"],
 color: "floral",
 price: 15990,
 buyLink: "https://www.thereformation.com",
 createdAt: new Date("2023-11-01"),
 },
];

// Mock Outfits (Collections)
export const mockOutfits: Outfit[] = [
 {
 id: "outfit-1",
 name: "Деловая встреча",
 items: [mockClothingItems[4], mockClothingItems[5], mockClothingItems[6], mockClothingItems[9]],
 occasion: "Офис",
 tags: ["business", "formal"],
 createdAt: new Date("2024-06-10"),
 isFavorite: true,
 },
 {
 id: "outfit-2",
 name: "Городская прогулка",
 items: [mockClothingItems[0], mockClothingItems[1], mockClothingItems[3], mockClothingItems[2]],
 occasion: "Прогулка",
 tags: ["casual", "spring"],
 createdAt: new Date("2024-06-05"),
 isFavorite: false,
 },
 {
 id: "outfit-3",
 name: "Романтический ужин",
 items: [mockClothingItems[4], mockClothingItems[11], mockClothingItems[6], mockClothingItems[9]],
 occasion: "Свидание",
 tags: ["date", "formal"],
 createdAt: new Date("2024-05-28"),
 isFavorite: true,
 },
];

// 3 Outfit Suggestions for the Carousel Demo
export const mockOutfitSuggestions: OutfitSuggestion[] = [
 {
 id: "suggestion-1",
 name: "Повседневный шик",
 style: "Casual",
 items: [
 mockClothingItems[0], // White tee
 mockClothingItems[1], // Black jeans
 mockClothingItems[2], // Leather jacket
 mockClothingItems[3], // White sneakers
 ],
 },
 {
 id: "suggestion-2",
 name: "Деловой образ",
 style: "Smart",
 items: [
 mockClothingItems[4], // Silk blouse
 mockClothingItems[5], // Palazzo pants
 mockClothingItems[6], // Heels
 mockClothingItems[9], // Leather bag
 ],
 },
 {
 id: "suggestion-3",
 name: "Спортивный лук",
 style: "Sport",
 items: [
 mockClothingItems[7], // Oversized hoodie
 mockClothingItems[1], // Black jeans
 mockClothingItems[3], // White sneakers
 ],
 },
];

// Initial Chat Messages - includes outfit suggestions carousel demo
export const initialChatMessages: ChatMessage[] = [
 {
 id: "msg-1",
 content: "Привет! Я StylistAI — ваш персональный AI-стилист. Выберите быстрое действие ниже или опишите, какой образ вам нужен.",
 sender: "ai",
 timestamp: new Date(Date.now() - 120000),
 },
 {
 id: "msg-2",
 content: "Подбери мне образ на выходные",
 sender: "user",
 timestamp: new Date(Date.now() - 60000),
 },
 {
 id: "msg-3",
 content: "Отлично! Вот 3 варианта образов для выходных. Свайпните влево/вправо, чтобы увидеть все варианты:",
 sender: "ai",
 timestamp: new Date(Date.now() - 30000),
 outfitSuggestions: mockOutfitSuggestions,
 },
];

// Generate new outfits with unique IDs
function generateOutfits(baseOutfits: OutfitSuggestion[]): OutfitSuggestion[] {
 return baseOutfits.map((outfit, idx) => ({
 ...outfit,
 id: `suggestion-${Date.now()}-${idx}`,
 }));
}

// Generate AI response with outfit suggestions
export function generateMockAIResponse(userMessage: string): ChatMessage {
 // Simple keyword matching for demo
 const lowerMsg = userMessage.toLowerCase();
 
 let suggestions = generateOutfits(mockOutfitSuggestions);
 let response = "Вот несколько образов, которые могут вам понравиться. Свайпните, чтобы увидеть все варианты:";

 if (lowerMsg.includes("офис") || lowerMsg.includes("работ") || lowerMsg.includes("деловой")) {
 response = "Для офиса подобрала элегантные варианты. Свайпните для просмотра:";
 suggestions = generateOutfits([mockOutfitSuggestions[1], mockOutfitSuggestions[0]]);
 } else if (lowerMsg.includes("свидани") || lowerMsg.includes("вечер") || lowerMsg.includes("ресторан")) {
 response = "Для романтического вечера — вот мои рекомендации:";
 suggestions = generateOutfits([mockOutfitSuggestions[1], mockOutfitSuggestions[0]]);
 } else if (lowerMsg.includes("спорт") || lowerMsg.includes("трениров")) {
 response = "Для активного дня подобрала комфортные образы:";
 suggestions = generateOutfits([mockOutfitSuggestions[2], mockOutfitSuggestions[0]]);
 }

 return {
 id: `msg-${Date.now()}`,
 content: response,
 sender: "ai",
 timestamp: new Date(),
 outfitSuggestions: suggestions,
 };
}
