"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag, Calendar } from "lucide-react";
import { OutfitCard } from "@/components/outfit-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
 Sheet,
 SheetContent,
 SheetHeader,
 SheetTitle,
} from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store";
import { COLLECTION_FILTERS, COLLECTION_FILTER_LABELS, type CollectionFilter, type Outfit } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatPrice(price: number): string {
 return new Intl.NumberFormat("ru-RU", {
 style: "currency",
 currency: "RUB",
 maximumFractionDigits: 0,
 }).format(price);
}

export function CollectionsScreen() {
 const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

 const { 
 savedOutfits, 
 collectionsFilter, 
 setCollectionsFilter,
 toggleOutfitFavorite,
 removeOutfit,
 } = useAppStore();

 const filteredOutfits = (collectionsFilter === "all"
 ? savedOutfits
 : savedOutfits.filter((outfit) => 
 outfit.tags.some((tag) => tag === collectionsFilter)
 )).sort((a, b) => {
 // Favorites first
 if (a.isFavorite !== b.isFavorite) {
 return a.isFavorite ? -1 : 1;
 }
 // Then by date (newest first)
 return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
 });

 return (
 <div className="flex flex-col h-screen bg-background pb-[70px]">
 {/* Header */}
 <div className="sticky top-0 z-10 border-b border-zinc-800 bg-background/95 px-4 py-4">
 <div className="flex items-center justify-between mb-3">
 <h1 className="text-xl font-bold text-foreground">Коллекции</h1>
 <span className="text-sm text-muted-foreground">{savedOutfits.length} образов</span>
 </div>

 {/* Filter chips */}
 <div className="flex gap-2 overflow-x-auto pb-2">
 {COLLECTION_FILTERS.map((filter) => (
 <button
 key={filter}
 onClick={() => setCollectionsFilter(filter)}
 className={cn(
 "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-smooth press-effect",
 collectionsFilter === filter
 ? "bg-primary text-primary-foreground"
 : "bg-secondary text-muted-foreground hover:text-foreground"
 )}
 >
 {COLLECTION_FILTER_LABELS[filter as CollectionFilter]}
 </button>
 ))}
 </div>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto">
 <div className="px-4 py-4">
 {filteredOutfits.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-center mt-8">
 <div className="text-4xl mb-3">✨</div>
 <h3 className="text-lg font-semibold text-foreground">Нет сохраненных образов</h3>
 <p className="text-sm text-muted-foreground">Создайте образ в чате с AI</p>
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-3">
 {filteredOutfits.map((outfit) => (
                <div
 key={outfit.id}
 className="cursor-pointer"
 onClick={() => setSelectedOutfit(outfit)}
 >
 <OutfitCard
 outfit={outfit}
 onToggleFavorite={() => toggleOutfitFavorite(outfit.id)}
 onDelete={() => removeOutfit(outfit.id)}
 />
 </div>
 ))}
 </div>
 )}
     </div>
 </div>

 {/* Outfit Detail Sheet */}
 <Sheet open={!!selectedOutfit} onOpenChange={() => setSelectedOutfit(null)}>
 <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
 {selectedOutfit && (
 <>
 <SheetHeader>
 <SheetTitle className="text-left">{selectedOutfit.name}</SheetTitle>
 </SheetHeader>

 {/* Occasion & Date */}
 <div className="flex items-center gap-3 mt-3">
 <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
 <Calendar className="w-4 h-4" />
 <span>{new Date(selectedOutfit.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
 </div>
 </div>

 {/* Tags */}
 <div className="flex flex-wrap gap-1.5 mt-3">
 <Badge variant="outline" className="text-xs capitalize">
 {selectedOutfit.occasion}
 </Badge>
 {selectedOutfit.tags.map((tag, idx) => (
 <Badge key={`${tag}-${idx}`} variant="secondary" className="text-xs capitalize">
 {tag}
 </Badge>
 ))}
 </div>

 {/* Items Grid */}
 <div className="mt-5">
 <p className="text-sm font-semibold text-foreground mb-3">
 Вещи в образе ({selectedOutfit.items.length})
 </p>
 <div className="space-y-3">
 {selectedOutfit.items.map((item) => (
 <div
 key={item.id}
 className="flex gap-3 p-2.5 bg-secondary rounded-xl"
 >
 <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
 <Image
 src={item.imageUrl || "/placeholder.svg"}
 alt={item.name}
 fill
 className="object-cover"
 />
 </div>
 <div className="flex-1 min-w-0 flex flex-col justify-center">
 <p className="text-sm font-medium text-foreground truncate">
 {item.name}
 </p>
 <p className="text-xs text-muted-foreground">
 {item.brand}
 </p>
 <p className="text-sm font-semibold text-primary mt-1">
 {formatPrice(item.price)}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Total Price */}
 <div className="flex items-center justify-between mt-5 p-3 bg-secondary/60 rounded-xl">
 <span className="text-sm text-muted-foreground">Общая стоимость</span>
 <span className="text-base font-bold text-foreground">
 {formatPrice(selectedOutfit.items.reduce((sum, item) => sum + item.price, 0))}
 </span>
 </div>

 {/* Actions */}
 <div className="flex gap-2 mt-5 pb-2">
 <Button
 onClick={() => {
 toggleOutfitFavorite(selectedOutfit.id);
 setSelectedOutfit({
 ...selectedOutfit,
 isFavorite: !selectedOutfit.isFavorite,
 });
 }}
 variant={selectedOutfit.isFavorite ? "default" : "outline"}
 className="flex-1"
 >
 <Heart
 className={cn(
 "w-4 h-4 mr-2",
 selectedOutfit.isFavorite ? "fill-current" : ""
 )}
 />
 {selectedOutfit.isFavorite ? "В избранном" : "В избранное"}
 </Button>
 <Button
 variant="destructive"
 size="icon"
 onClick={() => {
 removeOutfit(selectedOutfit.id);
 setSelectedOutfit(null);
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
