"use client";

/**
 * WardrobeScreen (REAL BACKEND)
 * - Loads wardrobe from backend
 * - Deletes items via backend
 * - Add button is ALWAYS visible (even when empty)
 */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Sparkles, Pencil, Trash2, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { CATEGORY_LABELS, type ClothingCategory, type ClothingItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AddItemDialog } from "@/components/add-item-dialog";
import { API_BASE_URL, apiWardrobeDelete, apiWardrobeList } from "@/lib/api";

// Категории одежды для фильтрации
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

// backend -> frontend mapping
type BackendWardrobeItem = {
  id: number;
  category?: string | null;
  color?: string | null;
  brand?: string | null;
  description?: string | null;
  image_url?: string | null;
  created_at?: string | null;
};

type WardrobeListResponse = {
  total: number;
  items: BackendWardrobeItem[];
};

function toAbsImageUrl(url: string | null | undefined) {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http")) return url;

  // IMPORTANT:
  // backend returns "uploads/clothing/xxx.jpg" or "/uploads/clothing/xxx.jpg"
  const normalized = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${normalized}`;
}

function mapBackendToFrontend(b: BackendWardrobeItem): ClothingItem {
  const id = String(b.id);
  const category = (b.category || "tops") as any;

  const name =
    (b.description && b.description.trim()) ||
    (b.category ? `Item: ${b.category}` : "Item");

  return {
    id,
    name,
    brand: b.brand || "—",
    price: 0,
    category,
    imageUrl: toAbsImageUrl(b.image_url),
    color: b.color || "",
    buyLink: "",
    createdAt: b.created_at ? new Date(b.created_at) : new Date(),
    tags: ["casual"],
  } as ClothingItem;
}

export function WardrobeScreen() {
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [styleFilter, setStyleFilter] = useState("Все");
  const [seasonFilter, setSeasonFilter] = useState("Все");
  const [colorFilter, setColorFilter] = useState("Все");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    wardrobeItems,
    wardrobeFilter,
    wardrobeFavorites,
    setWardrobeFilter,
    setWardrobeItems,
    removeWardrobeItem,
    toggleWardrobeFavorite,
    setActiveTab,
    addWardrobeItem,
    isAuthenticated,
  } = useAppStore();

  // --- load from backend once authenticated ---
  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        setIsLoading(true);
        const res = await apiWardrobeList(0, 200);
        const data = res as WardrobeListResponse;
        const mapped = (data.items || []).map(mapBackendToFrontend);

        setWardrobeItems(mapped);
        // eslint-disable-next-line no-console
        console.log("[wardrobe] loaded from backend:", mapped.length);
      } catch (e) {
        console.error("Failed to load wardrobe:", e);
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Filter and sort items (favorites pinned to top)
  const filteredItems = useMemo(() => {
    const items_array = wardrobeItems || [];
    let items =
      wardrobeFilter === "all"
        ? items_array
        : items_array.filter((item) => item.category === wardrobeFilter);

    // Apply style filter
    if (styleFilter !== "Все") {
      items = items.filter((item) =>
        (item.tags || []).some((tag) =>
          tag.toLowerCase().includes(styleFilter.toLowerCase())
        )
      );
    }

    // Apply season filter
    if (seasonFilter !== "Все") {
      const seasonMap: Record<string, string> = {
        Весна: "spring",
        Лето: "summer",
        Осень: "autumn",
        Зима: "winter",
      };
      items = items.filter((item) =>
        (item.tags || []).includes(
          seasonMap[seasonFilter] as ClothingItem["tags"][number]
        )
      );
    }

    // Apply color filter
    if (colorFilter !== "Все") {
      items = items.filter((item) =>
        item.color?.toLowerCase().includes(colorFilter.toLowerCase())
      );
    }

    // Sort: favorites first
    const favorites = wardrobeFavorites || [];
    return items.sort((a, b) => {
      const aFav = favorites.includes(a.id);
      const bFav = favorites.includes(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });
  }, [
    wardrobeItems,
    wardrobeFilter,
    wardrobeFavorites,
    styleFilter,
    seasonFilter,
    colorFilter,
  ]);

  const handleGenerateOutfit = (item: ClothingItem) => {
    // MVP: просто перекидываем в чат (AI может быть выключен)
    setActiveTab("chat");
    setSelectedItem(null);
  };

  const handleDelete = async (item: ClothingItem) => {
    try {
      // item.id у нас строка, но с бэка это число.
      const numericId = Number(item.id);
      if (!Number.isFinite(numericId)) {
        alert("Нельзя удалить: неправильный id (не число).");
        return;
      }

      await apiWardrobeDelete(numericId);
      removeWardrobeItem(item.id);
      setSelectedItem(null);
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Не получилось удалить на бэке. Проверь токен и /docs.");
    }
  };

  const hasActiveFilters =
    styleFilter !== "Все" || seasonFilter !== "Все" || colorFilter !== "Все";

  // ✅ Кнопка “Добавить” как карточка (всегда)
  const AddCard = (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setShowAddDialog(true)}
        className="w-full relative aspect-square bg-secondary rounded-2xl border-2 border-dashed border-muted-foreground hover:border-foreground hover:bg-secondary/70 transition-all flex items-center justify-center group"
      >
        <Plus className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>
      <p className="text-xs font-medium text-muted-foreground text-center">
        Добавить
      </p>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background pb-[70px]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Гардероб</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors relative"
          >
            <Filter className="w-5 h-5 text-foreground" />
            {hasActiveFilters && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
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
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Стиль
              </p>
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
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Сезон
              </p>
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
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Цвет
              </p>
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
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground">Загружаю гардероб…</p>
          </div>
        ) : filteredItems.length === 0 ? (
          // ✅ Пусто, но “Добавить” всё равно показываем
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-3">👗</div>
              <h3 className="text-lg font-semibold text-foreground">
                Гардероб пуст
              </h3>
              <p className="text-sm text-muted-foreground">
                Добавьте первую вещь
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {AddCard}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isFavorite = (wardrobeFavorites || []).includes(item.id);
              return (
                <div key={item.id} className="flex flex-col gap-2">
                  <div
                    className="w-full relative aspect-square bg-muted overflow-hidden rounded-2xl press-effect hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
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
                      aria-label={
                        isFavorite
                          ? "Убрать из избранного"
                          : "Добавить в избранное"
                      }
                    >
                      <Star className="w-4 h-4" fill="currentColor" />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-foreground text-center truncate px-1">
                    {item.name}
                  </p>
                </div>
              );
            })}

            {/* ✅ Add New Item Button (ALWAYS visible when not empty) */}
            {AddCard}
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
                  unoptimized
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
                  {formatPrice(selectedItem.price || 0)}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {(selectedItem.tags || []).map((tag, index) => (
                  <Badge key={`${tag}-${index}`} variant="secondary">
                    {tag}
                  </Badge>
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

                <Button variant="outline" size="icon" disabled>
                  <Pencil className="w-4 h-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(selectedItem)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        defaultCategory={
          wardrobeFilter === "all" ? "tops" : (wardrobeFilter as ClothingCategory)
        }
      />
    </div>
  );
}
