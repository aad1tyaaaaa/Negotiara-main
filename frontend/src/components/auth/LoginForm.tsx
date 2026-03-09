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
        setError("");
        try {
            const response = await axios.post("http://localhost:4000/api/auth/login", { email, password });
            setUser(response.data);

            const role = response.data.role.toLowerCase();
            router.push(`/dashboard/${role}`);
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bento-card w-full max-w-md p-2 bg-secondary border-border">
            <CardHeader className="space-y-2 pb-8">
                <CardTitle className="text-3xl font-display font-bold text-center tracking-tighter uppercase italic">Welcome Back</CardTitle>
                <CardDescription className="text-center text-muted-foreground uppercase text-[10px] font-bold tracking-[0.2em]">Enter credentials to access terminal</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                        <input
                            type="email"
                            className="w-full p-4 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-zinc-700 font-medium"
                            placeholder="OPERATOR@NEGOTIARA.AI"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Password</label>
                        <input
                            type="password"
                            className="w-full p-4 rounded-xl bg-background border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-zinc-700 font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1">Access Level</label>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant={true ? "default" : "secondary"}
                                size="sm"
                                className="h-14"
                            >
                                Shipper
                            </Button>
                            <Button
                                type="button"
                                variant={false ? "default" : "secondary"}
                                size="sm"
                                className="h-14"
                            >
                                Carrier
                            </Button>
                        </div>
                    </div>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        variant="premium"
                        size="lg"
                        className="w-full h-16"
                    >
                        {isLoading ? "AUTHENTICATING..." : "INITIALIZE SESSION"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
