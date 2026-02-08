"use client";
import Image from "next/image";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Outfit } from "@/lib/types";
import { cn } from "@/lib/utils";

interface OutfitCardProps {
 outfit: Outfit;
 onToggleFavorite?: () => void;
 onDelete?: () => void;
}

export function OutfitCard({ outfit, onToggleFavorite, onDelete }: OutfitCardProps) {
 // Take first 4 items for the collage
 const displayItems = outfit.items.slice(0, 4);
 const gridCols = displayItems.length >= 4 ? 2 : displayItems.length >= 2 ? 2 : 1;

 return (
 <div className="bg-secondary rounded-xl overflow-hidden hover:bg-secondary/80 transition-colors">
 {/* Image collage */}
 <div className="relative aspect-square bg-muted overflow-hidden">
 <div className={cn(
 "grid w-full h-full",
 gridCols === 2 ? "grid-cols-2 grid-rows-2" : "grid-cols-1"
 )}>
 {displayItems.map((item) => (
 <div key={item.id} className="relative w-full h-full">
 <Image
 src={item.imageUrl || "/placeholder.svg"}
 alt={item.name}
 fill
 className="object-cover"
 />
 </div>
 ))}
 </div>

 {/* Favorite button overlay */}
 <button
 onClick={(e) => {
 e.stopPropagation();
 onToggleFavorite?.();
 }}
 className="absolute top-2 right-2 size-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
 >
 <Heart className={cn(
 "w-4 h-4",
 outfit.isFavorite ? "fill-red-500 text-red-500" : "text-zinc-600"
 )} />
 </button>
 </div>

 {/* Content */}
 <div className="p-3 space-y-2">
 <div>
 <h3 className="font-semibold text-foreground text-sm line-clamp-1">
 {outfit.name}
 </h3>
 <p className="text-xs text-muted-foreground">
 {outfit.occasion}
 </p>
 </div>

 {onDelete && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 onDelete();
 }}
 className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-red-500 hover:bg-red-500/10 rounded text-xs transition-colors"
 >
 <Trash2 className="w-3 h-3" />
 Удалить
 </button>
 )}

 {/* Tags */}
 <div className="flex flex-wrap gap-1">
 {outfit.tags.slice(0, 2).map((tag) => (
 <Badge key={tag} variant="secondary" className="text-xs">
 {tag}
 </Badge>
 ))}
 {outfit.tags.length > 2 && (
 <Badge variant="secondary" className="text-xs">
 +{outfit.tags.length - 2}
 </Badge>
 )}
 </div>
 </div>
 </div>
 );
}
