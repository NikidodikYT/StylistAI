"use client";

/**
 * ChatScreen (REAL)
 * - photo: POST /api/v1/ai/analyze-image?save_to_wardrobe_flag=true
 *         then POST /api/v1/ai/outfits/from-item
 * - text:  POST /api/v1/ai/outfits/from-style
 */

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Send, Check, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { OutfitSuggestion } from "@/lib/types";
import { ImageUploadInput } from "@/components/image-upload-input";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { apiFetch } from "@/lib/api";

type FlatMessageItem =
  | { type: "TEXT"; id: string; content: string; sender: "user" | "ai"; timestamp: Date; attachments?: string[] }
  | { type: "OUTFIT_GROUP"; id: string; suggestions: OutfitSuggestion[] };

const QUICK_BUTTONS = [
  { id: "casual", label: "Повседневный", prompt: "Подбери повседневный образ" },
  { id: "evening", label: "Вечерний", prompt: "Подбери вечерний образ" },
  { id: "sport", label: "Спорт", prompt: "Подбери спортивный образ" },
  { id: "office", label: "Офис", prompt: "Подбери офисный образ" },
];

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
}

type SimilarProduct = {
  name?: string;
  brand?: string;
  price?: number | null;
  url?: string;
  image_url?: string;
  imageurl?: string;
  imageUrl?: string;
};

type OutfitSlotLike = { slot_type?: string; products?: SimilarProduct[] };
type SingleOutfitLike = { outfit_name?: string; style?: string; slots?: OutfitSlotLike[] };
type BuildOutfitResponseLike = { success?: boolean; style?: string; outfits?: SingleOutfitLike[] };

function pickImage(p: SimilarProduct): string {
  return p.image_url || p.imageurl || p.imageUrl || "/placeholder.svg";
}

function buildSuggestions(resp: BuildOutfitResponseLike): OutfitSuggestion[] {
  const outfits = resp.outfits || [];
  return outfits.map((o, i) => {
    const slots = o.slots || [];
    const picked: SimilarProduct[] = [];

    for (const s of slots) {
      const p = (s.products || [])[0];
      if (p) picked.push(p);
    }

    const items = picked.slice(0, 6).map((p, idx) => ({
      id: `item-${Date.now()}-${i}-${idx}`,
      name: p.name || "Item",
      brand: p.brand || "Brand",
      price: typeof p.price === "number" ? p.price : 0,
      image: pickImage(p),
    }));

    return {
      id: `sugg-${Date.now()}-${i}`,
      name: o.outfit_name || `Образ ${i + 1}`,
      style: resp.style || o.style || "Style",
      items,
    };
  });
}

function guessStyle(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("вечер") || t.includes("свидан") || t.includes("ресторан")) return "evening";
  if (t.includes("офис") || t.includes("работ") || t.includes("делов")) return "smart";
  if (t.includes("спорт") || t.includes("трен")) return "sport";
  return "casual";
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 p-3">
      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}

