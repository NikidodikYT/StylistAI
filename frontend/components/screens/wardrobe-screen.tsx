"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Plus, Sparkles, Pencil, Trash2, Star, Filter, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { CATEGORY_LABELS, type ClothingCategory, type ClothingItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const categories: ClothingCategory[] = ["all", "tops", "bottoms", "shoes", "outerwear", "accessories"];

// Filter options
const STYLE_OPTIONS = ["Все", "Casual", "Sport", "Evening", "Office"];
const SEASON_OPTIONS = ["Все", "Весна", "Лето", "Осень", "Зима"];
const COLOR_OPTIONS = ["Все", "Белый", "Черный", "Синий", "Серый", "Красный"];

function formatPrice(price: number): string {
 return new Intl.NumberFormat("ru-RU", {
 style: "currency",
 currency: "RUB",
 maximumFractionDigits: 0,
 }).format(price);
}

export function WardrobeScreen() {
 const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
 const [showFilters, setShowFilters] = useState(false);
 const [styleFilter, setStyleFilter] = useState("Все");
 const [seasonFilter, setSeasonFilter] = useState("Все");
 const [colorFilter, setColorFilter] = useState("Все");
 
 const { 
 wardrobeItems, 
 wardrobeFilter, 
 wardrobeFavorites,
 setWardrobeFilter,
 removeWardrobeItem,
 toggleWardrobeFavorite,
 setActiveTab,
 } = useAppStore();

 // Filter and sort items (favorites pinned to top)
 const filteredItems = useMemo(() => {
 let items = wardrobeFilter === "all"
 ? wardrobeItems
 : wardrobeItems.filter((item) => item.category === wardrobeFilter);

 // Apply style filter
 if (styleFilter !== "Все") {
 items = items.filter((item) => 
 item.tags.some((tag) => tag.toLowerCase().includes(styleFilter.toLowerCase()))
 );
 }

 // Apply season filter
 if (seasonFilter !== "Все") {
 const seasonMap: Record<string, string> = {
 "Весна": "spring",
 "Лето": "summer",
 "Осень": "autumn",
 "Зима": "winter",
 };
 items = items.filter((item) => 
 item.tags.includes(seasonMap[seasonFilter] as ClothingItem["tags"][number])
 );
 }

 // Apply color filter
 if (colorFilter !== "Все") {
 items = items.filter((item) => 
 item.color?.toLowerCase().includes(colorFilter.toLowerCase())
 );
 }

 // Sort: favorites first
 return items.sort((a, b) => {
 const aFav = wardrobeFavorites.includes(a.id);
 const bFav = wardrobeFavorites.includes(b.id);
 if (aFav && !bFav) return -1;
 if (!aFav && bFav) return 1;
 return 0;
 });
 }, [wardrobeItems, wardrobeFilter, wardrobeFavorites, styleFilter, seasonFilter, colorFilter]);

 const handleGenerateOutfit = (item: ClothingItem) => {
 setActiveTab("chat");
 setSelectedItem(null);
 };

 const hasActiveFilters = styleFilter !== "Все" || seasonFilter !== "Все" || colorFilter !== "Все";

 return (
 <div className="flex flex-col h-screen bg-background pb-[70px]">
 {/* Header */}
 <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3">
 <div className="flex items-center justify-between">
 <h1 className="text-xl font-bold text-foreground">Гардероб</h1>
 <div className="flex gap-2">
 <button
 onClick={() => setShowFilters(!showFilters)}
 className="p-2 hover:bg-secondary rounded-lg transition-colors"
 >
 <Filter className="w-5 h-5 text-foreground" />
 {hasActiveFilters && <span className="absolute w-2 h-2 bg-primary rounded-full" />}
 </button>
 
 <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
 <Plus className="w-5 h-5 text-foreground" />
 </button>
 </div>
 </div>
 

 {/* Category tabs */}
 <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
 {categories.map((category) => (
 <button
 key={category}
 onClick={() => setWardrobeFilter(category)}
 className={cn(
 "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-smooth press-effect",
 wardrobeFilter === category
 ? "bg-primary text-primary-foreground"
 : "bg-secondary text-muted-foreground hover:text-foreground"
 )}
 >
 {CATEGORY_LABELS[category]}
 </button>
 ))}
 </div>

 {/* Filters Panel (flyout) */}
 {showFilters && (
 <div className="border-t border-border p-4 space-y-4 bg-secondary/50">
 {/* Style filter */}
 <div>
 <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Стиль</p>
 <div className="flex gap-2 overflow-x-auto pb-1">
 {STYLE_OPTIONS.map((opt) => (
 <button
 key={opt}
 onClick={() => setStyleFilter(opt)}
 className={cn(
 "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
 styleFilter === opt
 ? "bg-primary text-primary-foreground shadow-md"
 : "bg-background border border-border text-foreground hover:border-primary"
 )}
 >
 {opt}
 </button>
 ))}
 </div>
 </div>

 {/* Season filter */}
 <div>
 <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Сезон</p>
 <div className="flex gap-2 overflow-x-auto pb-1">
 {SEASON_OPTIONS.map((opt) => (
 <button
 key={opt}
 onClick={() => setSeasonFilter(opt)}
 className={cn(
 "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
 seasonFilter === opt
 ? "bg-primary text-primary-foreground shadow-md"
 : "bg-background border border-border text-foreground hover:border-primary"
 )}
 >
 {opt}
 </button>
 ))}
 </div>
 </div>

 {/* Color filter */}
 <div>
 <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Цвет</p>
 <div className="flex gap-2 overflow-x-auto pb-1">
 {COLOR_OPTIONS.map((opt) => (
 <button
 key={opt}
 onClick={() => setColorFilter(opt)}
 className={cn(
 "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
 colorFilter === opt
 ? "bg-primary text-primary-foreground shadow-md"
 : "bg-background border border-border text-foreground hover:border-primary"
 )}
 >
 {opt}
 </button>
 ))}
 </div>
 </div>

 {/* Reset filters */}
 {hasActiveFilters && (
 <button
 onClick={() => {
 setStyleFilter("Все");
 setSeasonFilter("Все");
 setColorFilter("Все");
 }}
 className="text-xs text-primary hover:underline self-start font-medium"
 >
 Сбросить фильтры
 </button>
 )}
 </div>
 )}
 </div>

 {/* Content - 3 Column Grid */}
 <div className="flex-1 overflow-y-auto px-4 py-4">
 {filteredItems.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-center">
 <div className="text-4xl mb-3">👗</div>
 <h3 className="text-lg font-semibold text-foreground">Гардероб пуст</h3>
 <p className="text-sm text-muted-foreground">Добавьте первую вещь</p>
 </div>
 ) : (
 <div className="grid grid-cols-3 gap-3">
 {filteredItems.map((item) => {
 const isFavorite = wardrobeFavorites.includes(item.id);
 return (
 <div key={item.id} className="flex flex-col gap-2">
 <button
 onClick={() => setSelectedItem(item)}
 className="w-full relative aspect-square bg-muted overflow-hidden rounded-2xl press-effect hover:shadow-md transition-shadow"
 >
 <Image
 src={item.imageUrl || "/placeholder.svg"}
 alt={item.name}
 fill
 className="object-cover"
 />
 <button
 onClick={(e) => {
 e.stopPropagation();
 toggleWardrobeFavorite(item.id);
 }}
 className={cn(
 "absolute top-2 right-2 size-7 rounded-full flex items-center justify-center transition-colors shadow-sm",
 isFavorite
 ? "bg-yellow-500 text-black"
 : "bg-black/50 text-white hover:bg-black/70"
 )}
 >
 <Star className="w-4 h-4" fill="currentColor" />
 </button>
 </button>
 <p className="text-xs font-medium text-foreground text-center truncate px-1">
 {item.name}
 </p>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Bottom Sheet for Item Details */}
 <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
 <SheetContent side="bottom" className="max-h-[80vh]">
 {selectedItem && (
 <>
 <SheetHeader>
 <SheetTitle>{selectedItem.name}</SheetTitle>
 </SheetHeader>

 {/* Large Image */}
 <div className="relative w-full aspect-square bg-muted mt-4 rounded-lg overflow-hidden">
 <Image
 src={selectedItem.imageUrl || "/placeholder.svg"}
 alt={selectedItem.name}
 fill
 className="object-cover"
 />
 </div>

 {/* Info */}
 <div className="mt-4 space-y-1">
 <p className="text-sm text-muted-foreground">
 {selectedItem.brand}
 </p>
 <h2 className="text-xl font-bold text-foreground">
 {selectedItem.name}
 </h2>
 <p className="text-lg font-semibold text-primary">
 {formatPrice(selectedItem.price)}
 </p>
 </div>

 {/* Tags */}
 <div className="flex flex-wrap gap-2 mt-4">
 {selectedItem.tags.map((tag) => (
 <Badge key={tag} variant="secondary">{tag}</Badge>
 ))}
 </div>

 {/* Actions */}
 <div className="flex gap-2 mt-6">
 <Button
 onClick={() => handleGenerateOutfit(selectedItem)}
 variant="default"
 className="flex-1"
 >
 <Sparkles className="w-4 h-4 mr-2" />
 Создать образ с этой вещью
 </Button>
 
 <Button variant="outline" size="icon">
 <Pencil className="w-4 h-4" />
 </Button>
 <Button
 variant="destructive"
 size="icon"
 onClick={() => {
 removeWardrobeItem(selectedItem.id);
 setSelectedItem(null);
 }}
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 </div>
 </>
 )}
 </SheetContent>
 </Sheet>
 </div>
 );
}
