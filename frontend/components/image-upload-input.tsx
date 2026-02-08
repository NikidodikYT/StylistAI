"use client";

import React, { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadInputProps {
  onImageSelect: (file: File, preview: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon";
}

export function ImageUploadInput({
  onImageSelect,
  className,
  size = "md",
  variant = "button",
}: ImageUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, загрузите файл изображения");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onImageSelect(file, preview);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  if (variant === "icon") {
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
        <button
          onClick={() => inputRef.current?.click()}
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
          <ImagePlus size={size === "sm" ? 16 : size === "md" ? 18 : 20} />
        </button>
      </>
    );
  }

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
      <button
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80 active:scale-95 font-medium",
          size === "sm" && "px-2 py-1 text-xs h-8",
          size === "md" && "px-3 py-2 text-sm h-10",
          size === "lg" && "px-4 py-3 text-base h-12",
          className
        )}
      >
        <ImagePlus
          size={size === "sm" ? 14 : size === "md" ? 16 : 18}
          className="flex-shrink-0"
        />
        <span className="hidden sm:inline">Загрузить фото</span>
      </button>
    </>
  );
}
