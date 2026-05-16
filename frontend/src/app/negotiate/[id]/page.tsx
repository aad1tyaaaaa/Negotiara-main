"use client";

import { useParams } from "next/navigation";
import { ChatInterface } from "@/components/negotiation/ChatInterface";
import { PriceGraph } from "@/components/negotiation/PriceGraph";
import { Package, ArrowLeft, Cpu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// ─── Carrier AI scripted responses (triggered one-by-one after each user message) ──

const CARRIER_RESPONSES = [
    { price: 12500, content: "Initial quote for logistics from Shanghai to Los Angeles. Given current port congestion and fuel surcharges, our base rate is $12,500." },
    { price: 11800, content: "We can consider $11,800 if you guarantee loading times under 2 hours to avoid demurrage penalties." },
    { price: 11500, content: "Deal. We can execute at $11,500 given the strict loading time guarantee. Contract terms accepted." },
];

const MOCK_SESSION = {
    id: "SIM-8829-Z",
    targetPrice: 10500,
    basePrice: 12500,
    maxRounds: 6,
    priority: "High Magnitude",
    shipment: {
        origin: "SHENZHEN HUB, CN",
        destination: "LOS ANGELES PORT, US",
        cargoType: "High-End Electronics",
        weight: 5000,
    },
};

const DEAL_PRICE = 11500;

export default function NegotiationSessionPage() {
    const { id } = useParams();
    const [displayMessages, setDisplayMessages] = useState<any[]>([]);
    const [graphData, setGraphData] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dealConfirmed, setDealConfirmed] = useState(false);
    const carrierIndexRef = useRef(0);

    // Auto-show first carrier message on mount (the opening offer)
    useEffect(() => {
        const t = setTimeout(() => {
            setDisplayMessages([{ role: "CARRIER", ...CARRIER_RESPONSES[0] }]);
            carrierIndexRef.current = 1;
        }, 800);
        return () => clearTimeout(t);
    }, []);

    // Graph data formatting
    useEffect(() => {
        const rounds: Record<number, any> = {};
        displayMessages.forEach((m, idx) => {
            const roundNum = Math.floor(idx / 2) + 1;
            if (!rounds[roundNum]) rounds[roundNum] = { round: roundNum };
            if (m.role === "SHIPPER") rounds[roundNum].shipper_offer = m.price;
            if (m.role === "CARRIER") rounds[roundNum].carrier_offer = m.price;
        });
        setGraphData(Object.values(rounds));
    }, [displayMessages]);

    // Handle user sending a message — show their message, then "AI" responds
    const handleSendMessage = (message: string, price: number) => {
        if (isProcessing || dealConfirmed) return;

        // Add user's actual typed message as SHIPPER
        const shipperMsg = { role: "SHIPPER", content: message, price: price || 0 };
        setDisplayMessages(prev => [...prev, shipperMsg]);

        // Check if there are more carrier responses
        const nextIdx = carrierIndexRef.current;
        if (nextIdx < CARRIER_RESPONSES.length) {
            setIsProcessing(true);
            // Simulate AI "thinking" delay
            setTimeout(() => {
                const carrierMsg = { role: "CARRIER", ...CARRIER_RESPONSES[nextIdx] };
                setDisplayMessages(prev => [...prev, carrierMsg]);
                carrierIndexRef.current = nextIdx + 1;
                setIsProcessing(false);

                // If this was the last carrier response, mark deal as confirmed
                if (nextIdx === CARRIER_RESPONSES.length - 1) {
                    setDealConfirmed(true);
                }
            }, 1500 + Math.random() * 1000); // 1.5-2.5s delay for realism
        }
    };

    const session = MOCK_SESSION;
    const currentPrice = displayMessages.length > 0
        ? displayMessages.filter(m => (m.price ?? 0) > 0).at(-1)?.price ?? 0
        : session.basePrice;
    const lastCarrierPrice = [...displayMessages].reverse().find(m => m.role === "CARRIER" && (m.price ?? 0) > 0)?.price ?? 0;
    const gap = lastCarrierPrice && session.targetPrice ? lastCarrierPrice - session.targetPrice : null;
    const currentRound = Math.ceil(displayMessages.length / 2);
    const maxRounds = session.maxRounds;

    return (
        <div className="min-h-screen bg-black text-foreground pb-20 selection:bg-primary/30">
            <div className="py-10 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto">
                <div className="flex flex-col gap-8 mb-16">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard/shipper">
                            <div className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all group">
                                <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                            </div>
                        </Link>
                        <div className="flex items-center gap-6">
                            <div className="px-4 py-2 rounded-lg bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Session: <span className="text-white">{id?.toString().toUpperCase() || session.id}</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 rounded-md bg-primary/20 border border-primary/30">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Simulated</span>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${dealConfirmed ? "bg-emerald-400" : "bg-primary animate-pulse"}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">
                                    {dealConfirmed ? "Deal Closed" : "Active Transmission"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter text-white italic uppercase leading-[0.85]">
                                Autonomous <br /> Negotiation
                            </h1>
                            <p className="text-white/30 text-xs font-black tracking-[0.4em] uppercase">
                                AI AGENTS // PROTOCOL ID-8829-Z // {session.shipment.origin} &gt; {session.shipment.destination}
                            </p>
                        </div>

                        {/* Current Price / Deal Confirmed Display */}
                        <div className="flex flex-col items-end gap-6">
                            {dealConfirmed ? (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="relative overflow-hidden rounded-[32px] min-w-[320px]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-emerald-500/20 animate-pulse" />
                                    <div className="relative glass p-10 rounded-[32px] border-2 border-primary/50 shadow-[0_0_60px_rgba(255,184,0,0.25)]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 italic">Contract Confirmed</span>
                                        </div>
                                        <div className="text-7xl font-display font-black text-white italic tracking-tighter">
                                            ${DEAL_PRICE.toLocaleString()}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-3 italic">
                                            Final Agreed Rate • {session.shipment.origin} → {session.shipment.destination}
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="glass glow-border p-8 rounded-[32px] min-w-[280px] bg-gradient-to-br from-zinc-900/50 to-black">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Current Market Value</span>
                                    <div className="text-6xl font-display font-black text-white italic mt-3 tracking-tighter">
                                        ${currentPrice?.toLocaleString() || "0.0"}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Negotiation Status Bar */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap items-center gap-4 mb-8 px-6 py-4 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">Target</span>
                        <span className="text-sm font-black text-primary italic">${session.targetPrice.toLocaleString()}</span>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <div className="flex items-center gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">Carrier</span>
                        <span className="text-sm font-black text-white italic">{lastCarrierPrice > 0 ? `$${lastCarrierPrice.toLocaleString()}` : "Awaiting..."}</span>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <div className="flex items-center gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">Gap</span>
                        <span className={`text-sm font-black italic ${gap !== null ? (gap > 0 ? "text-red-400" : "text-emerald-400") : "text-white/30"}`}>
                            {gap !== null ? `$${Math.abs(gap).toLocaleString()}` : "—"}
                        </span>
                    </div>
                    <div className="w-px h-5 bg-white/10" />
                    <div className="flex items-center gap-3">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30">Round</span>
                        <span className="text-sm font-black text-white italic">{currentRound}<span className="text-white/30">/{maxRounds}</span></span>
                    </div>
                    <div className="ml-auto">
                        <div className="flex items-center gap-2">
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden" style={{ width: 80 }}>
                                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((currentRound / maxRounds) * 100, 100)}%` }} />
                            </div>
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">{Math.round((currentRound / maxRounds) * 100)}%</span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Main Graph Card */}
                        <div className="glass glow-border p-8 rounded-[32px] flex-1 bg-zinc-900/20">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">Price Convergence Stream</h3>
                                <div className="flex gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-[2px] bg-white/20" />
                                        <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">Shipper</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-[2px] bg-primary" />
                                        <span className="text-[9px] font-black uppercase text-primary tracking-widest">Carrier</span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-[400px]">
                                <PriceGraph data={graphData} targetPrice={session.targetPrice} />
                            </div>
                        </div>

                        {/* Bottom Manifest/Vector Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass glow-border p-10 rounded-[32px] hover:border-primary/30 transition-colors bg-zinc-900/20">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-10 flex items-center gap-3 italic">
                                    <Package className="w-4 h-4 text-primary" /> Cargo Manifest
                                </h3>
                                <div className="space-y-8">
                                    <Detail label="Classification" value={session.shipment.cargoType} />
                                    <Detail label="Net Weight" value={`${session.shipment.weight.toLocaleString()}kg`} />
                                    <Detail label="Priority Tier" value={session.priority} />
                                </div>
                            </div>
                            <div className="glass glow-border p-10 rounded-[32px] hover:border-primary/30 transition-colors bg-zinc-900/20 flex flex-col">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-10 flex items-center gap-3 italic">
                                    <Cpu className="w-4 h-4 text-primary" /> Autonomous Logic
                                </h3>
                                <div className="space-y-6 flex-1">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] text-white/40 italic">
                                            <span>Strategy Weight</span>
                                            <span className="text-primary">84% Optimal</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div
                                                className="h-full bg-primary"
                                                initial={{ width: 0 }}
                                                animate={{ width: "84%" }}
                                                transition={{ duration: 2 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-primary leading-relaxed italic">
                                            Bicorn Protocol: Analyzing carrier operational costs vs. market volatility.
                                            Aggressive convergence active.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 h-full">
                        <ChatInterface
                            messages={displayMessages}
                            onSendMessage={handleSendMessage}
                            isProcessing={isProcessing}
                            targetPrice={session.targetPrice}
                            currentRound={currentRound}
                            maxRounds={maxRounds}
                            dealConfirmedPrice={dealConfirmed ? DEAL_PRICE : undefined}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between font-medium border-b border-white/5 pb-2">
            <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black italic">{label}</span>
            <span className="text-sm text-white font-black italic uppercase tracking-tighter">{value}</span>
        </div>
    )
}
