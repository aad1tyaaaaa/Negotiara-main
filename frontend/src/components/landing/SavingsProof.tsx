"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
    { name: "Spot Market", price: 1840, fill: "rgba(255,255,255,0.1)" },
    { name: "Negotiara AI", price: 1445, fill: "#FFB800" },
];

export function SavingsProof() {
    return (
        <div className="w-full h-full glass glow-border rounded-xl p-6 flex flex-col">
            <div className="mb-6">
                <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1 italic">Performance Benchmarking</h3>
                <div className="text-2xl font-black text-primary italic tracking-tight">-16.2% <span className="text-xs text-white/30 not-italic ml-2 uppercase tracking-widest">SAVINGS SECURED</span></div>
            </div>
            <div className="flex-1 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="name"
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            fontFamily="Inter"
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `$${v}`}
                            fontFamily="Inter"
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,184,0,0.3)', borderRadius: '8px', fontSize: '10px' }}
                            itemStyle={{ color: '#fff', fontWeight: 900 }}
                            cursor={{ fill: 'rgba(255,184,0,0.05)' }}
                        />
                        <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
