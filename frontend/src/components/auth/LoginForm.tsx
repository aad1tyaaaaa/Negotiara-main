"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import axios from "axios";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user, setUser } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        if (user) {
            router.push(`/dashboard/${user.role.toLowerCase()}`);
        }
    }, [user, router]);

    if (!mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // BYPASS: Set user directly and redirect
        setTimeout(() => {
            setUser({
                id: "bypass-id-123",
                name: "OPERATOR ONE",
                email: "operator@negotiara.ai",
                role: "SHIPPER",
                token: "mock-token"
            });
            router.push("/dashboard/shipper");
        }, 500);
    };


    return (
        <div className="rounded-xl border text-card-foreground shadow glass bento-card w-full max-w-md p-2 bg-secondary border-border">
            <div className="flex flex-col p-6 space-y-2 pb-8">
                <h3 className="text-3xl font-display font-bold text-center tracking-tighter uppercase italic">Welcome Back</h3>
                <p className="text-center text-muted-foreground uppercase text-[10px] font-bold tracking-[0.2em]">Enter credentials to access terminal</p>
            </div>
            <div className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                        <input
                            className="w-full p-4 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-zinc-700 font-medium"
                            placeholder="OPERATOR@NEGOTIARA.AI"
                            autoComplete="email"
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Password</label>
                        <input
                            className="w-full p-4 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-zinc-700 font-medium"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Access Level</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                className="inline-flex items-center justify-center whitespace-nowrap font-sans font-black uppercase tracking-tight transition-all cursor-pointer select-none active:translate-x-[0.05em] active:translate-y-[0.05em] active:shadow-[0.05em_0.05em_0px_0px_rgba(0,0,0,1)] disabled:pointer-events-none disabled:opacity-50 bg-[#fbca1f] text-black border-black hover:shadow-[0.15em_0.15em_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[0.05em] hover:-translate-y-[0.05em] px-4 text-[14px] rounded-[0.3em] border-[2px] shadow-[0.08em_0.08em_0px_0px_rgba(0,0,0,1)] h-14"
                                type="button"
                            >
                                Shipper
                            </button>
                            <button
                                className="inline-flex items-center justify-center whitespace-nowrap font-sans font-black uppercase tracking-tight transition-all cursor-pointer select-none active:translate-x-[0.05em] active:translate-y-[0.05em] active:shadow-[0.05em_0.05em_0px_0px_rgba(0,0,0,1)] disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-white border-black hover:bg-zinc-800 px-4 text-[14px] rounded-[0.3em] border-[2px] shadow-[0.08em_0.08em_0px_0px_rgba(0,0,0,1)] h-14"
                                type="button"
                            >
                                Carrier
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    <button
                        className="inline-flex items-center justify-center whitespace-nowrap font-sans font-black uppercase tracking-tight transition-all cursor-pointer select-none active:translate-x-[0.05em] active:translate-y-[0.05em] active:shadow-[0.05em_0.05em_0px_0px_rgba(0,0,0,1)] disabled:pointer-events-none disabled:opacity-50 bg-[#FFB800] text-black border-black shadow-[0.15em_0.15em_0px_0px_rgba(0,0,0,1)] hover:shadow-[0.2em_0.2em_0px_0px_rgba(0,0,0,1),0_0_20px_rgba(255,184,0,0.4)] hover:-translate-x-[0.05em] hover:-translate-y-[0.05em] px-12 text-[22px] rounded-[0.5em] border-[4px] w-full h-16"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
                    </button>
                </form>
            </div>
        </div>
    );
}
