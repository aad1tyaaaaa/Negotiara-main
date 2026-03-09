"use client";

import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { ChatInterface } from "@/components/negotiation/ChatInterface";
import { PriceGraph } from "@/components/negotiation/PriceGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Shield, Clock, MapPin, Package, AlertCircle, ArrowLeft, CheckCircle, Cpu } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SaiperUtilityMatrix } from "@/components/negotiation/SaiperUtilityMatrix";
import { negotiationApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

export default function NegotiationSessionPage() {
    const { id } = useParams();
    const { user } = useAuthStore();
    const { messages, connected } = useSocket(id as string);
    const [graphData, setGraphData] = useState<any[]>([]);
    const [session, setSession] = useState<any>(null);
    const [displayMessages, setDisplayMessages] = useState<any[]>([]);

    useEffect(() => {
        negotiationApi.getSession(id as string).then(setSession).catch(console.error);
    }, [id]);

    useEffect(() => {
        if (messages.length > 0) {
            setDisplayMessages(messages);
        } else if (session?.offers) {
            const mappedOffers = session.offers.map((o: any) => ({
                role: o.senderId === session.shipperId ? "SHIPPER" : "CARRIER",
                content: o.message,
                price: o.price
            }));
            setDisplayMessages(mappedOffers);
        }
    }, [messages, session]);

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

    const [isProcessing, setIsProcessing] = useState(false);

    const handleSendMessage = async (message: string, price: number) => {
        if (!id || isProcessing) return;

        setIsProcessing(true);
        setIsProcessing(true);
        try {
            await negotiationApi.chat({
                negotiationId: id as string,
                message: message,
                price: price,
                role: (user?.role === "CARRIER" ? "CARRIER" : "SHIPPER") as "SHIPPER" | "CARRIER"
            });

            // The response will eventually come back via Socket.io too, 
            // but we can optimistically update or just let the socket handle it.
            // For better UX, we'll let the socket update displayMessages.
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const currentPrice = displayMessages.length > 0 ? displayMessages[displayMessages.length - 1].price : (session?.basePrice || 0);

    return (
        <div className="min-h-screen bg-black text-foreground pb-20 selection:bg-primary/30">
            {/* Header Area */}
            <div className="py-10 px-6 md:px-12 lg:px-24 max-w-[1600px] mx-auto">
                <div className="flex flex-col gap-8 mb-16">
                    {/* Top Top Bar */}
                    <div className="flex items-center justify-between">
                        <Link href="/dashboard/shipper">
                            <div className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all group">
                                <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                            </div>
                        </Link>

                        <div className="flex items-center gap-6">
                            <div className="px-4 py-2 rounded-lg bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Session: <span className="text-white">{id?.toString().toUpperCase()}</span></span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${connected ? "bg-primary animate-pulse" : "bg-red-500"}`} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Active Transmission</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tighter text-white italic uppercase leading-[0.85]">
                                Autonomous <br /> Negotiation
                            </h1>
                            <p className="text-white/30 text-xs font-black tracking-[0.4em] uppercase">
                                AI AGENTS // PROTOCOL ID-8829-Z // {session?.shipment?.origin || "Loading..."} &gt; {session?.shipment?.destination || "Loading..."}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-6">
                            {session?.status === "COMPLETED" ? (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-end gap-4"
                                >
                                    <div className="px-6 py-2 bg-primary/20 border border-primary/30 rounded-xl">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">Negotiation Converged</span>
                                    </div>
                                    <Button variant="premium" size="lg" className="h-20 px-12 gap-4 text-xl">
                                        <CheckCircle className="w-6 h-6" />
                                        Award Contract & Digital Booking
                                    </Button>
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
                                <PriceGraph data={graphData} targetPrice={session?.targetPrice || 10500} />
                            </div>
                        </div>

                        {/* Bottom Manifest/Vector Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass glow-border p-10 rounded-[32px] hover:border-primary/30 transition-colors bg-zinc-900/20">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-10 flex items-center gap-3 italic">
                                    <Package className="w-4 h-4 text-primary" /> Cargo Manifest
                                </h3>
                                <div className="space-y-8">
                                    <Detail label="Classification" value={session?.shipment?.cargoType || "Standard Freight"} />
                                    <Detail label="Net Weight" value={`${session?.shipment?.weight?.toLocaleString() || "0"}kg`} />
                                    <Detail label="Priority Tier" value={session?.priority || "High Magnitude"} />
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
                            negotiationId={id as string}
                            onSendMessage={handleSendMessage}
                            isProcessing={isProcessing}
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
