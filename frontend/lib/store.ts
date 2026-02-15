"use client";

/**
 * StylistAI - Zustand Global State Store (REAL AUTH VERSION)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  User,
  ClothingItem,
  Outfit,
  ChatMessage,
  ChatSession,
  Tab,
  Theme,
  ClothingCategory,
  OutfitSuggestion,
} from "./types";

import { mockUser, mockOutfits, initialChatMessages } from "./mock-data";
import { apiFetch } from "./api";

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: {
    email: string;
    password: string;
    username: string;
    full_name?: string;
    gender?: string;
    age?: number;
    style_preferences?: string;
    favorite_brands?: string;
  }) => Promise<boolean>;
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
  setWardrobeItems: (items: ClothingItem[]) => void;
  addWardrobeItem: (item: ClothingItem) => void;
  removeWardrobeItem: (id: string) => void;
  toggleWardrobeFavorite: (id: string) => void;

  // Collections
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

  initializeStore: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ---------------- AUTH ----------------
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        type LoginResp = { access_token: string; token_type?: string };

        const form = new URLSearchParams();
        form.set("username", email);
        form.set("password", password);

        const data = await apiFetch<LoginResp>("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form.toString(),
        });

        set({
          token: data.access_token,
          user: { ...mockUser, email },
          isAuthenticated: true,
        });

        return true;
      },

      register: async (payload) => {
        await apiFetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        return await get().login(payload.email, payload.password);
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUserFit: (height, size, shoeSize) => {
        set((state) => ({
          user: state.user ? { ...state.user, height, size, shoeSize } : null,
        }));
      },

      // ---------------- THEME ----------------
      theme: "dark",
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          theme === "dark"
            ? document.documentElement.classList.add("dark")
            : document.documentElement.classList.remove("dark");
        }
      },

      // ---------------- NAV ----------------
      activeTab: "chat",
      setActiveTab: (tab) => set({ activeTab: tab }),

      // ---------------- WARDROBE ----------------
      wardrobeItems: [],
      wardrobeFilter: "all",
      wardrobeFavorites: [],
      setWardrobeFilter: (filter) => set({ wardrobeFilter: filter }),

      setWardrobeItems: (items) => set({ wardrobeItems: items }),

      addWardrobeItem: (item) =>
        set((state) => ({
          wardrobeItems: [item, ...state.wardrobeItems],
        })),

      removeWardrobeItem: (id) =>
        set((state) => ({
          wardrobeItems: state.wardrobeItems.filter((i) => i.id !== id),
          wardrobeFavorites: state.wardrobeFavorites.filter((fid) => fid !== id),
        })),

      toggleWardrobeFavorite: (id) =>
        set((state) => ({
          wardrobeFavorites: state.wardrobeFavorites.includes(id)
            ? state.wardrobeFavorites.filter((fid) => fid !== id)
            : [...state.wardrobeFavorites, id],
        })),

      // ---------------- COLLECTIONS ----------------
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
          savedOutfits: state.savedOutfits.filter((o) => o.id !== id),
        })),

      toggleOutfitFavorite: (id) =>
        set((state) => ({
          savedOutfits: state.savedOutfits.map((o) =>
            o.id === id ? { ...o, isFavorite: !o.isFavorite } : o
          ),
        })),

      // ---------------- CHAT ----------------
      chatSessions: [],
      activeSessionId: null,
      messages: [],
      isAiTyping: false,
      evaluatedOutfits: new Set(),

      createNewSession: () => {
        const newSession: ChatSession = {
          id: `session-${Date.now()}`,
          title: "Новый чат",
          messages: [initialChatMessages[0]],
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
          set({ activeSessionId: id, messages: session.messages });
        }
      },

      addMessage: (message) => {
        set((state) => {
          const newMessages = [...state.messages, message];

          return {
            messages: newMessages,
            chatSessions: state.chatSessions.map((session) =>
              session.id === state.activeSessionId
                ? { ...session, messages: newMessages, updatedAt: new Date() }
                : session
            ),
          };
        });
      },

      setAiTyping: (typing) => set({ isAiTyping: typing }),

      clearChat: () => get().createNewSession(),

      markOutfitAsEvaluated: (outfitId) =>
        set((state) => ({
          evaluatedOutfits: new Set([...state.evaluatedOutfits, outfitId]),
        })),

      isOutfitEvaluated: (outfitId) => get().evaluatedOutfits.has(outfitId),

      // ---------------- INIT ----------------
      initializeStore: () => {
        const state = get();

        // wardrobeItems — НЕ заполняем моками (у тебя реальный бэк)
        // collections — оставим моки, чтобы вкладка выглядела живой
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
            messages: initialChatMessages,
          });
        }

        if (typeof document !== "undefined") {
          state.theme === "dark"
            ? document.documentElement.classList.add("dark")
            : document.documentElement.classList.remove("dark");
        }
      },
    }),
    {
      name: "stylistai-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
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
