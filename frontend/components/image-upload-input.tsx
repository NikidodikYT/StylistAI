"use client";

import React, { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadInputProps {
  onImageSelect: (file: File, preview: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon" | "overlay";
  overlayText?: string;
}

export function ImageUploadInput({
  onImageSelect,
  className,
  size = "md",
  variant = "button",
  overlayText = "Нажмите, чтобы загрузить",
}: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, загрузите файл изображения");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onImageSelect(file, preview);
    };
    reader.readAsDataURL(file);

    if (inputRef.current) inputRef.current.value = "";
  };

  const trigger = () => inputRef.current?.click();

  const iconSize = size === "sm" ? 16 : size === "md" ? 18 : 22;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Upload image"
      />

      {variant === "overlay" && (
        <button
          type="button"
          onClick={trigger}
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2",
            "bg-black/0 hover:bg-black/10 transition-colors",
            "text-muted-foreground hover:text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/40",
            className
          )}
          title="Upload image"
        >
          <div
            className="rounded-full bg-background/70 border border-border shadow-sm flex items-center justify-center"
            style={{
              width: size === "lg" ? 56 : size === "md" ? 44 : 36,
              height: size === "lg" ? 56 : size === "md" ? 44 : 36,
            }}
          >
            <ImagePlus size={iconSize} />
          </div>
          <span className="text-xs bg-background/70 border border-border rounded-full px-3 py-1">
            {overlayText}
          </span>
        </button>
      )}

      {variant === "icon" && (
        <button
          type="button"
          onClick={trigger}
          className={cn(
            "rounded-full flex items-center justify-center flex-shrink-0 transition-colors hover:text-foreground",
            size === "sm" && "h-8 w-8 p-0",
            size === "md" && "h-9 w-9 p-0",
            size === "lg" && "h-10 w-10 p-0",
            "text-muted-foreground",
            className
          )}
          title="Upload image"
        >
          <ImagePlus size={iconSize} />
        </button>
      )}

      {variant === "button" && (
        <button
          type="button"
          onClick={trigger}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95 font-medium",
            size === "sm" && "px-2 py-1 text-xs h-8",
            size === "md" && "px-3 py-2 text-sm h-10",
            size === "lg" && "px-4 py-3 text-base h-12",
            className
          )}
        >
          <ImagePlus size={size === "sm" ? 14 : size === "md" ? 16 : 18} className="flex-shrink-0" />
          <span className="hidden sm:inline">Загрузить фото</span>
        </button>
      )}
    </>
  );
}
