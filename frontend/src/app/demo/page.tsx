"use client";

import { ChatInterface } from "@/components/negotiation/ChatInterface";
import { PriceGraph } from "@/components/negotiation/PriceGraph";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Shield, Clock, MapPin, Package, AlertCircle, ArrowLeft, CheckCircle, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SaiperUtilityMatrix } from "@/components/negotiation/SaiperUtilityMatrix";
import { TelemetryLive } from "@/components/negotiation/TelemetryLive";
import { Button } from "@/components/ui/Button";

const MOCK_MESSAGES = [
    { role: "CARRIER", price: 12500, content: "Initial quote for logistics from Shanghai to Los Angeles. Given current port congestion, we cannot go lower." },
    { role: "SHIPPER", price: 10500, content: "We respect the port congestion constraints, but our historical data shows realistic clearing for much less. We need to stay closer to" },
    { role: "CARRIER", price: 11800, content: "We can drop to $11,800 if you guarantee loading times under 2 hours to avoid demurrage." },
    { role: "SHIPPER", price: 11200, content: "Agreed on the 2-hour loading constraint. At that efficiency, we believe $11,200 is a fair reflection of the shared risk." },
    { role: "CARRIER", price: 11500, content: "Deal. We can execute at $11,500 given the strict loading time guarantee." },
    { role: "SHIPPER", price: 11500, content: "Excellent. $11,500 confirmed." }
];

export default function DemoPage() {
    const [displayMessages, setDisplayMessages] = useState<any[]>([]);
    const [graphData, setGraphData] = useState<any[]>([]);

    useEffect(() => {
        let timeouts: NodeJS.Timeout[] = [];
        MOCK_MESSAGES.forEach((msg, idx) => {
            const t = setTimeout(() => {
                setDisplayMessages(prev => [...prev, msg]);
            }, idx * 1500 + 500);
            timeouts.push(t);
        });
        return () => timeouts.forEach(clearTimeout);
    }, []);

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

    const isComplete = displayMessages.length === MOCK_MESSAGES.length;
    const currentPrice = displayMessages.length > 0 ? displayMessages[displayMessages.length - 1].price : 12500;

    return (
        <div className="min-h-screen bg-black text-foreground pb-20">
            {/* Header Area */}
            <div className="py-8 px-6 md:px-12 lg:px-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="flex items-start gap-6">
                        <Link href="/" className="mt-1">
                            <div className="w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all">
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </div>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="px-3 py-1 rounded-md bg-white/5 border border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Session-Demo-683s</span>
                                </div>
                                <div className="px-3 py-1 rounded-md bg-primary/20 border border-primary/30">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Simulated</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-display font-black tracking-tight text-white italic">Autonomous Demo Sandbox</h1>
                            <p className="text-white/40 text-sm font-medium mt-2 tracking-wide">Watch our agents deploy strategic constraints dynamically.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {isComplete && (
                            <Button className="bg-green-600/20 border border-green-600/30 text-green-500 hover:bg-green-600/30 font-black text-xs h-12 px-8 rounded-lg flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Confirm Booking @ $11,500
                            </Button>
                        )}
                        <div className="glass glow-border p-4 px-8 rounded-xl hidden sm:block">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30 italic">Current Best Offer</span>
                            <div className="text-2xl font-display font-black text-white italic mt-1">
                                ${currentPrice.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left & Middle Column */}
                    <div className="lg:col-span-8 space-y-8">
                        <PriceGraph data={graphData} targetPrice={10500} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Shipment Details */}
                            <div className="glass glow-border p-8 rounded-[24px]">
                                <div className="flex items-center gap-3 mb-8">
                                    <Package className="w-4 h-4 text-white/40" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80">Shipment Details</h3>
                                </div>
                                <div className="space-y-6">
                                    <Detail label="Goods" value="High-End Laptops" />
                                    <Detail label="Weight" value="5,000kg" />
                                    <Detail label="Priority" value="High" />
                                </div>
                            </div>

                            {/* Route Info */}
                            <div className="glass glow-border p-8 rounded-[24px]">
                                <div className="flex items-center gap-3 mb-8">
                                    <MapPin className="w-4 h-4 text-white/40" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/80">Route Info</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Shenzhen, CN</span>
                                        <div className="text-[10px] font-black text-white uppercase tracking-widest italic">Los Angeles, CA</div>
                                    </div>
                                    <div className="space-y-6">
                                        <Detail label="Destination" value="10,000km" />
                                        <Detail label="Est. Distance" value="10,000km" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Utility Matrix & Telemetry */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <SaiperUtilityMatrix
                                currentPrice={currentPrice}
                                budget={12500}
                                minPrice={10900}
                            />
                            <TelemetryLive
                                savings={1500}
                                budgetCeiling={12000}
                                targetFloor={10500}
                            />
                        </div>
                    </div>

                    {/* Right Column: Chat */}
                    <div className="lg:col-span-4 lg:h-[950px]">
                        <ChatInterface messages={displayMessages} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between font-medium">
            <span className="text-[10px] text-white/40 uppercase tracking-widest">{label}</span>
            <span className="text-sm text-white italic">{value}</span>
        </div>
    )
}
