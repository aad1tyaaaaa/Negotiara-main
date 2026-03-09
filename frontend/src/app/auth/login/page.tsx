"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ColorBends from "@/components/ui/ColorBends";

export default function LoginPage() {
    return (
        <div className="min-h-screen relative overflow-hidden bg-transparent flex items-center justify-center lg:justify-end lg:pr-32 py-12 px-6">
            {/* Background Background */}
            <div className="fixed inset-0 z-0">
                <ColorBends
                    colors={["#FFB800", "#FF5C00", "#FFB800"]}
                    rotation={45}
                    speed={0.1}
                    scale={1}
                    frequency={1}
                    warpStrength={1.5}
                    mouseInfluence={0.8}
                    parallax={0.5}
                    noise={0.1}
                    transparent
                    autoRotate={0.02}
                />
                <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
            </div>

            <Link href="/" className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10 font-black italic tracking-tighter text-white flex items-center gap-2 group transition-all">
                <div className="w-12 h-12 relative">
                    <img src="/logo.png" alt="Negotiara Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,184,0,0.4)]" />
                </div>
            </Link>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass p-1 rounded-[32px] overflow-hidden shadow-2xl">
                    <LoginForm />
                </div>

                <p className="mt-8 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] text-center lg:text-right">
                    SECURED LOGIN GATEWAY // PROTOCOL_V4.2
                </p>
                <div className="mt-4 text-center lg:text-right">
                    <Link href="/auth/signup" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">
                        DON'T HAVE AN ACCOUNT? INITIALIZE NEW OPERATOR
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
