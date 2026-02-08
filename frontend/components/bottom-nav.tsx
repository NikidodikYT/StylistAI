"use client";

import { MessageCircle, Shirt, Bookmark, User } from "lucide-react";
import type { Tab } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BottomNavProps {
 activeTab: Tab;
 onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: typeof MessageCircle }[] = [
 { id: "chat", label: "Чат", icon: MessageCircle },
 { id: "wardrobe", label: "Гардероб", icon: Shirt },
 { id: "collections", label: "Коллекции", icon: Bookmark },
 { id: "profile", label: "Профиль", icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
 return (
 <nav className="fixed bottom-0 left-0 right-0 h-[70px] border-t border-zinc-800 bg-background flex">
 {tabs.map((tab) => {
 const Icon = tab.icon;
 const isActive = activeTab === tab.id;

 return (
 <button
 key={tab.id}
 onClick={() => onTabChange(tab.id)}
 className={cn(
 "flex flex-col items-center justify-center gap-1 w-full h-full press-effect transition-smooth",
 isActive ? "text-primary" : "text-muted-foreground"
 )}
 aria-label={tab.label}
 aria-current={isActive ? "page" : undefined}
 >
 <Icon className="w-6 h-6" />
 <span className="text-xs">{tab.label}</span>
 </button>
 );
 })}
 </nav>
 );
}
