"use client";

import { motion } from "framer-motion";

export function TelemetryLive({ savings, budgetCeiling, targetFloor }: { savings: number, budgetCeiling: number, targetFloor: number }) {
    return (
        <div className="glass glow-border p-6 rounded-[24px] relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 italic">Telemetry Live</h3>
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1 h-1 bg-primary rounded-full"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between gap-8 mb-6">
                <div className="text-4xl font-display font-black text-green-500 italic">
                    +${savings.toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest italic">Budget Ceiling</span>
                    <span className="text-[10px] font-black text-white uppercase italic">${budgetCeiling.toLocaleString()}</span>
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest italic">Target Floor</span>
                    <span className="text-[10px] font-black text-white uppercase italic">${targetFloor.toLocaleString()}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[8px] font-black text-white/30 uppercase tracking-widest italic">Budget Optimization Savings</span>
                <span className="text-[10px] font-black text-green-500 uppercase italic">-${(budgetCeiling - 11500).toLocaleString()}</span>
            </div>
        </div>
    );
}
