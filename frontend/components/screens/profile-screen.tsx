"use client";

import React from "react";
import { useState } from "react";
import Image from "next/image";
import { 
 User, 
 Bell, 
 Moon, 
 Sun, 
 LogOut, 
 ChevronRight,
 Ruler,
 Shirt,
 Bookmark,
 Footprints,
 Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface SettingsItemProps {
 icon: typeof User;
 label: string;
 value?: string;
 onClick?: () => void;
 trailing?: React.ReactNode;
}

function SettingsItem({ icon: Icon, label, value, onClick, trailing }: SettingsItemProps) {
  const isClickable = !!onClick && !trailing;

  const commonClass =
    "w-full flex items-center justify-between px-4 py-3 hover:bg-secondary rounded-lg transition-colors";

  if (isClickable) {
    return (
      <button onClick={onClick} className={commonClass} type="button">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{label}</p>
            {value && <p className="text-xs text-muted-foreground">{value}</p>}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  // trailing есть (Switch) => НЕ button, а div
  return (
    <div className={commonClass}>
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-primary" />
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {value && <p className="text-xs text-muted-foreground">{value}</p>}
        </div>
      </div>

      {/* чтобы клик по Switch не триггерил родителя (на будущее) */}
      <div onClick={(e) => e.stopPropagation()}>{trailing}</div>
    </div>
  );
}

export function ProfileScreen() {
 const [isEditFitOpen, setIsEditFitOpen] = useState(false);
 const [editHeight, setEditHeight] = useState("");
 const [editSize, setEditSize] = useState("");
 const [editShoeSize, setEditShoeSize] = useState("");

 const { 
 user, 
 theme, 
 setTheme, 
 logout,
 updateUserFit,
 wardrobeItems,
 savedOutfits,
 } = useAppStore();

 const handleThemeToggle = () => {
 setTheme(theme === "dark" ? "light" : "dark");
 };

 const openEditFit = () => {
 setEditHeight(user?.height?.toString() || "");
 setEditSize(user?.size || "");
 setEditShoeSize(user?.shoeSize?.toString() || "");
 setIsEditFitOpen(true);
 };

 const handleSaveFit = () => {
 updateUserFit(
 Number(editHeight) || 0,
 editSize,
 Number(editShoeSize) || 0
 );
 setIsEditFitOpen(false);
 };

 return (
 <div className="flex flex-col h-full bg-background pb-[70px]">
 {/* Header */}
 <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-4">
 <h1 className="text-xl font-bold text-foreground">Профиль</h1>
 </div>

 {/* Content */}
 <div className="flex-1 overflow-y-auto space-y-4 px-4 py-4">
 {/* Avatar & Name */}
 <div className="flex items-center gap-4 mb-6">
 <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
 {user?.avatar ? (
 <Image
 src={user.avatar || "/placeholder.svg"}
 alt={user.name}
 width={64}
 height={64}
 className="w-full h-full object-cover"
 />
 ) : (
 <User className="w-8 h-8 text-muted-foreground" />
 )}
 </div>
 <div>
 <h2 className="text-xl font-bold text-foreground">
 {user?.name || "Гость"}
 </h2>
 {user?.email && (
 <p className="text-sm text-muted-foreground">{user.email}</p>
 )}
 </div>
 </div>

 {/* My Fit Card - Priority Feature */}
 <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="font-semibold text-foreground">Мои параметры</h3>
 <button
 onClick={openEditFit}
 className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
 >
 <Pencil className="w-4 h-4 text-primary" />
 </button>
 </div>

 <div className="grid grid-cols-3 gap-4 text-center">
 <div className="space-y-1">
 <Ruler className="w-5 h-5 mx-auto text-primary mb-1" />
 <p className="text-lg font-bold text-foreground">
 {user?.height || "—"}
 </p>
 <p className="text-xs text-muted-foreground">Рост, см</p>
 </div>

 <div className="space-y-1">
 <Shirt className="w-5 h-5 mx-auto text-primary mb-1" />
 <p className="text-lg font-bold text-foreground">
 {user?.size || "—"}
 </p>
 <p className="text-xs text-muted-foreground">Размер</p>
 </div>

 <div className="space-y-1">
 <Footprints className="w-5 h-5 mx-auto text-primary mb-1" />
 <p className="text-lg font-bold text-foreground">
 {user?.shoeSize || "—"}
 </p>
 <p className="text-xs text-muted-foreground">Обувь</p>
 </div>
 </div>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-secondary rounded-lg p-3 text-center">
 <p className="text-2xl font-bold text-foreground">
 {wardrobeItems.length}
 </p>
 <p className="text-xs text-muted-foreground">Вещей</p>
 </div>

 <div className="bg-secondary rounded-lg p-3 text-center">
 <p className="text-2xl font-bold text-foreground">
 {savedOutfits.length}
 </p>
 <p className="text-xs text-muted-foreground">Образов</p>
 </div>
 </div>

 {/* Settings */}
 <div className="space-y-1 border-t border-border pt-4">
 <SettingsItem
 icon={Bell}
 label="Уведомления"
 onClick={() => {}}
 />
 <SettingsItem
 icon={Moon}
 label="Тема"
 value={theme === "dark" ? "Темная" : "Светлая"}
 trailing={<Switch checked={theme === "dark"} onCheckedChange={handleThemeToggle} />}
 />
 </div>

 {/* Logout */}
 <div className="border-t border-border pt-4">
 <button
 onClick={logout}
 className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
 >
 <LogOut className="w-5 h-5" />
 <span className="font-medium">Выйти</span>
 </button>
 </div>
 </div>

 {/* Edit Fit Dialog */}
 <Dialog open={isEditFitOpen} onOpenChange={setIsEditFitOpen}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Мои параметры</DialogTitle>
 </DialogHeader>

 <div className="space-y-4 py-4">
 <div>
 <label className="text-sm font-medium text-foreground mb-2 block">
 Рост (см)
 </label>
 <Input
 type="number"
 value={editHeight}
 onChange={(e) => setEditHeight(e.target.value)}
 className="bg-secondary border-0"
 />
 </div>

 <div>
 <label className="text-sm font-medium text-foreground mb-2 block">
 Размер одежды
 </label>
 <Input
 type="text"
 value={editSize}
 onChange={(e) => setEditSize(e.target.value)}
 className="bg-secondary border-0"
 />
 </div>

 <div>
 <label className="text-sm font-medium text-foreground mb-2 block">
 Размер обуви
 </label>
 <Input
 type="number"
 value={editShoeSize}
 onChange={(e) => setEditShoeSize(e.target.value)}
 className="bg-secondary border-0"
 />
 </div>
 </div>

 <DialogFooter>
 <Button onClick={() => setIsEditFitOpen(false)} variant="outline">
 Отмена
 </Button>
 <Button onClick={handleSaveFit}>
 Сохранить
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 </div>
 );
}