function TextBubble({
  content,
  sender,
  timestamp,
  attachments,
}: {
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  attachments?: string[];
}) {
  const isUser = sender === "user";
  const hasAttachments = attachments && attachments.length > 0;
  const hasText = content && content.trim().length > 0;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl overflow-hidden",
          isUser ? "bg-violet-600 text-white" : "bg-secondary text-secondary-foreground"
        )}
      >
        {hasAttachments && (
          <div className="flex flex-col gap-0.5">
            {attachments.map((src, idx) => (
              <div key={idx} className="relative w-[240px] sm:w-[280px] aspect-[3/4] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src || "/placeholder.svg"} alt="Attached image" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className={cn("px-3 py-2", hasAttachments && !hasText ? "pt-0" : "")}>
          {hasText && <p className="break-words text-sm leading-relaxed">{content}</p>}
          <p className={cn("text-[10px] mt-0.5 opacity-60 text-right", hasAttachments && !hasText ? "pt-1" : "")}>
            {formatTime(timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

function OutfitCarousel({
  suggestions,
  onSave,
  onSkip,
}: {
  suggestions: OutfitSuggestion[];
  onSave: (suggestion: OutfitSuggestion) => void;
  onSkip: (suggestion: OutfitSuggestion) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [api, setApi] = useState<any>(null);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => api.off("select", onSelect);
  }, [api]);

  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 px-4">
        <Check className="w-12 h-12 text-violet-600" />
        <p className="text-sm text-zinc-400">Готово!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
      <Carousel setApi={setApi} opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent className="-ml-0 w-full">
          {suggestions.map((outfit) => (
            <CarouselItem key={outfit.id} className="pl-0 basis-full w-full">
              <div className="flex flex-col gap-4 rounded-3xl bg-card border border-border p-5 shadow-md">
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-lg text-card-foreground">{outfit.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-8 bg-primary rounded-full"></div>
                    <p className="text-sm text-muted-foreground italic">{outfit.style}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {outfit.items.map((item, idx) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-border/50 last:pb-0 last:border-b-0">
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-secondary overflow-hidden shadow-sm">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-semibold text-primary uppercase tracking-widest">{item.brand}</p>
                          <p className="text-sm font-medium text-card-foreground mt-1">{item.name}</p>
                        </div>
                        <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400 mt-2">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex-shrink-0 flex items-start justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 px-3 py-3 rounded-xl bg-secondary/50">
                  <span className="text-xs font-medium text-muted-foreground">Сумма образа:</span>
                  <p className="text-lg font-bold text-card-foreground">
                    {formatPrice(outfit.items.reduce((sum, item) => sum + item.price, 0))}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      onSkip(outfit);
                      api?.scrollNext();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-secondary border border-border text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 transition h-11"
                  >
                    <X size={18} />
                    <span>Пропустить</span>
                  </Button>
                  <Button
                    onClick={() => onSave(outfit)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition h-11"
                  >
                    <Heart size={18} className="fill-current" />
                    <span>Сохранить</span>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {suggestions.length > 1 && (
        <div className="flex justify-center gap-1 pt-1">
          {suggestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => api?.scrollTo(idx)}
              className={cn("w-1 h-1 rounded-full transition-all", idx === current ? "bg-violet-600" : "bg-zinc-600")}
              aria-label={`Go to outfit ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatScreen() {
  const [inputValue, setInputValue] = useState("");
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isAuthenticated,
    messages,
    isAiTyping,
    addMessage,
    setAiTyping,
    saveOutfitFromSuggestion,
    markOutfitAsEvaluated,
    isOutfitEvaluated,
    logout,
  } = useAppStore();

  const flatMessages: FlatMessageItem[] = [];
  for (const msg of messages) {
    flatMessages.push({
      type: "TEXT",
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: msg.timestamp,
      attachments: msg.attachments,
    });

    if (msg.outfitSuggestions && msg.outfitSuggestions.length > 0) {
      const filteredSuggestions = msg.outfitSuggestions.filter((outfit) => !isOutfitEvaluated(outfit.id));

      if (filteredSuggestions.length > 0) {
        flatMessages.push({
          type: "OUTFIT_GROUP",
          id: `${msg.id}-outfits`,
          suggestions: filteredSuggestions,
        });
      } else {
        flatMessages.push({
          type: "TEXT",
          id: `${msg.id}-completion`,
          content: "Вы оценили все предложенные образы! Напишите новый запрос и я подберу для вас другие варианты.",
          sender: "ai",
          timestamp: new Date(),
        });
      }
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const handleSend = async (text?: string) => {
    const content = (text ?? inputValue).trim();
    if (!content && !uploadedImage) return;

    addMessage({
      id: `msg-${Date.now()}`,
      content,
      sender: "user",
      timestamp: new Date(),
      attachments: uploadedImage ? [uploadedImage.preview] : undefined,
    });

    setInputValue("");
    const img = uploadedImage;
    setUploadedImage(null);

    setAiTyping(true);

    try {
      if (!isAuthenticated) {
        addMessage({
          id: `ai-${Date.now()}`,
          content: "Сначала нужно войти в аккаунт.",
          sender: "ai",
          timestamp: new Date(),
        });
        return;
      }

      let suggestions: OutfitSuggestion[] = [];

      if (img?.file) {
        const fd = new FormData();
        fd.append("file", img.file);

        const analysis = await apiFetch<any>("/api/v1/ai/analyze-image?save_to_wardrobe_flag=true", {
          method: "POST",
          body: fd,
        });

        const itemId = analysis?.item_id ?? analysis?.itemid ?? analysis?.itemId;
        if (!itemId) throw new Error("No item_id from analyze-image");

        const outfitsResp = await apiFetch<any>("/api/v1/ai/outfits/from-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            item_id: itemId,
            outfits_count: 3,
            style: "casual",
            budget: "mid",
            marketplaces: ["asos"],
            max_results_per_slot: 4,
          }),
        });

        suggestions = buildSuggestions(outfitsResp);
      } else {
        const outfitsResp = await apiFetch<any>("/api/v1/ai/outfits/from-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            style: guessStyle(content),
            gender: "men",
            season: "all",
            outfits_count: 3,
            budget: "mid",
            marketplaces: ["asos"],
            max_results_per_slot: 4,
          }),
        });

        suggestions = buildSuggestions(outfitsResp);
      }

      addMessage({
        id: `ai-${Date.now()}`,
        content: suggestions.length ? "Вот несколько вариантов — свайпай и сохраняй, что нравится." : "Не нашёл варианты.",
        sender: "ai",
        timestamp: new Date(),
        outfitSuggestions: suggestions,
      });
    } catch (e: any) {
      if (e?.status === 401) logout();

      addMessage({
        id: `ai-${Date.now()}`,
        content: `Ошибка AI. Проверь /docs и логи. ${e?.message ? String(e.message) : ""}`,
        sender: "ai",
        timestamp: new Date(),
      });
    } finally {
      setAiTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveOutfit = (suggestion: OutfitSuggestion) => {
    markOutfitAsEvaluated(suggestion.id);
    saveOutfitFromSuggestion(suggestion);
  };

  const handleSkipOutfit = (suggestion: OutfitSuggestion) => {
    markOutfitAsEvaluated(suggestion.id);
  };

  return (
    <div className="flex flex-col h-full bg-background w-full">
      <div className="flex items-center h-12 px-3 border-b border-border bg-background/95 flex-shrink-0">
        <div className="flex items-center gap-2 w-full">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">AI</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs text-foreground">StylistAI</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-none">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-3 space-y-3">
        {flatMessages.map((item) => {
          if (item.type === "TEXT") {
            return (
              <div key={item.id}>
                <TextBubble content={item.content} sender={item.sender} timestamp={item.timestamp} attachments={item.attachments} />
              </div>
            );
          }

          if (item.type === "OUTFIT_GROUP") {
            return (
              <div key={item.id} className="px-1 flex justify-center">
                <OutfitCarousel suggestions={item.suggestions} onSave={handleSaveOutfit} onSkip={handleSkipOutfit} />
              </div>
            );
          }

          return null;
        })}
        {isAiTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 bg-background border-t border-border mb-[70px]">
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide justify-center">
          {QUICK_BUTTONS.map((btn) => (
            <Button
              key={btn.id}
              onClick={() => handleSend(btn.prompt)}
              disabled={isAiTyping}
              className="shrink-0 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 h-8"
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {uploadedImage && (
          <div className="px-3 py-2 border-t border-border flex items-center gap-2 bg-secondary/50">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image src={uploadedImage.preview || "/placeholder.svg"} alt="Uploaded" fill className="object-cover" />
            </div>
            <p className="text-xs text-muted-foreground flex-1 truncate">{uploadedImage.file.name}</p>
            <button
              onClick={() => setUploadedImage(null)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border">
          <ImageUploadInput variant="icon" size="md" onImageSelect={(file, preview) => setUploadedImage({ file, preview })} />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите..."
            className="flex-1 bg-secondary border-0 rounded-full px-3 h-9 text-xs text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={() => handleSend()}
            disabled={(!inputValue.trim() && !uploadedImage) || isAiTyping}
            size="sm"
            className="h-9 w-9 rounded-full flex-shrink-0 p-0 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
