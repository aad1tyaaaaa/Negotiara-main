"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Truck, DollarSign, Clock, Layout, ArrowRight, Bell, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { negotiationApi } from "@/lib/api";

export default function CarrierDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [negotiations, setNegotiations] = useState<any[]>([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
    const [opCost, setOpCost] = useState("");
    const [margin, setMargin] = useState("10");

    useEffect(() => {
        if (!user || user.role !== "CARRIER") {
            router.push("/auth/login");
        } else {
            negotiationApi.getHistory()
                .then((data) => setNegotiations(data))
                .catch((err) => console.error("Failed to fetch negotiations:", err));
        }
    }, [user, router]);

    if (!user) return null;

    const activeCount = negotiations.filter(n => n.status === "IN_PROGRESS").length;
    // Get latest negotiation for the live counter offer widget
    const latestNeg = negotiations.length > 0 ? negotiations[0] : null;

    const handleRfqClick = (id: string) => {
        setSelectedRfqId(id);
        setShowModal(true);
    };

    const handleInitializeAgent = () => {
        if (!selectedRfqId) return;
        router.push(`/negotiate/${selectedRfqId}`);
        setShowModal(false);
    };

    return (
        <div className="py-8 md:py-12 px-4 sm:px-6 md:px-8 xl:px-12 max-w-[1600px] mx-auto space-y-10 bg-background text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                    <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter uppercase italic text-white leading-none">Carrier Dashboard</h1>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black mt-2 italic">Welcome back, {user.name} // Fleet Command Center</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" size="icon" className="w-14 h-14 rounded-2xl">
                        <Bell className="w-6 h-6" />
                    </Button>
                    <Link href="/dashboard/carrier">
                        <Button variant="premium" className="h-14 px-10 gap-4">
                            <Layout className="w-5 h-5" />
                            Fleet Overview
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard icon={<DollarSign className="w-6 h-6" />} title="Revenue (MTD)" value={`$${(negotiations.length * 12500).toLocaleString()}`} trend="+12.4%" />
                <StatCard icon={<Clock className="w-6 h-6" />} title="Avg. Response" value="0.8s" trend="-0.4s" />
                <StatCard icon={<Truck className="w-6 h-6" />} title="Active Trucks" value={`${Math.min(negotiations.length + 5, 24)}/24`} trend="82%" />
                <StatCard icon={<Layout className="w-6 h-6" />} title="Pending RFQs" value={activeCount.toString()} trend="Priority" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                {/* Incoming RFQs */}
                <Card className="lg:col-span-2 glass glow-border p-0 flex flex-col overflow-hidden h-full rounded-[32px] bg-zinc-900/20">
                    <CardHeader className="p-10 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
                        <div className="space-y-1">
                            <CardTitle className="font-display text-2xl font-black uppercase tracking-tight italic text-white leading-none">Incoming RFQs</CardTitle>
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 italic">Live Opportunities via Encrypted Link</p>
                        </div>
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black uppercase tracking-tighter px-4 py-1.5 rounded-lg">{activeCount} New Requests</Badge>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto scrollbar-hide">
                        <div className="divide-y divide-white/5 h-full">
                            {negotiations.length === 0 ? (
                                <div className="p-16 text-center text-white/20 flex flex-col items-center justify-center h-full space-y-4">
                                    <FileText className="w-12 h-12 opacity-50" />
                                    <p className="uppercase text-[10px] font-black tracking-[0.3em] italic">No active carrier signals detected.</p>
                                </div>
                            ) : (
                                negotiations.map((neg) => (
                                    <div key={neg.id} onClick={() => handleRfqClick(neg.id)}>
                                        <RFQRow
                                            company={`SHIPPER_${neg.shipperId.substring(0, 4).toUpperCase()}`}
                                            route={`${neg.shipment?.origin} > ${neg.shipment?.destination}`}
                                            deadline="Live"
                                            amount={`$${neg.targetPrice?.toLocaleString() || "0"}`}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Counter Offer Panel */}
                <Card className="glass glow-border p-10 flex flex-col gap-10 h-full bg-zinc-950 border-primary/20 shadow-[0_0_50px_rgba(255,184,0,0.05)] rounded-[32px]">
                    <div className="space-y-8">
                        <div className="space-y-1">
                            <h3 className="font-display text-2xl font-black uppercase tracking-tight italic text-primary leading-none">Live Transmission</h3>
                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 italic">Active Negotiation Bridge</p>
                        </div>
                        {latestNeg ? (
                            <div className="p-8 rounded-[24px] bg-white/5 border border-white/10 space-y-8 shadow-inner">
                                <div className="flex justify-between items-center text-[9px] uppercase font-black tracking-[0.3em] text-white/30 italic">
                                    <span>#{latestNeg.id.substring(0, 8).toUpperCase()}</span>
                                    <span className="text-primary">Round {latestNeg.currentRound}/{latestNeg.maxRounds}</span>
                                </div>
                                <div className="text-5xl font-display font-black text-white tracking-tighter italic">${latestNeg.targetPrice?.toLocaleString()}</div>
                                <Link href={`/negotiate/${latestNeg.id}`} className="block">
                                    <Button variant="premium" className="w-full h-16 uppercase text-[10px] font-black tracking-[0.3em]">
                                        Update Counter
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.3em] italic border border-white/5 rounded-[24px]">No active links.</div>
                        )}
                    </div>
                    {latestNeg && latestNeg.offers && latestNeg.offers.length > 0 && (
                        <div className="space-y-8">
                            <div className="text-[9px] uppercase font-black tracking-[0.4em] text-white/30 border-b border-white/5 pb-4 italic">Telemetry Stream</div>
                            <div className="space-y-6">
                                {latestNeg.offers.slice(-2).map((offer: any, idx: number) => (
                                    <HistoryItem
                                        key={idx}
                                        user={offer.senderId === latestNeg.shipperId ? "Shipper" : "You (AI)"}
                                        message={`Proposed $${offer.price}`}
                                        time={`Round ${offer.round}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* AI Initialization Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 selection:bg-primary/30">
                    <Card className="w-full max-w-lg glass glow-border border-primary/30 p-2 rounded-[32px] overflow-hidden bg-zinc-950 shadow-[0_0_100px_rgba(255,184,0,0.15)]">
                        <CardHeader className="p-10 space-y-4">
                            <CardTitle className="font-display text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Initialize Agent</CardTitle>
                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic">
                                Setting Autonomous Guardrails for RFQ link
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 pt-0 space-y-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1 italic">Operational Floor (USD)</label>
                                <Input type="number" placeholder="12000" value={opCost} onChange={(e) => setOpCost(e.target.value)} className="bg-white/5 border-white/10 text-white rounded-[20px] h-16 text-lg font-black uppercase tracking-widest focus:border-primary/50 italic px-8 transition-all" />
                                <p className="text-[8px] text-white/30 uppercase font-black tracking-widest italic ml-1">AI Agent will self-terminate below this utility value.</p>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 ml-1 italic">Profit Matrix (%)</label>
                                <Input type="number" placeholder="15" value={margin} onChange={(e) => setMargin(e.target.value)} className="bg-white/5 border-white/10 text-white rounded-[20px] h-16 text-lg font-black uppercase tracking-widest focus:border-primary/50 italic px-8 transition-all" />
                            </div>
                            <div className="flex gap-6 justify-end items-center mt-4">
                                <Button variant="ghost" onClick={() => setShowModal(false)} className="h-14 px-8">Discard</Button>
                                <Button onClick={handleInitializeAgent} variant="premium" className="h-14 px-12">
                                    Commence Agent
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, title, value, trend }: { icon: React.ReactNode, title: string, value: string, trend: string }) {
    return (
        <div className="glass glow-border p-10 space-y-8 bg-zinc-900/20 hover:border-primary/30 transition-all rounded-[32px] group">
            <div className="flex justify-between items-start">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 group-hover:bg-primary/20 transition-all text-primary">{icon}</div>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-md">{trend}</Badge>
            </div>
            <div>
                <div className="text-5xl font-display font-black tracking-tighter text-white italic leading-none">{value}</div>
                <div className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em] mt-3 italic">{title}</div>
            </div>
        </div>
    )
}

function RFQRow({ company, route, deadline, amount }: { company: string, route: string, deadline: string, amount: string }) {
    return (
        <div className="px-10 py-8 flex items-center justify-between hover:bg-primary/10 transition-all cursor-pointer group border-l-[4px] border-transparent hover:border-primary">
            <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center font-black text-primary group-hover:border-primary/30 transition-all uppercase italic shadow-2xl scale-100 group-hover:scale-105">
                    {company.charAt(0)}
                </div>
                <div>
                    <div className="font-black text-white text-lg uppercase tracking-tight group-hover:text-primary transition-colors italic">{company}</div>
                    <div className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em] mt-2 italic">{route}</div>
                </div>
            </div>
            <div className="flex items-center gap-14">
                <div className="text-right">
                    <div className="font-display font-black text-3xl text-white tracking-tighter italic group-hover:text-primary transition-colors">{amount}</div>
                    <div className="text-[9px] text-primary font-black uppercase flex items-center gap-2 justify-end tracking-[0.3em] mt-1 italic">
                        <Clock className="w-3.5 h-3.5" /> {deadline}
                    </div>
                </div>
                <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-primary transition-all group-hover:translate-x-3" />
            </div>
        </div>
    )
}

function HistoryItem({ user, message, time }: { user: string, message: string, time: string }) {
    return (
        <div className="flex justify-between items-center p-5 rounded-[20px] bg-white/5 border border-white/5 hover:border-white/10 transition-all">
            <div className="flex flex-col gap-1.5">
                <span className="font-black text-primary text-[9px] uppercase tracking-[0.3em] italic">{user}</span>
                <span className="text-white/80 font-bold text-xs italic tracking-tight">{message}</span>
            </div>
            <span className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em] italic bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">{time}</span>
        </div>
    )
}
