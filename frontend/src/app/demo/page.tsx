"use client";

import { ChatInterface } from "@/components/negotiation/ChatInterface";
import { PriceGraph } from "@/components/negotiation/PriceGraph";
import { Badge } from "@/components/ui/Badge";
import { Shield, Clock, MapPin, Package, ArrowLeft, CheckCircle, Info, ChevronRight, Play, TrendingUp, Plus, DollarSign, Zap, BarChart2, Target, Ship, ArrowRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SaiperUtilityMatrix } from "@/components/negotiation/SaiperUtilityMatrix";
import { TelemetryLive } from "@/components/negotiation/TelemetryLive";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_MESSAGES = [
    { role: "CARRIER", price: 12500, content: "Initial quote for logistics from Shanghai to Los Angeles. Given current port congestion, we cannot go lower." },
    { role: "SHIPPER", price: 10500, content: "We respect the port congestion constraints, but our historical data shows realistic clearing for much less. We need to stay closer to" },
    { role: "CARRIER", price: 11800, content: "We can drop to $11,800 if you guarantee loading times under 2 hours to avoid demurrage." },
    { role: "SHIPPER", price: 11200, content: "Agreed on the 2-hour loading constraint. At that efficiency, we believe $11,200 is a fair reflection of the shared risk." },
    { role: "CARRIER", price: 11500, content: "Deal. We can execute at $11,500 given the strict loading time guarantee." },
    { role: "SHIPPER", price: 11500, content: "Excellent. $11,500 confirmed." }
];

const TOUR_STEPS = [
    {
        id: "welcome",
        title: "Welcome to Autonomous Negotiation",
        content: "This sandbox walks you through the full Negotiara workflow — from your Shipper Dashboard to Mission Parameters to a live AI negotiation. Let's start the tour.",
        highlight: "none"
    },
    {
        id: "shipper-dashboard",
        title: "The Shipper Dashboard",
        content: "A high-level command center for your global logistics. Track active negotiations, AI-driven savings, and fleet-wide win rates in real-time. The 'AI AGENT STATUS' panel monitors your autonomous nodes (Negotiator Pro, LSP Analyst, Strategy Engine) as they optimize routes.",
        highlight: "shipper-dashboard"
    },
    {
        id: "mission-params",
        title: "Mission Parameters",
        content: "Before every negotiation, you define a 'Mission'. In this Setup Wizard, you specify the Origin Vector (e.g., Shenzhen Hub) and the Target Node. Our AI calculates a 'Mass Index' to determine the leverage it has over the carrier during the session.",
        highlight: "mission-params"
    },
    {
        id: "context",
        title: "Step 3 — Negotiation Session Context",
        content: "Once launched, you enter the live session. The context cards show the active shipment details your AI Shipper agent is working with — cargo type, weight, priority and route.",
        highlight: "context-cards"
    },
    {
        id: "chat",
        title: "Step 4 — Real-Time AI Negotiation",
        content: "This is where the magic happens. Carrier and Shipper AIs negotiate in real-time. They don't just haggle on price — they dynamically trade operational constraints (like loading times) to find mutual value.",
        highlight: "chat-interface"
    },
    {
        id: "analytics",
        title: "Step 5 — Live Telemetry & Utility",
        content: "As the agents chat, the convergence graph updates live and the utility matrix ensures the deal stays within your budget and ROI thresholds.",
        highlight: "analytics-section"
    },
    {
        id: "ready",
        title: "Ready to Watch?",
        content: "You've seen the full workflow. Now let's watch the autonomous agents secure the best possible contract in real-time.",
        highlight: "none"
    }
];

