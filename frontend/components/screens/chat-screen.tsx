"use client";

/**
 * ChatScreen Component
 * 
 * Главный компонент чата с AI стилистом.
 * Функционал:
 * - Отправка сообщений пользователем
 * - Получение рекомендаций по образам от AI
 * - Карусель для просмотра предложенных образов
 * - Оценка образов (лайк/пропуск)
 * - Новые образы генерируются при каждом новом запросе
 * - Оценённые образы не повторяются даже при новых запросах
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
import { ImagePlus } from "lucide-react"; // Declaration of ImagePlus

// ============================================
// Types for Flat Message Rendering
// ============================================
// FlatMessageItem: Структура для отображения сообщений и карусели образов
// - TEXT: обычное текстовое сообщение
// - OUTFIT_GROUP: карусель с образами для оценки
type FlatMessageItem = 
 | { type: "TEXT"; id: string; content: string; sender: "user" | "ai"; timestamp: Date; attachments?: string[] }
 | { type: "OUTFIT_GROUP"; id: string; suggestions: OutfitSuggestion[] };

// ============================================
// Quick Action Buttons Config (Russian)
// ============================================
const QUICK_BUTTONS = [
 { id: "casual", label: "Повседневный", prompt: "Подбери повседневный образ" },
 { id: "evening", label: "Вечерний", prompt: "Подбери вечерний образ" },
 { id: "sport", label: "Спорт", prompt: "Подбери спортивный образ" },
 { id: "office", label: "Офис", prompt: "Подбери офисный образ" },
];

// ============================================
// Utility Functions
// ============================================
function formatTime(date: Date): string {
 return new Date(date).toLocaleTimeString("ru-RU", {
 hour: "2-digit",
 minute: "2-digit",
 });
}

function formatPrice(price: number): string {
 return new Intl.NumberFormat("ru-RU", {
 style: "currency",
 currency: "RUB",
 maximumFractionDigits: 0,
 }).format(price);
}

// ============================================
// TypingIndicator Component
// ============================================
function TypingIndicator() {
 return (
 <div className="flex items-center gap-1.5 p-3">
 <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
 <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
 <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
 </div>
 );
}

// ============================================
// TextBubble Component (max-width 75%)
// ============================================
function TextBubble({ content, sender, timestamp, attachments }: { content: string; sender: "user" | "ai"; timestamp: Date; attachments?: string[] }) {
 const isUser = sender === "user";
 const hasAttachments = attachments && attachments.length > 0;
 const hasText = content && content.trim().length > 0;

 return (
 <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
 <div
 className={cn(
 "max-w-[75%] rounded-2xl overflow-hidden",
 isUser
 ? "bg-violet-600 text-white"
 : "bg-secondary text-secondary-foreground"
 )}
 >
 {hasAttachments && (
 <div className={cn("flex flex-col gap-0.5", hasText ? "" : "")}>
 {attachments.map((src, idx) => (
 // biome-ignore lint: using index as key for blob URLs
 <div key={idx} className="relative w-[240px] sm:w-[280px] aspect-[3/4] bg-muted">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={src || "/placeholder.svg"}
 alt="Attached image"
 className="w-full h-full object-cover"
 />
 </div>
 ))}
 </div>
 )}
 <div className={cn("px-3 py-2", hasAttachments && !hasText ? "pt-0" : "")}>
 {hasText && <p className="break-words text-sm leading-relaxed">{content}</p>}
 <p
 className={cn(
 "text-[10px] mt-0.5 opacity-60 text-right",
 hasAttachments && !hasText ? "pt-1" : ""
 )}
 >
 {formatTime(timestamp)}
 </p>
 </div>
 </div>
 </div>
 );
}

// ============================================
// OutfitCarousel with Horizontal Swipe (Russian)
// ============================================
function OutfitCarousel({ suggestions, onSave, onSkip }: { 
 suggestions: OutfitSuggestion[]; 
 onSave: (suggestion: OutfitSuggestion) => void;
 onSkip: (suggestion: OutfitSuggestion) => void;
}) {
 const [current, setCurrent] = useState(0);
 const [api, setApi] = useState<any>(null);

 const handleSave = (outfit: OutfitSuggestion) => {
 onSave(outfit);
 };

 const handleSkip = (outfit: OutfitSuggestion) => {
 onSkip(outfit);
 // Move to next slide
 if (api) {
 api.scrollNext();
 }
 };

 useEffect(() => {
 if (!api) return;

 const onSelect = () => {
 setCurrent(api.selectedScrollSnap());
 };

 api.on("select", onSelect);
 onSelect();

 return () => {
 api.off("select", onSelect);
 };
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
 {/* Card Header */}
 <div className="flex flex-col gap-1">
 <p className="font-bold text-lg text-card-foreground">{outfit.name}</p>
 <div className="flex items-center gap-2">
 <div className="h-1 w-8 bg-primary rounded-full"></div>
 <p className="text-sm text-muted-foreground italic">{outfit.style}</p>
 </div>
 </div>

 {/* Items List - expanded */}
 <div className="flex flex-col gap-3">
 {outfit.items.map((item, idx) => (
 <div key={item.id} className="flex gap-3 pb-3 border-b border-border/50 last:pb-0 last:border-b-0">
 {/* Item Image - larger */}
 <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-secondary overflow-hidden shadow-sm">
 <Image
 src={item.image || "/placeholder.jpg"}
 alt={item.name}
 width={64}
 height={64}
 className="w-full h-full object-cover"
 />
 </div>

 {/* Item Info - more detailed */}
 <div className="flex-1 min-w-0 flex flex-col justify-between">
 <div>
 <p className="text-xs font-semibold text-primary uppercase tracking-widest">{item.brand}</p>
 <p className="text-sm font-medium text-card-foreground mt-1">{item.name}</p>
 </div>
 <p className="text-sm font-bold text-emerald-500 dark:text-emerald-400 mt-2">
 {formatPrice(item.price)}
 </p>
 </div>

 {/* Item number */}
 <div className="flex-shrink-0 flex items-start justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
 {idx + 1}
 </div>
 </div>
 ))}
 </div>

 {/* Total Price Section */}
 <div className="flex items-center justify-between pt-2 px-3 py-3 rounded-xl bg-secondary/50">
 <span className="text-xs font-medium text-muted-foreground">Сумма образа:</span>
 <p className="text-lg font-bold text-card-foreground">
 {formatPrice(outfit.items.reduce((sum, item) => sum + item.price, 0))}
 </p>
 </div>

 {/* Footer Actions - Russian labels */}
 <div className="flex gap-3 pt-2">
 <Button onClick={() => handleSkip(outfit)}
 className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-secondary border border-border text-secondary-foreground text-sm font-semibold hover:bg-secondary/80 transition h-11"
 >
 <X size={18} />
 <span>Пропустить</span>
 </Button>
 <Button onClick={() => handleSave(outfit)}
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

 {/* Pagination Dots */}
 {suggestions.length > 1 && (
 <div className="flex justify-center gap-1 pt-1">
 {suggestions.map((_, idx) => (
 <button
 key={idx}
 onClick={() => api?.scrollTo(idx)}
 className={cn(
 "w-1 h-1 rounded-full transition-all",
 idx === current ? "bg-violet-600" : "bg-zinc-600"
 )}
 aria-label={`Go to outfit ${idx + 1}`}
 />
 ))}
 </div>
 )}
 </div>
 );
}

