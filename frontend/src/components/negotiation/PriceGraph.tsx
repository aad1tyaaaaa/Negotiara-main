"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface PriceGraphProps {
    data: any[];
    targetPrice: number;
}

export function PriceGraph({ data, targetPrice }: PriceGraphProps) {
    return (
        <div className="w-full h-[400px] glass glow-border p-8 rounded-[24px]">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-2 mb-2 italic">
                        Price Convergence Stream
                    </h3>
                </div>
                <div className="flex gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-0.5 bg-primary" />
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-widest italic">Shipper</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-0.5 bg-white/30" />
                        <span className="text-[9px] font-black text-white/50 uppercase tracking-widest italic">Carrier</span>
                    </div>
                </div>
            </div>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="round"
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `T-${value}`}
                            dy={15}
                            fontFamily="Inter"
                        />
                        <YAxis
                            stroke="rgba(255,255,255,0.2)"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                            domain={['dataMin - 1000', 'dataMax + 1000']}
                            dx={-10}
                            fontFamily="Inter"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#000',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,184,0,0.3)',
                                padding: '12px'
                            }}
                            itemStyle={{ fontFamily: 'Inter', fontWeight: 700, fontSize: '12px', color: '#fff' }}
                            labelStyle={{ fontFamily: 'Inter', fontWeight: 800, fontSize: '9px', color: '#666', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                        />
                        <ReferenceLine
                            y={targetPrice}
                            stroke="rgba(255,184,0,0.2)"
                            strokeDasharray="5 5"
                            label={{
                                value: 'TARGET THRESHOLD',
                                position: 'insideBottomRight',
                                fill: 'rgba(255,184,0,0.5)',
                                fontSize: 9,
                                fontWeight: 900,
                                letterSpacing: '0.2em',
                                dy: -10
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="shipper_offer"
                            stroke="#FFB800"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#FFB800', strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: '#FFB800', stroke: '#000', strokeWidth: 2 }}
                            name="Shipper"
                            animationDuration={1500}
                        />
                        <Line
                            type="monotone"
                            dataKey="carrier_offer"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth={2}
                            dot={{ r: 3, fill: 'rgba(255,255,255,0.2)', strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: '#fff', stroke: '#000', strokeWidth: 2 }}
                            name="Carrier"
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
