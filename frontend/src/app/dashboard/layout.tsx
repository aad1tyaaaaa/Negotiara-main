"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/auth/login");
    };

    const handleBack = () => {
        router.push("/");
    };

    if (!user) return <>{children}</>;

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
                <div className="container px-4 md:px-8 xl:px-12 flex h-20 items-center justify-between mx-auto max-w-[1600px]">
                    <div className="flex items-center gap-6">
                        <Button variant="ghost" size="icon" onClick={handleBack} title="Go Back" className="text-muted-foreground hover:text-primary">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="hidden md:flex items-center gap-3">
                            <Image src="/logo.png" alt="Negotiara Logo" width={32} height={32} className="object-contain" />
                            <span className="font-display font-bold text-2xl tracking-tighter uppercase italic">
                                Negotiara<span className="text-primary">.</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-sm font-bold uppercase tracking-tight">{user.name}</span>
                            <span className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">{user.role}</span>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center font-bold text-primary shadow-inner">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="gap-2 border-border bg-secondary hover:bg-zinc-800 text-muted-foreground hover:text-white transition-all rounded-xl"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline uppercase text-xs font-bold tracking-widest">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
