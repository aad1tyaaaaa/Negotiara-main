"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Cpu, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
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
    targetPrice?: number;
    currentRound?: number;
    maxRounds?: number;
    dealConfirmedPrice?: number;
    recommendation?: string;
}

export function ChatInterface({
    messages,
    onSendMessage,
    isProcessing,
    targetPrice = 0,
    currentRound = 0,
    maxRounds = 6,
    dealConfirmedPrice,
    recommendation,
}: ChatInterfaceProps) {
    const [inputValue, setInputValue] = useState("");
    const [priceValue, setPriceValue] = useState<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isProcessing]);

    const handleSend = (overrideMessage?: string, overridePrice?: number) => {
        const msg = overrideMessage ?? inputValue;
        const price = (overridePrice ?? parseFloat(priceValue)) || 0;
        if (!msg && !price) return;
        onSendMessage?.(msg, price);
        setInputValue("");
        setPriceValue("");
    };

    // Quick counter logic — based on last carrier price
    const lastCarrierMsg = [...messages].reverse().find(m => m.role === "CARRIER" && (m.price ?? 0) > 0);
    const showQuickCounters = !!lastCarrierMsg?.price && !isProcessing && !dealConfirmedPrice;
    const quickCounters = lastCarrierMsg?.price
        ? [
            { label: "–5%",  price: Math.round(lastCarrierMsg.price * 0.95), icon: TrendingDown },
            { label: "–10%", price: Math.round(lastCarrierMsg.price * 0.90), icon: TrendingDown },
            { label: "–15%", price: Math.round(lastCarrierMsg.price * 0.85), icon: TrendingDown },
            ...(targetPrice > 0 ? [{ label: "GOAL", price: targetPrice, icon: CheckCircle2 }] : []),
        ]
        : [];

    return (
        <div className="flex flex-col h-full glass glow-border overflow-hidden rounded-[32px] bg-zinc-900/40 backdrop-blur-xl border-white/5">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-display font-black text-xs uppercase tracking-[0.2em] text-white italic">Agent Coordination</h3>
                        <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.25em] italic">Bicorn Protocol Active</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Round</p>
                        <p className="text-xs font-black text-primary">{currentRound}<span className="text-white/30">/{maxRounds}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">Live</span>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-5 scrollbar-hide">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && !isProcessing && (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-32 gap-3">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">Awaiting carrier opening...</p>
                        </motion.div>
                    )}

                    {messages.map((msg, i) => {
                        const prevPrice = messages.slice(0, i).reverse().find(m => m.role === msg.role && (m.price ?? 0) > 0)?.price;
                        const delta = prevPrice && msg.price && msg.price > 0
                            ? ((msg.price - prevPrice) / prevPrice * 100)
                            : null;
                        const isShipper = msg.role === "SHIPPER";

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8, x: isShipper ? -8 : 8 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex gap-3 ${isShipper ? "" : "flex-row-reverse"}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black italic border ${isShipper ? "bg-primary text-black border-primary shadow-[0_0_12px_rgba(255,184,0,0.2)]" : "bg-zinc-800 text-white border-white/10"}`}>
                                    {isShipper ? "S" : "C"}
                                </div>
                                <div className={`max-w-[82%] space-y-2 ${isShipper ? "" : "items-end flex flex-col"}`}>
                                    {msg.content && (
                                        <div className={`px-4 py-3 rounded-2xl text-[11px] leading-relaxed font-medium border ${isShipper ? "bg-zinc-900/80 border-white/8 rounded-tl-none text-white/85" : "bg-primary/8 border-primary/20 rounded-tr-none text-primary/90"}`}>
                                            {msg.content}
                                        </div>
                                    )}
                                    {(msg.price ?? 0) > 0 && (
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-black italic ${isShipper ? "bg-black/60 border-white/10 text-white" : "bg-primary/10 border-primary/30 text-primary"}`}>
                                            <span className="text-white/40">Offer:</span>
                                            <span>${msg.price?.toLocaleString()}</span>
                                            {delta !== null && (
                                                <span className={`text-[9px] flex items-center gap-0.5 ${delta < 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                    {delta < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                                    {Math.abs(delta).toFixed(1)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}

                    {isProcessing && (
                        <motion.div key="typing" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3 flex-row-reverse">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-black italic text-white shrink-0">C</div>
                            <div className="px-4 py-3 rounded-2xl rounded-tr-none bg-zinc-900/60 border border-white/8 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                            </div>
                        </motion.div>
                    )}

                    {/* Deal Confirmed Banner inside chat */}
                    {dealConfirmedPrice && (
                        <motion.div
                            key="deal-banner"
                            initial={{ opacity: 0, scale: 0.9, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                            className="mx-auto mt-4"
                        >
                            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-400/50 shadow-[0_0_40px_rgba(52,211,153,0.15)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-primary/5 to-emerald-500/10" />
                                <div className="relative p-6 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 italic">Deal Confirmed</span>
                                    </div>
                                    <div className="text-4xl font-display font-black text-white italic tracking-tighter mb-2">
                                        ${dealConfirmedPrice.toLocaleString()}
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 italic">Final Agreed Rate</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Counters */}
            <AnimatePresence>
                {showQuickCounters && quickCounters.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-2 border-t border-white/5 overflow-hidden"
                    >
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 pt-3 pb-2 italic">Quick Counter</p>
                        <div className="flex gap-2 flex-wrap">
                            {quickCounters.map(({ label, price, icon: Icon }) => (
                                <button
                                    key={label}
                                    type="button"
                                    onClick={() => handleSend(`Counter offer: $${price.toLocaleString()}`, price)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/8 transition-all text-[9px] font-black uppercase text-white tracking-wide"
                                >
                                    <Icon className="w-3 h-3 text-primary" />
                                    {label} · ${price.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input — or Deal Summary when confirmed */}
            {dealConfirmedPrice ? (
                <div className="p-5 bg-zinc-950/80 border-t border-emerald-400/20 backdrop-blur-md shrink-0">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 italic">
                                {recommendation === "auto_book" 
                                    ? "Automated Booking Confirmed ✓" 
                                    : recommendation === "recommend" 
                                        ? "Optimal Rate Achieved — Highly Recommended" 
                                        : "Negotiation Concluded"}
                            </p>
                        </div>
                        <p className="text-[8px] text-white/40 uppercase font-black tracking-widest italic">
                            Final Contracted Rate: ${dealConfirmedPrice.toLocaleString()}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-zinc-950/80 border-t border-white/5 backdrop-blur-md shrink-0">
                    <div className="flex gap-2">
                        <div className="relative shrink-0">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/30 pointer-events-none">$</span>
                            <input
                                value={priceValue}
                                onChange={(e) => setPriceValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="PRICE"
                                type="number"
                                className="w-24 pl-6 pr-3 py-3 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest italic focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/15"
                            />
                        </div>
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Message agent..."
                            className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-black italic focus:outline-none focus:border-primary/50 transition-all text-white placeholder:text-white/15"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isProcessing || (!inputValue && !priceValue)}
                            className="w-11 h-11 bg-primary text-black rounded-xl flex items-center justify-center hover:shadow-[0_0_20px_rgba(255,184,0,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shrink-0"
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-[8px] text-white/15 font-black uppercase tracking-widest mt-2 italic text-center">Enter price + message · Press Enter to transmit</p>
                </div>
            )}
        </div>
    );
}
