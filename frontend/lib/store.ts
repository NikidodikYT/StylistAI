/**
 * StylistAI - Zustand Global State Store
 * 
 * Главное хранилище состояния приложения для управления:
 * - Аутентификацией пользователя (логин, параметры)
 * - Темой интерфейса (светлая/тёмная)
 * - Гардеробом (вещи, фильтры, избранное)
 * - Сохранёнными образами (коллекции)
 * - Чатом с AI (сообщения, сессии, оценённые образы)
 * 
 * Система сохранения:
 * - Данные сохраняются в localStorage (persist middleware)
 * - evaluatedOutfits НЕ сохраняется (очищается при перезагрузке)
 * - Все остальные данные сохраняются автоматически
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, ClothingItem, Outfit, ChatMessage, ChatSession, Tab, Theme, ClothingCategory, OutfitSuggestion } from "./types";
import { mockUser, mockClothingItems, mockOutfits, initialChatMessages } from "./mock-data";

// ============================================
// App Store Interface - Интерфейс всех состояний и методов
// ============================================
// Разделен на секции:
// - Auth: аутентификация и параметры пользователя
// - Theme: переключение светлой/тёмной темы
// - Navigation: управление активной вкладкой
// - Wardrobe: управление гардеробом (вещи, фильтры, избранное)
// - Collections: сохранённые образы (outfits)
// - Chat: сообщения, сессии чата, оценка образов
// ============================================
interface AppState {
 // Auth
 user: User | null;
 isAuthenticated: boolean;
 login: (email: string, password: string) => Promise<boolean>;
 logout: () => void;
 updateUserFit: (height: number, size: string, shoeSize: number) => void;

 // Theme
 theme: Theme;
 setTheme: (theme: Theme) => void;

 // Navigation
 activeTab: Tab;
 setActiveTab: (tab: Tab) => void;

 // Wardrobe
 wardrobeItems: ClothingItem[];
 wardrobeFilter: ClothingCategory | "all";
 wardrobeFavorites: string[];
 setWardrobeFilter: (filter: ClothingCategory | "all") => void;
 addWardrobeItem: (item: ClothingItem) => void;
 removeWardrobeItem: (id: string) => void;
 toggleWardrobeFavorite: (id: string) => void;

 // Collections (Saved Outfits)
 savedOutfits: Outfit[];
 collectionsFilter: string;
 setCollectionsFilter: (filter: string) => void;
 saveOutfit: (outfit: Outfit) => void;
 saveOutfitFromSuggestion: (suggestion: OutfitSuggestion) => void;
 removeOutfit: (id: string) => void;
 toggleOutfitFavorite: (id: string) => void;

 // Chat
 chatSessions: ChatSession[];
 activeSessionId: string | null;
 messages: ChatMessage[];
 isAiTyping: boolean;
 evaluatedOutfits: Set<string>;
 createNewSession: () => void;
 setActiveSession: (id: string) => void;
 addMessage: (message: ChatMessage) => void;
 setAiTyping: (typing: boolean) => void;
 clearChat: () => void;
 markOutfitAsEvaluated: (outfitId: string) => void;
 isOutfitEvaluated: (outfitId: string) => boolean;

 // Initialize store with mock data
 initializeStore: () => void;
}

// ============================================
// Store Implementation
// ============================================
export const useAppStore = create<AppState>()(
 persist(
 (set, get) => ({
 // Auth State
 user: null,
 isAuthenticated: false,
 login: async (email: string, _password: string) => {
 await new Promise((resolve) => setTimeout(resolve, 800));
 set({
 user: { ...mockUser, email },
 isAuthenticated: true,
 });
 return true;
 },
 logout: () => {
 set({
 user: null,
 isAuthenticated: false,
 });
 },
 updateUserFit: (height, size, shoeSize) => {
 set((state) => ({
 user: state.user ? { ...state.user, height, size, shoeSize } : null,
 }));
 },

 // Theme State
 theme: "dark",
 setTheme: (theme) => {
 set({ theme });
 if (typeof document !== "undefined") {
 if (theme === "dark") {
 document.documentElement.classList.add("dark");
 } else {
 document.documentElement.classList.remove("dark");
 }
 }
 },

 // Navigation State
 activeTab: "chat",
 setActiveTab: (tab) => set({ activeTab: tab }),

 // Wardrobe State
 wardrobeItems: [],
 wardrobeFilter: "all",
 wardrobeFavorites: [],
 setWardrobeFilter: (filter) => set({ wardrobeFilter: filter }),
 addWardrobeItem: (item) =>
 set((state) => ({
 wardrobeItems: [item, ...state.wardrobeItems],
 })),
 removeWardrobeItem: (id) =>
 set((state) => ({
 wardrobeItems: state.wardrobeItems.filter((item) => item.id !== id),
 wardrobeFavorites: state.wardrobeFavorites.filter((fid) => fid !== id),
 })),
 toggleWardrobeFavorite: (id) =>
 set((state) => ({
 wardrobeFavorites: state.wardrobeFavorites.includes(id)
 ? state.wardrobeFavorites.filter((fid) => fid !== id)
 : [...state.wardrobeFavorites, id],
 })),

 // Collections State
 savedOutfits: [],
 collectionsFilter: "all",
 setCollectionsFilter: (filter) => set({ collectionsFilter: filter }),
 saveOutfit: (outfit) =>
 set((state) => ({
 savedOutfits: [outfit, ...state.savedOutfits],
 })),
 saveOutfitFromSuggestion: (suggestion) => {
 const newOutfit: Outfit = {
 id: `outfit-${Date.now()}`,
 name: suggestion.name,
 items: suggestion.items,
 occasion: suggestion.style,
 tags: ["casual"],
 createdAt: new Date(),
 isFavorite: false,
 };
 set((state) => ({
 savedOutfits: [newOutfit, ...state.savedOutfits],
 }));
 },
 removeOutfit: (id) =>
 set((state) => ({
 savedOutfits: state.savedOutfits.filter((outfit) => outfit.id !== id),
 })),
 toggleOutfitFavorite: (id) =>
 set((state) => ({
 savedOutfits: state.savedOutfits.map((outfit) =>
 outfit.id === id ? { ...outfit, isFavorite: !outfit.isFavorite } : outfit
 ),
 })),

 // Chat State
 chatSessions: [],
 activeSessionId: null,
 messages: [],
 isAiTyping: false,
 evaluatedOutfits: new Set(),
 createNewSession: () => {
 const newSession: ChatSession = {
 id: `session-${Date.now()}`,
 title: "Новый чат",
 messages: [initialChatMessages[0]], // Just welcome message
 createdAt: new Date(),
 updatedAt: new Date(),
 };
 set((state) => ({
 chatSessions: [newSession, ...state.chatSessions],
 activeSessionId: newSession.id,
 messages: newSession.messages,
 }));
 },
 setActiveSession: (id) => {
 const session = get().chatSessions.find((s) => s.id === id);
 if (session) {
 set({
 activeSessionId: id,
 messages: session.messages,
 });
 }
 },
 addMessage: (message) => {
 set((state) => {
 const newMessages = [...state.messages, message];
 const updatedSessions = state.chatSessions.map((session) =>
 session.id === state.activeSessionId
 ? {
 ...session,
 messages: newMessages,
 updatedAt: new Date(),
 title: newMessages.length > 1 && message.sender === "user" 
 ? message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "")
 : session.title,
 }
 : session
 );
 return {
 messages: newMessages,
 chatSessions: updatedSessions,
 };
 });
 },
 setAiTyping: (typing) => set({ isAiTyping: typing }),
 clearChat: () => {
 get().createNewSession();
 },
 markOutfitAsEvaluated: (outfitId) => {
 set((state) => ({
 evaluatedOutfits: new Set([...state.evaluatedOutfits, outfitId]),
 }));
 },
 isOutfitEvaluated: (outfitId) => {
 return get().evaluatedOutfits.has(outfitId);
 },

 // Initialize
 initializeStore: () => {
 const state = get();
 if (state.wardrobeItems.length === 0) {
 set({ wardrobeItems: mockClothingItems });
 }
 if (state.savedOutfits.length === 0) {
 set({ savedOutfits: mockOutfits });
 }
 if (state.chatSessions.length === 0) {
 const initialSession: ChatSession = {
 id: `session-${Date.now()}`,
 title: "Новый чат",
 messages: initialChatMessages,
 createdAt: new Date(),
 updatedAt: new Date(),
 };
 set({
 chatSessions: [initialSession],
 activeSessionId: initialSession.id,
 messages: initialSession.messages,
 });
 }
 if (typeof document !== "undefined") {
 if (state.theme === "dark") {
 document.documentElement.classList.add("dark");
 } else {
 document.documentElement.classList.remove("dark");
 }
 }
 },
 }),
 {
 name: "stylistai-storage",
 partialize: (state) => ({
 user: state.user,
 isAuthenticated: state.isAuthenticated,
 theme: state.theme,
 wardrobeItems: state.wardrobeItems,
 wardrobeFavorites: state.wardrobeFavorites,
 savedOutfits: state.savedOutfits,
 chatSessions: state.chatSessions,
 activeSessionId: state.activeSessionId,
 }),
 }
 )
);
