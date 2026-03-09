"use client";

import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8 relative overflow-hidden bg-background">
            <Link href="/" className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary uppercase font-bold text-xs tracking-widest">
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO HOME
                </Button>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-4"
            >
                <div className="w-16 h-16 relative">
                    <img src="/logo.png" alt="Negotiara Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,184,0,0.3)]" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-md"
            >
                <SignupForm />
            </motion.div>

            <p className="text-muted-foreground text-sm font-medium">
                ALREADY HAVE AN ACCOUNT?{" "}
                <Link href="/auth/login" className="text-primary font-bold hover:underline transition-all">
                    SIGN IN HERE
                </Link>
            </p>
        </div>
    );
}
