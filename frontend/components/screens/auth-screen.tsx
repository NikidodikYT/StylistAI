"use client";

import React from "react"

import { useState } from "react";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";

type AuthMode = "login" | "register";

export function AuthScreen() {
 const [mode, setMode] = useState<AuthMode>("login");
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [name, setName] = useState("");
 const [showPassword, setShowPassword] = useState(false);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");

 const { login } = useAppStore();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError("");
 setIsLoading(true);

 try {
 if (mode === "register" && !name.trim()) {
 setError("Введите имя");
 setIsLoading(false);
 return;
 }
 if (!email.trim()) {
 setError("Введите email");
 setIsLoading(false);
 return;
 }
 if (!password.trim() || password.length < 4) {
 setError("Пароль должен быть не менее 4 символов");
 setIsLoading(false);
 return;
 }

 // Mock login/register - always succeeds
 await login(email, password);
 } catch {
 setError("Ошибка авторизации");
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="w-full h-screen bg-background flex flex-col items-center justify-center px-4">
 {/* Logo / Brand */}
 <div className="mb-8 text-center">
 <div className="flex items-center justify-center gap-2 mb-3">
 <Sparkles className="w-8 h-8 text-primary" />
 <h1 className="text-3xl font-bold text-foreground">StylistAI</h1>
 </div>
 <p className="text-muted-foreground">Ваш персональный стилист</p>
 </div>

 {/* Auth Form */}
 <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
 {mode === "register" && (
 <Input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="h-12 rounded-xl bg-secondary border-0 px-4"
 placeholder="Имя"
 />
 )}

 <Input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="h-12 rounded-xl bg-secondary border-0 px-4"
 placeholder="Email"
 />

 <div className="relative">
 <Input
 type={showPassword ? "text" : "password"}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="h-12 rounded-xl bg-secondary border-0 px-4 pr-12"
 placeholder="Пароль"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
 >
 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
 </button>
 </div>

 {error && (
 <div className="text-red-500 text-sm">{error}</div>
 )}

 <Button
 type="submit"
 disabled={isLoading}
 className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold"
 >
 {isLoading ? (
 <div className="animate-spin" />
 ) : mode === "login" ? (
 "Войти"
 ) : (
 "Зарегистрироваться"
 )}
 </Button>

 {/* Toggle Mode */}
 <div className="text-center text-sm text-muted-foreground">
 {mode === "login" ? (
 <>
 Нет аккаунта?{" "}
 <button
 type="button"
 onClick={() => {
 setMode("register");
 setError("");
 }}
 className="text-primary font-medium hover:underline"
 >
 Зарегистрироваться
 </button>
 </>
 ) : (
 <>
 Уже есть аккаунт?{" "}
 <button
 type="button"
 onClick={() => {
 setMode("login");
 setError("");
 }}
 className="text-primary font-medium hover:underline"
 >
 Войти
 </button>
 </>
 )}
 </div>
 </form>
 </div>
 );
}
