"use client";

import { OutfitCard } from "@/components/outfit-card";
import { useAppStore } from "@/lib/store";
import { COLLECTION_FILTERS, COLLECTION_FILTER_LABELS, type CollectionFilter } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CollectionsScreen() {
 const { 
 savedOutfits, 
 collectionsFilter, 
 setCollectionsFilter,
 toggleOutfitFavorite,
 removeOutfit,
 } = useAppStore();

 const filteredOutfits = collectionsFilter === "all"
 ? savedOutfits
 : savedOutfits.filter((outfit) => 
 outfit.tags.some((tag) => tag === collectionsFilter)
 );

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
 <OutfitCard
 key={outfit.id}
 outfit={outfit}
 onToggleFavorite={() => toggleOutfitFavorite(outfit.id)}
 onDelete={() => removeOutfit(outfit.id)}
 />
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
