"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Zap } from "lucide-react";

export function SaiperUtilityMatrix({ currentPrice, budget, minPrice }: { currentPrice: number, budget: number, minPrice: number }) {
    const [utility, setUtility] = useState(0);

    useEffect(() => {
        const range = budget - minPrice;
        if (range <= 0) return;

        const rawUtil = ((budget - currentPrice) / range) * 100;
        setUtility(Math.min(100, Math.max(0, rawUtil)));
    }, [currentPrice, budget, minPrice]);

    return (
        <div className="glass glow-border p-8 rounded-[24px] relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-display text-[9px] font-black uppercase tracking-[0.4em] text-white/40 italic flex items-center gap-2">
                    Saiper Utility Matrix <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                </h3>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest italic">Trending Opt</span>
                    <span className="text-sm font-black text-white ml-1">$12,000</span>
                </div>
            </div>

            <div className="flex items-end justify-between mb-8">
                <div>
                    <div className="text-7xl font-display font-black tracking-tighter text-white italic">
                        {utility.toFixed(1)}<span className="text-white/20 text-4xl ml-1">x</span>
                    </div>
                    <div className="mt-4 flex flex-col gap-1">
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Matrix Detail</span>
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest italic">${(budget - currentPrice).toLocaleString()} Optimization</span>
                    </div>
                </div>
                <div className="w-16 h-16 rounded-xl border border-white/10 flex items-center justify-center bg-white/5">
                    <TrendingUp className="w-8 h-8 text-white/30" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(255,184,0,0.5)]"
                        style={{ width: `${utility}%` }}
                    />
                    <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-2 h-2 bg-white rounded-full border-2 border-black" />
                </div>

                <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.2em] italic">
                    <div className="flex flex-col gap-1">
                        <span className="text-white/20">Budget Ceiling</span>
                        <div className="flex gap-4">
                            <span className="text-white/60">${budget.toLocaleString()}</span>
                            <span className="text-white/30">${(budget + 500).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                        <span className="text-white/20">Target Floor</span>
                        <span className="text-primary">${minPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
