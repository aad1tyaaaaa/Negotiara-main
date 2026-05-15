import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'SHIPPER' | 'CARRIER' | 'ADMIN';
    token: string;
}

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: {
                id: "bypass-id-123",
                name: "OPERATOR ONE",
                email: "operator@negotiara.ai",
                role: "SHIPPER",
                token: "mock-token"
            },
            setUser: (user) => set({ user }),
            logout: () => set({ user: null }),
        }),
        {
            name: 'negotiara-auth',
        }
    )
);