export default function DemoPage() {
    const [displayMessages, setDisplayMessages] = useState<any[]>([]);
    const [graphData, setGraphData] = useState<any[]>([]);

    // Tour State Management
    const [isTourActive, setIsTourActive] = useState(true);
    const [tourStepIndex, setTourStepIndex] = useState(0);

    // Simulation Effect - Only runs when the tour is finished
    useEffect(() => {
        if (isTourActive) return;

        let timeouts: NodeJS.Timeout[] = [];
        MOCK_MESSAGES.forEach((msg, idx) => {
            const t = setTimeout(() => {
                setDisplayMessages(prev => [...prev, msg]);
            }, idx * 1500 + 500);
            timeouts.push(t);
        });
        return () => timeouts.forEach(clearTimeout);
    }, [isTourActive]);

    // Graph Data formatting
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
    const currentTourStep = TOUR_STEPS[tourStepIndex];
    const showMockupView = isTourActive && (currentTourStep.id === "shipper-dashboard" || currentTourStep.id === "mission-params");

    // Remove background blur for mockup views
    const containerClasses = showMockupView ? "min-h-screen bg-black text-white selection:bg-primary/30" : "min-h-screen bg-black text-white selection:bg-primary/30 relative overflow-hidden";

    const nextTourStep = () => {
        if (tourStepIndex < TOUR_STEPS.length - 1) {
            setTourStepIndex(prev => prev + 1);
        } else {
            setIsTourActive(false);
        }
    };

    const skipTour = () => {
        setIsTourActive(false);
    };

    // Helper function to dynamically highlight components based on the active tour step
    const getHighlightClass = (sectionId: string) => {
        if (!isTourActive) return "";
        return currentTourStep.highlight === sectionId
            ? "ring-4 ring-primary shadow-[0_0_30px_rgba(var(--primary),0.3)] z-10 relative scale-[1.02] transition-all duration-500"
            : "opacity-40 grayscale-[50%] pointer-events-none transition-all duration-500";
    };

    return (
        <div className="min-h-screen bg-black text-foreground pb-20 relative">

            {/* Tour Overlay Backdrop — only blur the background when NOT showing a mockup step */}
            {isTourActive && (
                <div className={`fixed inset-0 bg-black/60 z-40 transition-all duration-500 ${showMockupView ? 'backdrop-blur-none' : 'backdrop-blur-sm'}`} />
            )}

            {/* Floating Tour Guide Card */}
            {isTourActive && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-lg">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-300" style={{ width: `${((tourStepIndex + 1) / TOUR_STEPS.length) * 100}%` }} />
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Info className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">{currentTourStep.title}</h3>
                                <p className="text-white/70 text-sm leading-relaxed">{currentTourStep.content}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/10">
                            <button onClick={skipTour} className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                                Skip Tour
                            </button>
                            <Button onClick={nextTourStep} className="bg-primary text-black hover:bg-primary/90 font-bold px-6 py-2 rounded-full flex items-center gap-2">
                                {tourStepIndex === TOUR_STEPS.length - 1 ? (
                                    <>Start Simulation <Play className="w-4 h-4 fill-black" /></>
                                ) : (
                                    <>Next <ChevronRight className="w-4 h-4" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Mockup Screens (Shipper Dashboard + Mission Parameters) ── */}
            <AnimatePresence mode="wait">
                {showMockupView && (
                    <motion.div
                        key={currentTourStep.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        transition={{ duration: 0.35 }}
                        className="relative z-10 px-6 md:px-12 lg:px-24 py-12 max-w-[1400px] mx-auto"
                    >
                        {currentTourStep.id === "shipper-dashboard" && <ShipperDashboardMockup />}
                        {currentTourStep.id === "mission-params" && <MissionParamsMockup />}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Area — hidden during mockup tour steps */}
            <div className={`py-8 px-6 md:px-12 lg:px-24 transition-all duration-500 ${showMockupView ? 'opacity-0 pointer-events-none absolute' : isTourActive ? 'opacity-40' : 'opacity-100'}`}>
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
                            <Button className="bg-green-600/20 border border-green-600/30 text-green-500 hover:bg-green-600/30 font-black text-xs h-12 px-8 rounded-lg flex items-center gap-2 animate-in fade-in zoom-in duration-500">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-0">

                    {/* Left & Middle Column */}
                    <div className="lg:col-span-8 space-y-8">

                        <div className={`rounded-3xl ${getHighlightClass('analytics-section')}`}>
                            <PriceGraph data={graphData} targetPrice={10500} />
                        </div>

                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 rounded-3xl ${getHighlightClass('context-cards')}`}>
                            {/* Shipment Details */}
                            <div className="glass glow-border p-8 rounded-[24px] bg-background">
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
                            <div className="glass glow-border p-8 rounded-[24px] bg-background">
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
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 rounded-3xl ${getHighlightClass('analytics-section')}`}>
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
                    <div className={`lg:col-span-4 lg:h-[950px] rounded-3xl ${getHighlightClass('chat-interface')}`}>
                        <div className="h-full bg-background rounded-[24px]">
                            <ChatInterface messages={displayMessages} />
                        </div>
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

// ─── Shipper Dashboard Mockup ────────────────────────────────────────────────────

function ShipperDashboardMockup() {
    const stats = [
        { icon: <TrendingUp className="w-5 h-5 text-primary" />, label: "AVG. SAVINGS", value: "0%", badge: "0% VS MARKET" },
        { icon: <Clock className="w-5 h-5 text-primary" />, label: "ACTIVE RFQS", value: "4", badge: "4 PENDING" },
        { icon: <Shield className="w-5 h-5 text-primary" />, label: "WIN RATE", value: "0%", badge: "NO DATA YET" },
        { icon: <Package className="w-5 h-5 text-primary" />, label: "TOTAL GOODS", value: "20000+", badge: "20000T TOTAL CARGO" },
    ];
    const negotiations = [
        { title: "HIGH VALUE SEMICONDUCTOR - SHENZEN HUB TO LOS ANGELES", route: "EU LOGISTICS ROUTE", price: "$234", status: "IN_PROGRESS" },
        { title: "HIGH VALUE SEMICONDUCTOR - SHENZEN HUB CN TO LOS ANGELES", route: "EU LOGISTICS ROUTE", price: "$234", status: "IN_PROGRESS" },
        { title: "HIGH VALUE SEMICONDUCTOR - SHENZEN HUB TO LOS ANGELES", route: "EU LOGISTICS ROUTE", price: "$1,000", status: "IN_PROGRESS", active: true },
        { title: "ARTEFACTS - SHENZEN CN TO LOS ANGELES", route: "EU LOGISTICS ROUTE", price: "$10,000", status: "IN_PROGRESS" },
    ];
    const agents = [
        { name: "NEGOTIATOR PRO", sub: "4 ACTIVE NODES", status: "ACTIVE" },
        { name: "LSP ANALYST", sub: "0 ACTIVE NODES", status: "IDLE" },
        { name: "STRATEGY ENGINE", sub: "1 ACTIVE NODES", status: "OPTIMIZING" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in zoom-in duration-500 max-w-[1400px] mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic text-white flex items-center gap-4">
                        SHIPPER DASHBOARD
                    </h1>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black mt-2">WELCOME BACK, DUMMY SHIPPER // GLOBAL LOGISTICS NODE</p>
                </div>
                <button className="h-16 px-10 bg-[#FFB800] text-black rounded-lg flex items-center gap-3 font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,184,0,0.3)]">
                    <Plus className="w-6 h-6 stroke-[3]" />
                    CREATE SHIPMENT
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <div key={i} className="bg-[#0A0A0A] border border-white/5 p-8 rounded-sm relative group overflow-hidden">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 group-hover:border-primary/50 transition-colors">
                                {s.icon}
                            </div>
                            <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{s.badge}</span>
                        </div>
                        <div>
                            <p className="text-4xl font-display font-black text-white italic tracking-tighter mb-1">{s.value}</p>
                            <p className="text-[10px] font-black text-white/30 tracking-widest uppercase">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Negotiations */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-end mb-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white italic">ACTIVE NEGOTIATIONS</h3>
                        <span className="text-[10px] font-black text-white/30 hover:text-primary transition-colors cursor-pointer uppercase tracking-widest">VIEW ALL →</span>
                    </div>
                    <div className="space-y-3">
                        {negotiations.map((n, i) => (
                            <div key={i} className={`group bg-[#111] border ${n.active ? "border-primary/40 bg-primary/[0.02]" : "border-white/5"} p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer rounded-sm`}>
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 flex items-center justify-center bg-white/5 rounded-lg ${n.active ? "text-primary border border-primary/30" : "text-white/40"}`}>
                                        <Ship className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className={`text-xs font-black italic tracking-wide uppercase ${n.active ? "text-primary" : "text-white"}`}>{n.title}</h4>
                                        <p className="text-[9px] font-black text-white/20 mt-1 uppercase tracking-widest flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> {n.route}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-lg font-display font-black text-primary italic">{n.price}</p>
                                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{n.status}</p>
                                    </div>
                                    <ArrowRight className={`w-5 h-5 ${n.active ? "text-primary" : "text-white/20"} group-hover:translate-x-1 transition-transform`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#0F0F0F] border border-white/5 rounded-[24px] p-8 space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white italic">AI AGENT STATUS</h3>
                        <div className="space-y-4">
                            {agents.map((a, i) => (
                                <div key={i} className="bg-[#0A0A0A] border border-white/5 p-5 flex items-center justify-between rounded-xl group hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${a.status === 'ACTIVE' ? 'bg-primary shadow-[0_0_10px_#FFA500]' : a.status === 'OPTIMIZING' ? 'bg-orange-500' : 'bg-white/20'}`} />
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase tracking-widest">{a.name}</p>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-0.5">{a.sub}</p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-widest group-hover:text-primary group-hover:border-primary/30 transition-all">{a.status}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full h-14 bg-white/3 hover:bg-white/5 border border-white/10 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-lg">
                            MANAGE AI AGENTS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Mission Parameters Mockup ────────────────────────────────────────────────────

function MissionParamsMockup() {
    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-12 space-y-12 animate-in fade-in zoom-in duration-500">
            {/* Nav Header */}
            <div className="flex items-center gap-4 text-white/40">
                <div className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">RETURN TO COMMAND</span>
            </div>

            {/* Title Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">SETUP WIZARD</span>
                  </div>
                  <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic text-white">MISSION PARAMETERS</h1>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black text-primary tracking-widest uppercase">0% COMPLETE</span>
                    <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/20 w-[1%]" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-white/5 pb-4">
                {[
                    { label: "SHIPMENT", active: true, Icon: MapPin },
                    { label: "PRICING", active: false, Icon: DollarSign },
                    { label: "CONFIG", active: false, Icon: Zap },
                    { label: "REVIEW", active: false, Icon: CheckCircle },
                ].map((t, i) => (
                    <div key={i} className={`flex items-center gap-3 pb-4 relative cursor-pointer ${t.active ? "text-primary" : "text-white/20 hover:text-white/40 transition-colors"}`}>
                        <t.Icon className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] italic">{t.label}</span>
                        {t.active && <div className="absolute bottom-[-1px] left-0 w-full h-1 bg-primary" />}
                    </div>
                ))}
            </div>

            {/* Form Area */}
            <div className="space-y-12">
                <div className="flex flex-col items-center gap-4 text-primary italic">
                    <MapPin className="w-6 h-6" />
                    <h3 className="text-xs font-black uppercase tracking-[0.4em]">SHIPMENT DETAILS</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">ORIGIN VECTOR</label>
                            <Info className="w-3 h-3 text-white/20" />
                        </div>
                        <div className="h-16 px-6 bg-[#0A0A0A] border border-primary/40 rounded-xl flex items-center text-sm font-black text-white/30 italic">
                            e.g., SHENZHEN HUB, CN
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">TARGET NODE</label>
                            <Info className="w-3 h-3 text-white/20" />
                        </div>
                        <div className="h-16 px-6 bg-[#0A0A0A] border border-white/5 rounded-xl flex items-center text-sm font-black text-white/30 italic">
                            e.g., LOS ANGELES PORT, US
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">MASS INDEX (KG)</label>
                            <Info className="w-3 h-3 text-white/20" />
                        </div>
                        <div className="h-16 px-6 bg-[#0A0A0A] border border-white/5 rounded-xl flex items-center text-sm font-black text-white/30 italic">
                            5000
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 italic">CARGO CLASSIFICATION</label>
                            <Info className="w-3 h-3 text-white/20" />
                        </div>
                        <div className="h-16 px-6 bg-[#0A0A0A] border border-white/5 rounded-xl flex items-center text-sm font-black text-white/30 italic">
                            e.g., Electronics, Perishables
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-4 pt-12">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Ctrl+Enter to advance</span>
                    <button className="h-16 px-12 bg-[#FFB800] text-black rounded-lg flex items-center gap-4 font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_40px_rgba(255,184,0,0.2)]">
                        CONTINUE <ArrowRight className="w-6 h-6 stroke-[3]" />
                    </button>
                </div>
            </div>
        </div>
    );
}