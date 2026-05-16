"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TrendingUp, Package, Plus, ArrowRight, Clock, Shield, Ship, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { negotiationApi } from "@/lib/api";

interface Metrics {
    activeCount: number;
    winRate: number;
    avgSavings: number;
    totalWeight: number;
}

export default function ShipperDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [negotiations, setNegotiations] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [metricsLoading, setMetricsLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== "SHIPPER") {
            router.push("/auth/login");
            return;
        }

        negotiationApi.getHistory()
            .then((data) => setNegotiations(data))
            .catch((err) => console.error("Failed to fetch negotiations:", err));

        setMetricsLoading(true);
        negotiationApi.getMetrics()
            .then((data) => setMetrics(data))
            .catch((err) => console.error("Failed to fetch metrics:", err))
            .finally(() => setMetricsLoading(false));
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="py-8 md:py-12 px-4 sm:px-6 md:px-8 xl:px-12 max-w-[1600px] mx-auto space-y-10 bg-background text-foreground">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter uppercase italic">Shipper Dashboard</h1>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Welcome back, {user.name} // Global Logistics Node</p>
                </div>
                <Link href="/negotiate/new">
                    <Button className="btn-primary h-14 px-8 gap-3 uppercase font-bold tracking-widest">
                        <Plus className="w-5 h-5" />
                        Create Shipment
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <StatCard
                    icon={<TrendingUp className="text-primary w-6 h-6" />}
                    title="Avg. Savings"
                    value={metricsLoading ? "—" : `${metrics?.avgSavings ?? 0}%`}
                    trend={metricsLoading ? "Loading..." : `${metrics?.avgSavings ?? 0}% vs market`}
                />
                <StatCard
                    icon={<Clock className="text-primary w-6 h-6" />}
                    title="Active RFQs"
                    value={metricsLoading ? "—" : String(metrics?.activeCount ?? 0)}
                    trend={metricsLoading ? "Loading..." : `${metrics?.activeCount ?? 0} pending`}
                />
                <StatCard
                    icon={<Shield className="text-primary w-6 h-6" />}
                    title="Win Rate"
                    value={metricsLoading ? "—" : `${metrics?.winRate ?? 0}%`}
                    trend={metricsLoading ? "Loading..." : metrics?.winRate ? "Active" : "No data yet"}
                />
                <StatCard
                    icon={<Package className="text-primary w-6 h-6" />}
                    title="Total Goods"
                    value={metricsLoading ? "—" : `${metrics?.totalWeight ?? 0}t`}
                    trend={metricsLoading ? "Loading..." : `${metrics?.totalWeight ?? 0}t total cargo`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                {/* Active Negotiations */}
                <Card className="lg:col-span-2 bento-card p-0 flex flex-col overflow-hidden h-full">
                    <CardHeader className="p-8 border-b border-border flex flex-row items-center justify-between shrink-0 bg-secondary">
                        <CardTitle className="font-display text-xl font-bold uppercase tracking-tight italic">Active Negotiations</CardTitle>
                        <Link href="/dashboard/shipper">
                            <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                                VIEW ALL <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto">
                        <div className="divide-y divide-border h-full">
                            {negotiations.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                                    <Ship className="w-8 h-8 mb-4 opacity-50 text-primary" />
                                    <p className="uppercase text-xs font-bold tracking-[0.2em]">No active negotiations found</p>
                                </div>
                            ) : (
                                negotiations.map((neg) => (
                                    <Link key={neg.id} href={`/negotiate/${neg.id}`}>
                                        <NegotiationRow
                                            title={`${neg.shipment?.cargoType || "Freight"} - ${neg.shipment?.origin} to ${neg.shipment?.destination}`}
                                            status={neg.status}
                                            price={`$${neg.targetPrice?.toLocaleString() || "0"}`}
                                        />
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Agent Status */}
                <Card className="bento-card p-8 flex flex-col gap-8 h-full bg-secondary border-border">
                    <div className="space-y-6">
                        <h3 className="font-display text-xl font-bold uppercase tracking-tight italic">AI Agent Status</h3>
                        <div className="space-y-4">
                            <AgentStatus name="Negotiator Pro" status="Active" tasks={metrics?.activeCount ?? 0} />
                            <AgentStatus name="LSP Analyst" status="Idle" tasks={0} />
                            <AgentStatus name="Strategy Engine" status="Optimizing" tasks={1} />
                        </div>
                    </div>
                    <div className="mt-auto pt-6 border-t border-border">
                        <Button variant="outline" className="w-full bg-background border-border hover:bg-zinc-900 transition-all text-muted-foreground hover:text-white uppercase text-xs font-bold tracking-widest h-12 rounded-xl">
                            Manage AI Agents
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value, trend }: { icon: React.ReactNode, title: string, value: string, trend: string }) {
    return (
        <div className="bento-card p-8 space-y-6 bg-secondary border-border hover:border-primary/50">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-background rounded-xl border border-border shadow-inner">{icon}</div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-tighter">{trend}</Badge>
            </div>
            <div>
                <div className="text-4xl font-display font-bold tracking-tighter text-white">{value}</div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">{title}</div>
            </div>
        </div>
    )
}

function NegotiationRow({ title, status, price }: { title: string, status: string, price: string }) {
    return (
        <div className="px-8 py-6 flex items-center justify-between hover:bg-primary/5 transition-all cursor-pointer group border-l-2 border-transparent hover:border-primary">
            <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                    <Ship className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <div>
                    <div className="font-bold text-white uppercase tracking-tight group-hover:text-primary transition-colors">{title}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-2 uppercase font-bold tracking-widest mt-1">
                        <MapPin className="w-3 h-3" /> EU Logistics Route
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-10">
                <div className="text-right">
                    <div className="font-display font-bold text-xl text-primary tracking-tighter">{price}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{status}</div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-2" />
            </div>
        </div>
    )
}

function AgentStatus({ name, status, tasks }: { name: string, status: string, tasks: number }) {
    return (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-background border border-border hover:border-primary/30 transition-all">
            <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${status === 'Active' ? 'bg-primary shadow-[0_0_10px_rgba(255,215,0,0.5)] animate-pulse' : status === 'Optimizing' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-zinc-700'}`} />
                <div>
                    <div className="text-sm font-bold text-white uppercase tracking-tight">{name}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{tasks} ACTIVE NODES</div>
                </div>
            </div>
            <Badge className={`text-[9px] font-black uppercase tracking-tighter ${status === 'Active' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-secondary text-muted-foreground border-border'}`}>{status}</Badge>
        </div>
    )
}
