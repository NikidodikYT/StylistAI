"use client";
import { useEffect, useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { ChatScreen } from "@/components/screens/chat-screen";
import { WardrobeScreen } from "@/components/screens/wardrobe-screen";
import { CollectionsScreen } from "@/components/screens/collections-screen";
import { ProfileScreen } from "@/components/screens/profile-screen";
import { AuthScreen } from "@/components/screens/auth-screen";
import { useAppStore } from "@/lib/store";
export function AppLayout() {
const { activeTab, setActiveTab, isAuthenticated, initializeStore } = useAppStore();
const [isHydrated, setIsHydrated] = useState(false);
// Initialize store with mock data on mount
useEffect(() => {
initializeStore();
setIsHydrated(true);
}, [initializeStore]);
// Show nothing during hydration to prevent flash
if (!isHydrated) {
return (
<div className="w-full h-screen bg-background" />
);
}
// Show auth screen if not authenticated
if (!isAuthenticated) {
return <AuthScreen />;
}
return (
<div className="relative w-full h-screen bg-background flex flex-col overflow-hidden">
{/* Main content area */}
<div className="flex-1 overflow-hidden">
{activeTab === "chat" && <ChatScreen />}
{activeTab === "wardrobe" && <WardrobeScreen />}
{activeTab === "collections" && <CollectionsScreen />}
{activeTab === "profile" && <ProfileScreen />}
</div>
{/* Bottom navigation - fixed bottom-0 */}
<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
</div>
);
}
