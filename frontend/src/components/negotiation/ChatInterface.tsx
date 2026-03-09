"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Terminal, Cpu, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useState, useRef, useEffect } from "react";

interface Message {
    role: "SHIPPER" | "CARRIER";
    content: string;
    price?: number;
}

interface ChatInterfaceProps {
    messages: Message[];
    negotiationId?: string;
    onSendMessage?: (message: string, price: number) => void;
    isProcessing?: boolean;
}

export function ChatInterface({ messages, negotiationId, onSendMessage, isProcessing }: ChatInterfaceProps) {
    const [inputValue, setInputValue] = useState("");
    const [priceValue, setPriceValue] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue && !priceValue) return;
        const price = parseFloat(priceValue) || 0;
        onSendMessage?.(inputValue, price);
        setInputValue("");
        setPriceValue("");
    };

    return (
        <div className="flex flex-col h-full glass glow-border overflow-hidden rounded-[32px] bg-zinc-900/40 backdrop-blur-xl border-white/5">
            <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-display font-black text-sm uppercase tracking-[0.2em] text-white italic">Agent Coordination</h3>
                        <div className="text-[8px] text-white/30 font-black uppercase tracking-[0.3em] mt-1 italic">Bicorn Protocol Active</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">Live link</span>
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide bg-gradient-to-b from-transparent to-black/20">
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: msg.role === "SHIPPER" ? -10 : 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex gap-4 ${msg.role === "SHIPPER" ? "" : "flex-row-reverse"}`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all font-black italic text-sm ${msg.role === "SHIPPER" ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,184,0,0.2)]" : "bg-zinc-800 text-white border-white/10"}`}>
                                {msg.role === "SHIPPER" ? "S" : "C"}
                            </div>
                            <div className={`max-w-[80%] space-y-3 ${msg.role === "SHIPPER" ? "" : "text-right"}`}>
                                <div className={`p-5 rounded-2xl text-xs leading-relaxed font-bold border backdrop-blur-md shadow-xl ${msg.role === "SHIPPER" ? "bg-zinc-900/80 border-white/10 rounded-tl-none text-white/90" : "bg-primary/5 border-primary/20 rounded-tr-none text-primary"}`}>
                                    {msg.content}
                                </div>
                                {msg.price && msg.price > 0 && (
                                    <div className="inline-block">
                                        <div className="font-display font-black text-[10px] tracking-[0.2em] bg-black/80 border border-white/10 text-white px-4 py-2 rounded-lg uppercase italic shadow-lg">
                                            Transmission: <span className="text-primary">${msg.price.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isProcessing && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center p-6">
                            <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing Response...
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-8 bg-zinc-950/80 border-t border-white/5 backdrop-blur-md">
                <div className="flex gap-4 relative">
                    <div className="relative group">
                        <input
                            value={priceValue}
                            onChange={(e) => setPriceValue(e.target.value)}
                            placeholder="$ OFFER"
                            className="w-28 bg-zinc-900 border border-white/5 rounded-xl px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] italic focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/10"
                        />
                        <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                    </div>

                    <div className="flex-1 relative group">
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="MESSAGE AGENT..."
                            className="w-full bg-zinc-900 border border-white/5 rounded-xl px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] italic focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/10"
                        />
                        <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={isProcessing}
                        className="w-14 h-14 bg-primary text-black rounded-xl flex items-center justify-center hover:shadow-[0_0_30px_rgba(255,184,0,0.5)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
