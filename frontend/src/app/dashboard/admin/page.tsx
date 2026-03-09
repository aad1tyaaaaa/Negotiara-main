"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield, Users, Activity, List, Cpu, Search, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const MOCK_SYSTEM_HEALTH = [
    { time: "10:00", load: 24 },
    { time: "11:00", load: 32 },
    { time: "12:00", load: 28 },
    { time: "13:00", load: 45 },
    { time: "14:00", load: 38 },
    { time: "15:00", load: 52 },
];

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!user || user.role !== "ADMIN") {
            router.push("/auth/login");
        }
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="py-12 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold">Admin Console</h1>
                    <p className="text-muted-foreground">System-wide monitoring and governance.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/40 p-1 rounded-2xl border border-white/20">
                    <Button variant="ghost" className="rounded-xl h-10 gap-2"><Search className="w-4 h-4" /> Global Search</Button>
                    <Button className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl h-10 gap-2"><Lock className="w-4 h-4" /> Access Logs</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
                {/* System Health */}
                <Card className="md:col-span-2 bento-card p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg"><Activity className="w-5 h-5 text-emerald-500" /></div>
                            <h3 className="font-bold">AI Engine Load (24h)</h3>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Operational</Badge>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={MOCK_SYSTEM_HEALTH}>
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="load" stroke="var(--primary)" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="space-y-6 h-full">
                    <Tile icon={<Users className="text-primary" />} label="Users Online" value="1,204" />
                    <Tile icon={<Cpu className="text-purple-500" />} label="Active Agents" value="482" />
                    <Tile icon={<AlertTriangle className="text-amber-500" />} label="Critical Errors" value="0" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bento-card p-6 gap-6 flex flex-col">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold">Recent System Logs</h3>
                        <Button variant="ghost" size="sm">Download CSV</Button>
                    </div>
                    <div className="space-y-4">
                        <LogItem level="INFO" module="AUTH" msg="User #402 logged in as CARRIER" time="2s ago" />
                        <LogItem level="WARN" module="ENGINE" msg="Concession limit reached for Session #N-09" time="15s ago" />
                        <LogItem level="INFO" module="API" msg="New RFQ #889 created by Global Shipper" time="1m ago" />
                    </div>
                </Card>

                <Card className="bento-card p-6 gap-6 flex flex-col bg-primary text-white">
                    <h3 className="font-bold">Security & Compliance</h3>
                    <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
                        <Shield className="w-16 h-16 opacity-40" strokeWidth={1} />
                        <div>
                            <div className="text-2xl font-display font-light">100% Secure</div>
                            <div className="text-sm opacity-70">All negotiation data is encrypted at rest.</div>
                        </div>
                        <Button className="bg-white text-primary hover:bg-white/90 rounded-xl w-full">Run Security Audit</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function Tile({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="bento-card p-6 flex flex-col justify-between h-[120px]">
            <div className="flex justify-between items-center text-muted-foreground">
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
                {icon}
            </div>
            <div className="text-3xl font-display font-bold">{value}</div>
        </div>
    )
}

function LogItem({ level, module, msg, time }: { level: string, module: string, msg: string, time: string }) {
    return (
        <div className="flex items-center justify-between text-xs p-3 bg-white/30 rounded-xl border border-white/20">
            <div className="flex items-center gap-3">
                <span className={`font-bold ${level === 'WARN' ? 'text-amber-600' : 'text-primary'}`}>{level}</span>
                <span className="text-muted-foreground">[{module}]</span>
                <span className="font-medium">{msg}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
    )
}