// ============================================
// Main ChatScreen Component
// ============================================
export function ChatScreen() {
 const [inputValue, setInputValue] = useState("");
 const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
 const messagesEndRef = useRef<HTMLDivElement>(null);

 const { 
 messages, 
 isAiTyping, 
 addMessage, 
 setAiTyping,
 saveOutfitFromSuggestion,
 markOutfitAsEvaluated,
 isOutfitEvaluated,
 } = useAppStore();

 // Convert messages to flat structure for rendering
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
 // Filter out already evaluated outfits
 const filteredSuggestions = msg.outfitSuggestions.filter(
 (outfit) => !isOutfitEvaluated(outfit.id)
 );
 
 if (filteredSuggestions.length > 0) {
 flatMessages.push({
 type: "OUTFIT_GROUP",
 id: `${msg.id}-outfits`,
 suggestions: filteredSuggestions,
 });
 } else {
 // All outfits for this message have been evaluated
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

 // Scroll to bottom on new messages
 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages, isAiTyping]);

 const handleSend = async (text?: string) => {
 const content = text || inputValue.trim();
 if (!content && !uploadedImage) return;

 addMessage({
 id: `msg-${Date.now()}`,
 content,
 sender: "user",
 timestamp: new Date(),
 attachments: uploadedImage ? [uploadedImage.preview] : undefined,
 });
 setInputValue("");
 setUploadedImage(null);

 setAiTyping(true);
 await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

 const { generateMockAIResponse } = await import("@/lib/mock-data");
 const aiResponse = generateMockAIResponse(content);
 addMessage(aiResponse);
 setAiTyping(false);
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
 {/* Header */}
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

 {/* Messages Area - flex-1 + min-h-0 ensures it shrinks properly in flex column */}
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

 {/* Composer - in-flow, flex-shrink-0 so it never collapses */}
 <div className="flex-shrink-0 bg-background border-t border-border mb-[70px]">
 {/* Quick buttons row - centered */}
 <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-hide justify-center">
 {QUICK_BUTTONS.map((btn) => (
 <Button key={btn.id}
 onClick={() => handleSend(btn.prompt)}
 disabled={isAiTyping}
 className="shrink-0 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 h-8"
 >
 {btn.label}
 </Button>
 ))}
 </div>

 {/* Image Preview */}
 {uploadedImage && (
 <div className="px-3 py-2 border-t border-border flex items-center gap-2 bg-secondary/50">
 <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
 <Image
 src={uploadedImage.preview || "/placeholder.svg"}
 alt="Uploaded"
 fill
 className="object-cover"
 />
 </div>
 <p className="text-xs text-muted-foreground flex-1 truncate">
 {uploadedImage.file.name}
 </p>
 <button
 onClick={() => setUploadedImage(null)}
 className="text-muted-foreground hover:text-foreground transition-colors p-1"
 title="Remove image"
 >
 <X size={16} />
 </button>
 </div>
 )}

 {/* Input area */}
 <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border">
 <ImageUploadInput
 variant="icon"
 size="md"
 onImageSelect={(file, preview) => setUploadedImage({ file, preview })}
 />
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
