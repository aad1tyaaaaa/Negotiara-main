"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Wait for hydration to ensure store is loaded from localStorage
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (isHydrated && !user) {
            router.push("/auth/login");
        }
    }, [isHydrated, user, router]); // Adding router here is safe as it is stable, but we should be careful if it re-renders. Actually, next/navigation router IS stable.


    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Authenticating Node...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
