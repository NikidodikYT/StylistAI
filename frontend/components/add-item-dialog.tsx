"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUploadInput } from "@/components/image-upload-input";
import { useAppStore } from "@/lib/store";
import { type ClothingCategory, type ClothingItem } from "@/lib/types";
import { apiWardrobeUpload } from "@/lib/api";

const REAL_BRANDS = [
  "Nike","Adidas","Puma","Reebok","New Balance","Converse","Vans","Zara","H&M","Uniqlo",
  "Gap","Forever 21","ASOS","Shein","Boohoo","Gucci","Louis Vuitton","Prada","Chanel",
  "Hermes","Dior","Versace","Burberry","Fendi","Loewe","Balenciaga","Alexander McQueen",
  "Valentino","Dolce & Gabbana","Ralph Lauren","Tommy Hilfiger","Calvin Klein","Hugo Boss",
  "Lacoste","Polo Ralph Lauren","DKNY","Coach","Michael Kors","Fossil","Champion",
  "The North Face","Columbia","Arc'teryx","Patagonia","Salomon","Merrell","Timberland",
  "Dr. Martens","Crocs","UGG","Clarks","ECCO","Geox","Skechers",
];

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: ClothingCategory;
  onItemAdded?: (item: ClothingItem) => void;
}

export function AddItemDialog({
  open,
  onOpenChange,
  defaultCategory = "tops",
  onItemAdded,
}: AddItemDialogProps) {
  const { addWardrobeItem } = useAppStore();

  const [imageUrl, setImageUrl] = useState("/placeholder.svg");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ClothingCategory>(defaultCategory);
  const [color, setColor] = useState("");
  const [style, setStyle] = useState("Casual");
  const [season, setSeason] = useState("Любой сезон");
  const [isLoading, setIsLoading] = useState(false);
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);

  const handleImageUpload = (file: File, preview: string) => {
    setImageFile(file);
    setImageUrl(preview);
  };

  const handleBrandChange = (value: string) => {
    setBrand(value);
    if (value.trim()) {
      const filtered = REAL_BRANDS.filter((b) => b.toLowerCase().includes(value.toLowerCase()));
      setBrandSuggestions(filtered);
    } else {
      setBrandSuggestions([]);
    }
  };

  const handleSelectBrand = (selectedBrand: string) => {
    setBrand(selectedBrand);
    setBrandSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      alert("Загрузите фото вещи");
      return;
    }
    if (!name.trim() || !brand.trim() || !price.trim()) {
      alert("Заполните все обязательные поля");
      return;
    }

    setIsLoading(true);
    try {
      const backendItem = await apiWardrobeUpload({
        file: imageFile,
        category: category === "all" ? "tops" : category,
        color: color || undefined,
        brand: brand || undefined,
        description: name || undefined,
      });

      const seasonTagMap: Record<string, string> = {
        Весна: "spring",
        Лето: "summer",
        Осень: "autumn",
        Зима: "winter",
        "Любой сезон": "casual",
      };

      const newItem: ClothingItem = {
        id: String(backendItem.id ?? `item-${Date.now()}`),
        name: backendItem.description || name,
        brand: backendItem.brand || brand,
        price: parseInt(price),
        category: (backendItem.category || category) as any,
        imageUrl: backendItem.image_url || backendItem.imageUrl || imageUrl,
        color: backendItem.color || color,
        buyLink: "",
        createdAt: backendItem.created_at ? new Date(backendItem.created_at) : new Date(),
        tags: [
          style.toLowerCase() as ClothingItem["tags"][number],
          (seasonTagMap[season] || "casual") as ClothingItem["tags"][number],
        ],
      };

      addWardrobeItem(newItem);
      onItemAdded?.(newItem);

      setName("");
      setBrand("");
      setPrice("");
      setImageUrl("/placeholder.svg");
      setImageFile(null);
      setColor("");
      setStyle("Casual");
      setSeason("Любой сезон");
      setBrandSuggestions([]);

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding item:", error);
      alert(error?.message ?? "Ошибка при добавлении вещи");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить вещь в гардероб</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Фото вещи *</label>

            <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden border-2 border-dashed border-border">
              <Image src={imageUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" unoptimized />

              {/* ✅ Full clickable overlay + centered icon */}
              <ImageUploadInput
                variant="overlay"
                size="lg"
                overlayText={imageFile ? "Изменить фото" : "Загрузить фото"}
                onImageSelect={handleImageUpload}
              />
            </div>

            <p className="text-xs text-muted-foreground">Можно нажать в любое место на картинке</p>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Название вещи *</label>
            <Input placeholder="Например: Белая футболка" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Brand */}
          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-foreground">Бренд *</label>
            <Input
              placeholder="Начните писать название бренда..."
              value={brand}
              onChange={(e) => handleBrandChange(e.target.value)}
            />

            {brandSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-secondary border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                {brandSuggestions.slice(0, 8).map((suggestionBrand) => (
                  <button
                    key={suggestionBrand}
                    type="button"
                    onClick={() => handleSelectBrand(suggestionBrand)}
                    className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm text-foreground"
                  >
                    {suggestionBrand}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Цена (₽) *</label>
            <Input type="number" placeholder="Например: 2990" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Категория</label>
            <Select value={category} onValueChange={(val) => setCategory(val as ClothingCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tops">Верх</SelectItem>
                <SelectItem value="bottoms">Низ</SelectItem>
                <SelectItem value="shoes">Обувь</SelectItem>
                <SelectItem value="outerwear">Верхняя одежда</SelectItem>
                <SelectItem value="accessories">Аксессуары</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Цвет</label>
            <Input placeholder="Например: Белый, Чёрный, Синий" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>

          {/* Style */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Стиль</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Casual">Casual</SelectItem>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Sport">Sport</SelectItem>
                <SelectItem value="Vintage">Vintage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Season */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Сезон</label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Весна">Весна</SelectItem>
                <SelectItem value="Лето">Лето</SelectItem>
                <SelectItem value="Осень">Осень</SelectItem>
                <SelectItem value="Зима">Зима</SelectItem>
                <SelectItem value="Любой сезон">Любой сезон</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !brand.trim() || !price.trim() || !imageFile}
            className="flex-1"
          >
            {isLoading ? "Добавляю..." : "Добавить вещь"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
