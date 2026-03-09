"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Cpu, Activity } from "lucide-react";

const LOG_MESSAGES = [
    "[SYSTEM]: Initializing Bicorn Strategy v4.2...",
    "[AGENT 01]: Fetching market signals for Lane: CHI-LAX...",
    "[AGENT 01]: Spot Market detected at $1,840. Intrinsic value: $1,420.",
    "[SYSTEM]: Calibrating tactical empathy parameters...",
    "[AGENT 01]: Dispatching initial anchor: $1,215 (Ackerman Phase 1).",
    "[CARRIER]: Received counter-offer. 'Capacity is tight this week, best we can do is $1,750'.",
    "[AGENT 01]: Labeling constraint: 'It seems like reliability is your primary concern.'",
    "[AGENT 01]: Asking calibrated question: 'How am I supposed to justify $1,750 given the current volume promise?'",
    "[AGENT 01]: Refining anchor: $1,385 (Ackerman Phase 2).",
    "[CARRIER]: 'We can probably meet at $1,550 if you guarantee the Tuesday pickup.'",
    "[AGENT 01]: Securing non-monetary concession: Guaranteed Pickup confirmed.",
    "[AGENT 01]: Final Offer: $1,445 (Intrinsic Match).",
    "[SYSTEM]: Negotiation COMPLETED. Savings: 16.2% vs Spot Market.",
];

export function AIConsole() {
    const [logs, setLogs] = useState<string[]>([]);
    const [index, setIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % LOG_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setLogs(LOG_MESSAGES.slice(0, index + 1));
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [index]);

    return (
        <div className="w-full h-[300px] glass glow-border rounded-xl overflow-hidden flex flex-col font-mono text-[10px] uppercase tracking-tighter">
            <div className="bg-white/5 p-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-primary animate-pulse" />
                    <span className="text-white/60 font-black">AI Core Feed: Bicorn_Protocol</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500/80">Active</span>
                    </div>
                </div>
            </div>
            <div ref={scrollRef} className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide bg-black/40">
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                        <span className="text-white/20">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className={
                            log.includes('[SYSTEM]') ? 'text-primary' :
                                log.includes('[CARRIER]') ? 'text-accent' :
                                    'text-white/70'
                        }>
                            {log}
                        </span>
                    </div>
                ))}
            </div>
            <div className="p-2 bg-white/5 border-t border-white/10 flex items-center justify-between px-4">
                <div className="flex gap-4">
                    <span className="text-[8px] text-white/30 italic">Status: Processing_Game_Theory</span>
                </div>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-[loading_2s_infinite]" style={{ width: '40%' }} />
                </div>
            </div>
        </div>
    );
}
