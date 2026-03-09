"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Send, Info, Package, MapPin, Target, Shield, Zap, Layers } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

export default function NewNegotiationPage() {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("")

    // Form States
    const [context, setContext] = React.useState("")
    const [targetPrice, setTargetPrice] = React.useState("")
    const [reservationPrice, setReservationPrice] = React.useState("")
    const [benchmark, setBenchmark] = React.useState("")
    const [rounds, setRounds] = React.useState("6")
    const [strategy, setStrategy] = React.useState("Analytical")

    // New Dynamic Fields
    const [origin, setOrigin] = React.useState("")
    const [destination, setDestination] = React.useState("")
    const [weight, setWeight] = React.useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const { negotiationApi } = await import("@/lib/api")
            const response = await negotiationApi.create({
                shipment: {
                    origin: origin,
                    destination: destination,
                    distance: 1050,
                    cargo_type: context,
                    weight: parseFloat(weight) || 1000,
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                shipper_metrics: {
                    initial_offer: parseFloat(targetPrice) * 0.9,
                    target_price: parseFloat(targetPrice),
                    budget: parseFloat(reservationPrice)
                },
                carrier_metrics: {
                    initial_offer: parseFloat(reservationPrice) * 1.5,
                    min_price: parseFloat(targetPrice) * 0.8
                },
                market_signals: {
                    trend: "stable",
                    capacity: "medium",
                    fuel_price: 3.5
                },
                strategyProfile: strategy,
                max_rounds: parseInt(rounds)
            });

            router.push(`/negotiate/${response.negotiationId}`)
        } catch (err: any) {
            setError(err.message || "Failed to start negotiation.")
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-10 py-8 md:py-12 px-4 sm:px-6 md:px-8 xl:px-12 max-w-5xl mx-auto bg-background text-foreground">
            <Link href="/" className="shrink-0 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full border border-border bg-secondary hover:text-primary transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground">Return to Command</span>
            </Link>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Initialization Matrix</span>
                </div>
                <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tighter uppercase italic">Mission Parameters</h1>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold max-w-2xl leading-loose">
                    Define the shipment coordinates, cargo classification, and AI concession logic to initiate autonomous negotiation.
                </p>
                {error && <div className="mt-4 p-4 border-2 border-red-500/30 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl italic">{error}</div>}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                <Card className="bento-card bg-secondary border-border p-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Origin Vector
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input placeholder="e.g. SHENZHEN HUB, CN" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
                    </CardContent>
                </Card>

                <Card className="bento-card bg-secondary border-border p-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                            <MapPin className="w-4 h-4" /> Target Node
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input placeholder="e.g. LOS ANGELES PORT, US" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                    </CardContent>
                </Card>

                <Card className="bento-card bg-secondary border-border p-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Mass Index (kg)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input type="number" placeholder="5000" value={weight} onChange={(e) => setWeight(e.target.value)} required />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3 bento-card bg-secondary border-border p-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                            <Package className="w-4 h-4" /> Cargo Classification
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="e.g. HIGH-VALUE SEMICONDUCTORS"
                            className="text-lg py-7 font-black italic tracking-tight"
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            required
                        />
                    </CardContent>
                </Card>

                <Card className="bento-card bg-secondary border-border p-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                            <Target className="w-4 h-4" /> Goal Price (USD)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black font-display">$</span>
                            <Input type="number" placeholder="0.00" className="pl-10 font-bold" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} required />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bento-card bg-secondary border-border p-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Reservation Ceiling
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-black font-display">$</span>
                            <Input type="number" placeholder="0.00" className="pl-10 font-bold" value={reservationPrice} onChange={(e) => setReservationPrice(e.target.value)} required />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bento-card bg-secondary border-border p-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Cycle Rounds
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input type="number" min={1} max={10} value={rounds} onChange={(e) => setRounds(e.target.value)} className="font-bold" />
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 lg:col-span-3 bento-card bg-secondary border-border p-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic flex items-center gap-2">
                            <Target className="w-4 h-4" /> Behavioral Algorithm
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select AI Negotiation Logic Profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <select
                            value={strategy}
                            onChange={(e) => setStrategy(e.target.value)}
                            className="flex h-14 w-full rounded-xl border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-[0.2em] italic text-zinc-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
                        >
                            <option value="Collaborative">Symbiotic (Win-Win Utility)</option>
                            <option value="Aggressive">Predatory (Maximum Alpha / Firm)</option>
                            <option value="Analytical" selected>Calculated (Data-Driven Optimizer)</option>
                        </select>
                    </CardContent>
                </Card>

                <div className="md:col-span-2 lg:col-span-3 flex items-start gap-5 p-6 bg-primary/5 rounded-[24px] border border-primary/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/2 shadow-[inset_0_0_50px_rgba(255,215,0,0.05)] pointer-events-none"></div>
                    <Info className="w-8 h-8 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground leading-loose">
                        WARNING: Initiation will deploy high-magnitude AI agents into active negotiation clusters.
                        Parameter verification is <span className="text-primary italic">critical</span> before cycle launch.
                    </p>
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-4">
                    <Button type="submit" size="lg" variant="premium" disabled={loading} className="px-16 py-8 gap-4 shadow-[0_20px_40px_rgba(255,215,0,0.2)]">
                        {loading ? "ESTABLISHING UPLINK..." : "LAUNCH MISSION"}
                        {!loading && <Send className="w-5 h-5" />}
                    </Button>
                </div>
            </form>
        </div>
    )
}
