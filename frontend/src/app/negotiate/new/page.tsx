"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Send, MapPin, DollarSign, Zap, CheckCircle, AlertCircle, ChevronRight, Info, TrendingDown, Shield, Target, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import Link from "next/link"

// ─── Constants ──────────────────────────────────────────────────────────────────

const STEPS = [
    { id: 0, label: "Shipment", Icon: MapPin },
    { id: 1, label: "Pricing",  Icon: DollarSign },
    { id: 2, label: "Config",   Icon: Zap },
    { id: 3, label: "Review",   Icon: CheckCircle },
]

const PRESETS = {
    conservative: { label: "Conservative", subtitle: "Best for first-time shippers",    targetPrice: 8500,  reservationPrice: 12000, rounds: 8, strategy: "Analytical"    },
    moderate:     { label: "Moderate",     subtitle: "Balanced risk & reward",           targetPrice: 10000, reservationPrice: 14000, rounds: 6, strategy: "Collaborative" },
    aggressive:   { label: "Aggressive",   subtitle: "Maximum savings, higher variance", targetPrice: 7500,  reservationPrice: 10000, rounds: 5, strategy: "Aggressive"    },
}

const STRATEGIES = [
    { value: "Collaborative", label: "Symbiotic",  subtitle: "Win-Win",     description: "Finds mutual ground. Best for long-term carrier relationships.", Icon: Shield   },
    { value: "Aggressive",    label: "Predatory",  subtitle: "Max Savings", description: "Pushes hard on price. Faster convergence, higher friction.",     Icon: Target   },
    { value: "Analytical",    label: "Calculated", subtitle: "Data-Driven", description: "Uses market intelligence to anchor optimal price points.",       Icon: BarChart2 },
]

const LOADING_MESSAGES = [
    "Connecting to AI cluster...",
    "Initializing negotiation agents...",
    "Loading market intelligence...",
    "Calibrating strategy profile...",
    "Deploying autonomous agents...",
    "Uplink established.",
]

// ─── Sub-components ──────────────────────────────────────────────────────────────

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
    const [visible, setVisible] = React.useState(false)
    return (
        <span className="relative inline-flex items-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
            {children}
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 bg-zinc-900 border border-white/10 rounded-xl text-[10px] text-white/70 z-50 pointer-events-none shadow-2xl leading-relaxed"
                    >
                        {text}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                    </motion.div>
                )}
            </AnimatePresence>
        </span>
    )
}

function FieldInput({ label, value, onChange, placeholder, type = "text", description, min, max, autoFocus }: any) {
    const isFilled = !!value
    return (
        <div className="relative group">
            <div className="flex items-center gap-2 mb-2">
                <label className="text-xs font-black uppercase tracking-widest text-primary italic">{label}</label>
                <Tooltip text={description}>
                    <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                </Tooltip>
            </div>
            <div className="relative">
                <Input
                    type={type} placeholder={placeholder} value={value} onChange={onChange}
                    min={min} max={max} autoFocus={autoFocus}
                    aria-label={label} aria-required={true}
                    className={`transition-all pr-10 ${isFilled ? "border-primary/50 bg-primary/5" : ""}`}
                />
                {isFilled && <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />}
            </div>
        </div>
    )
}

function RoutePreview({ origin, destination }: { origin: string; destination: string }) {
    if (!origin && !destination) return null
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <div className="flex-1 min-w-0 text-center">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Origin</p>
                <p className="text-xs font-black text-white truncate">{origin || "—"}</p>
            </div>
            <div className="flex flex-col items-center gap-0.5 shrink-0">
                <div className="w-10 h-px bg-linear-to-r from-primary/30 via-primary to-primary/30" />
                <ArrowRight className="w-3 h-3 text-primary" />
                <p className="text-[8px] text-primary font-bold uppercase tracking-widest">Route</p>
            </div>
            <div className="flex-1 min-w-0 text-center">
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-1">Destination</p>
                <p className="text-xs font-black text-white truncate">{destination || "—"}</p>
            </div>
        </motion.div>
    )
}

function RoundsSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const hint = value <= 3 ? "Fast negotiation, less optimal" : value <= 6 ? "Optimal balance for most shipments" : "Deep convergence, takes longer"
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-black uppercase tracking-widest text-primary italic">Cycle Rounds</label>
                <Tooltip text="Number of negotiation rounds. More rounds = better convergence but longer time.">
                    <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                </Tooltip>
                <motion.span key={value} initial={{ scale: 1.5, color: "#FFD700" }} animate={{ scale: 1 }} className="ml-auto text-2xl font-black text-primary">{value}</motion.span>
            </div>
            <input
                type="range" min={1} max={10} value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                aria-label="Cycle Rounds"
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(255,215,0,0.7)]"
            />
            <div className="flex justify-between mt-1.5 px-0.5">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <span key={n} className={`text-[8px] font-bold transition-colors ${n === value ? "text-primary" : "text-muted-foreground/30"}`}>{n}</span>
                ))}
            </div>
            <p className="text-[9px] text-muted-foreground mt-2 italic">{hint}</p>
        </div>
    )
}

function StrategyCards({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <label className="text-xs font-black uppercase tracking-widest text-primary italic">Behavioral Algorithm</label>
                <Tooltip text="AI negotiation approach that matches your business style">
                    <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                </Tooltip>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {STRATEGIES.map(({ value: sv, label, subtitle, description, Icon }) => {
                    const selected = value === sv
                    return (
                        <button
                            key={sv} type="button" onClick={() => onChange(sv)}
                            className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${selected ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(255,215,0,0.08)]" : "border-border bg-white/3 hover:border-primary/40 hover:bg-white/5"}`}
                        >
                            <Icon className={`w-5 h-5 mb-2.5 transition-colors ${selected ? "text-primary" : "text-muted-foreground"}`} />
                            <p className={`text-xs font-black uppercase tracking-widest transition-colors ${selected ? "text-primary" : "text-white"}`}>{label}</p>
                            <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 mb-2 transition-colors ${selected ? "text-primary/70" : "text-muted-foreground"}`}>{subtitle}</p>
                            <p className="text-[9px] text-white/50 leading-relaxed">{description}</p>
                            {selected && (
                                <motion.div layoutId="strategy-ring" className="absolute inset-0 rounded-xl border-2 border-primary pointer-events-none" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

function LoadingOverlay({ currentIdx }: { currentIdx: number }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="max-w-sm w-full mx-4 p-8 bg-secondary border border-primary/30 rounded-3xl shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Negotiara AI Engine</span>
                </div>
                <div className="space-y-3 font-mono">
                    {LOADING_MESSAGES.map((msg, i) => (
                        <motion.div
                            key={msg} initial={{ opacity: 0, x: -8 }} animate={{ opacity: i <= currentIdx ? 1 : 0.2, x: 0 }} transition={{ delay: i * 0.05 }}
                            className={`text-xs flex items-center gap-2 ${i === currentIdx ? "text-primary" : i < currentIdx ? "text-white/40" : "text-white/15"}`}
                        >
                            <span className={i <= currentIdx ? "text-primary" : "text-white/15"}>›</span>
                            {msg}
                            {i === currentIdx && <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse" />}
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

// ─── Main Page ───────────────────────────────────────────────────────────────────

export default function NewNegotiationPage() {
    const router = useRouter()
    const [step, setStep] = React.useState(0)
    const [loading, setLoading] = React.useState(false)
    const [loadingMsgIdx, setLoadingMsgIdx] = React.useState(0)
    const [error, setError] = React.useState("")

    // Form state
    const [origin, setOrigin] = React.useState("")
    const [destination, setDestination] = React.useState("")
    const [weight, setWeight] = React.useState("")
    const [cargoType, setCargoType] = React.useState("")
    const [targetPrice, setTargetPrice] = React.useState("")
    const [reservationPrice, setReservationPrice] = React.useState("")
    const [rounds, setRounds] = React.useState(6)
    const [strategy, setStrategy] = React.useState("Analytical")

    // Debounced price validation
    const [debouncedTarget, setDebouncedTarget] = React.useState("")
    const [debouncedReservation, setDebouncedReservation] = React.useState("")
    React.useEffect(() => { const t = setTimeout(() => setDebouncedTarget(targetPrice), 350);    return () => clearTimeout(t) }, [targetPrice])
    React.useEffect(() => { const t = setTimeout(() => setDebouncedReservation(reservationPrice), 350); return () => clearTimeout(t) }, [reservationPrice])

    // Unsaved changes warning
    React.useEffect(() => {
        const hasData = origin || destination || weight || cargoType || targetPrice || reservationPrice
        if (!hasData) return
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = "" }
        window.addEventListener("beforeunload", handler)
        return () => window.removeEventListener("beforeunload", handler)
    }, [origin, destination, weight, cargoType, targetPrice, reservationPrice])

    // Derived validation
    const isValidPriceRange = !!(debouncedTarget && debouncedReservation && parseFloat(debouncedTarget) <= parseFloat(debouncedReservation))
    const savings = isValidPriceRange ? ((parseFloat(debouncedReservation) - parseFloat(debouncedTarget)) / parseFloat(debouncedReservation) * 100).toFixed(1) : null
    const stepValid = [
        !!(origin && destination && weight && cargoType),
        !!(targetPrice && reservationPrice && isValidPriceRange),
        true,
        true,
    ]
    const canAdvance = stepValid[step]
    const isValidForm = stepValid.every(Boolean)

    // Refs for keyboard shortcut (avoids stale closures)
    const stepRef = React.useRef(step)
    const canAdvanceRef = React.useRef(canAdvance)
    const handleSubmitRef = React.useRef<() => void>(() => {})
    stepRef.current = step
    canAdvanceRef.current = canAdvance

    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault()
                if (stepRef.current < 3) { if (canAdvanceRef.current) setStep(s => s + 1) }
                else { handleSubmitRef.current() }
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    const handlePreset = (preset: keyof typeof PRESETS) => {
        const v = PRESETS[preset]
        setTargetPrice(v.targetPrice.toString())
        setReservationPrice(v.reservationPrice.toString())
        setRounds(v.rounds)
        setStrategy(v.strategy)
    }

    const handleSubmit = async () => {
        if (!isValidForm) return
        setLoading(true)
        setLoadingMsgIdx(0)
        setError("")
        const interval = setInterval(() => {
            setLoadingMsgIdx(i => { if (i >= LOADING_MESSAGES.length - 1) { clearInterval(interval); return i }; return i + 1 })
        }, 700)
        // Wait for loading animation to finish, then redirect to simulated session
        setTimeout(() => {
            clearInterval(interval)
            router.push(`/negotiate/sim-session`)
        }, LOADING_MESSAGES.length * 700 + 400)
    }
    handleSubmitRef.current = handleSubmit

    const overallProgress = Math.round(([origin, destination, weight, cargoType, targetPrice, reservationPrice].filter(Boolean).length / 6) * 100)

    return (
        <>
            <AnimatePresence>
                {loading && <LoadingOverlay currentIdx={loadingMsgIdx} />}
            </AnimatePresence>

            <div className="min-h-screen w-full bg-background text-foreground">
                {/* Header */}
                <div className="px-6 sm:px-8 py-6 border-b border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <Link href="/dashboard/shipper" className="inline-flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full border border-border bg-secondary hover:text-primary">
                                <ArrowLeft className="w-4 h-4 text-primary" />
                            </Button>
                            <span className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground">Return to Command</span>
                        </Link>
                        <AnimatePresence>
                            {savings && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-full">
                                    <TrendingDown className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-black text-primary">{savings}% savings buffer</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Setup Wizard</span>
                            </div>
                            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tighter uppercase italic">Mission Parameters</h1>
                        </div>
                        <div className="sm:ml-auto flex flex-col items-end gap-1.5">
                            <p className="text-[10px] font-black text-primary">{overallProgress}% Complete</p>
                            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-primary" animate={{ width: `${overallProgress}%` }} transition={{ duration: 0.5 }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step Tabs */}
                <div className="px-6 sm:px-8 py-4 border-b border-white/5 overflow-x-auto">
                    <div className="flex items-center gap-1 min-w-max">
                        {STEPS.map((s, i) => {
                            const done = stepValid[i] && i < step
                            const active = i === step
                            return (
                                <React.Fragment key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => { if (i <= step) setStep(i) }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-primary text-black" : done ? "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer" : "text-muted-foreground cursor-default"}`}
                                    >
                                        {done ? <CheckCircle className="w-3 h-3" /> : <s.Icon className="w-3 h-3" />}
                                        {s.label}
                                    </button>
                                    {i < STEPS.length - 1 && <div className={`w-8 h-px transition-colors ${i < step ? "bg-primary/40" : "bg-white/10"}`} />}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <div className="px-4 sm:px-6 py-6">
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 border-2 border-red-500/30 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* Step 0 — Shipment */}
                        {step === 0 && (
                            <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                <Card className="bento-card bg-secondary border-border">
                                    <CardHeader className="pb-4 flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic">Shipment Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FieldInput label="Origin Vector" placeholder="e.g., SHENZHEN HUB, CN" value={origin} onChange={(e: any) => setOrigin(e.target.value)} description="Pickup location - port, hub, or city code" autoFocus />
                                            <FieldInput label="Target Node" placeholder="e.g., LOS ANGELES PORT, US" value={destination} onChange={(e: any) => setDestination(e.target.value)} description="Delivery location - port, hub, or city code" />
                                        </div>
                                        <RoutePreview origin={origin} destination={destination} />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FieldInput label="Mass Index (kg)" placeholder="5000" type="number" value={weight} onChange={(e: any) => setWeight(e.target.value)} description="Total shipment weight in kilograms" />
                                            <FieldInput label="Cargo Classification" placeholder="e.g., Electronics, Perishables" value={cargoType} onChange={(e: any) => setCargoType(e.target.value)} description="Type and description of cargo (e.g., Electronics, Perishables)" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Step 1 — Pricing */}
                        {step === 1 && (
                            <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                <Card className="bento-card bg-secondary border-border">
                                    <CardHeader className="pb-4 flex items-center gap-3">
                                        <DollarSign className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic">Pricing Strategy</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-3">Quick Presets</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(Object.entries(PRESETS) as [keyof typeof PRESETS, typeof PRESETS[keyof typeof PRESETS]][]).map(([key, preset]) => (
                                                    <button key={key} type="button" onClick={() => handlePreset(key)} className="flex flex-col items-start px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5 transition-all">
                                                        <span className="text-[11px] font-black text-white uppercase tracking-wide">{preset.label}</span>
                                                        <span className="text-[9px] text-muted-foreground mt-0.5">{preset.subtitle}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <FieldInput label="Goal Price (USD)" placeholder="10000" type="number" value={targetPrice} onChange={(e: any) => setTargetPrice(e.target.value)} description="Ideal price you want to achieve - AI targets this" autoFocus />
                                            <FieldInput label="Reservation Ceiling (USD)" placeholder="14000" type="number" value={reservationPrice} onChange={(e: any) => setReservationPrice(e.target.value)} description="Maximum acceptable price - walk-away threshold" />
                                        </div>
                                        <AnimatePresence>
                                            {debouncedTarget && debouncedReservation && (
                                                !isValidPriceRange ? (
                                                    <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-[10px] font-bold text-orange-200">
                                                        ⚠️ Goal Price must be ≤ Reservation Ceiling
                                                    </motion.div>
                                                ) : (
                                                    <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center gap-3">
                                                        <TrendingDown className="w-5 h-5 text-primary shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-black text-primary">{savings}% savings buffer</p>
                                                            <p className="text-[9px] text-white/50 mt-0.5">AI will negotiate toward your goal price within this range</p>
                                                        </div>
                                                    </motion.div>
                                                )
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Step 2 — Config */}
                        {step === 2 && (
                            <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                <Card className="bento-card bg-secondary border-border">
                                    <CardHeader className="pb-4 flex items-center gap-3">
                                        <Zap className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic">Negotiation Configuration</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <RoundsSlider value={rounds} onChange={setRounds} />
                                        <StrategyCards value={strategy} onChange={setStrategy} />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Step 3 — Review */}
                        {step === 3 && (
                            <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                                <Card className="bento-card bg-secondary border-border">
                                    <CardHeader className="pb-4 flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary italic">Mission Review</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Route</p>
                                                <p className="text-sm font-black text-white break-all">{origin} → {destination}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Shipment</p>
                                                <p className="text-sm font-black text-white">{weight}kg · {cargoType}</p>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Pricing Range</p>
                                                <p className="text-sm font-black text-white">${targetPrice} <span className="text-muted-foreground text-xs font-normal">to</span> ${reservationPrice}</p>
                                                {savings && <p className="text-[9px] text-primary mt-1 font-bold">{savings}% savings buffer</p>}
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Configuration</p>
                                                <p className="text-sm font-black text-white">{rounds} rounds · {strategy}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-amber-200/70 leading-relaxed">
                                                <span className="text-amber-500 font-bold">Notice: </span>
                                                High-magnitude AI agents will deploy for autonomous negotiation. Verify all parameters before initiating the uplink.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <div>
                            {step > 0 && (
                                <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)} className="gap-2 text-muted-foreground hover:text-white">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-[9px] text-muted-foreground hidden sm:block">
                                {step < 3 ? "Ctrl+Enter to advance" : "Ctrl+Enter to launch"}
                            </p>
                            {step < 3 ? (
                                <Button type="button" onClick={() => setStep(s => s + 1)} disabled={!canAdvance} className="gap-2 px-6">
                                    Continue <ChevronRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        type="button" onClick={handleSubmit} disabled={!isValidForm || loading}
                                        className="gap-2 px-8 h-12 shadow-[0_8px_24px_rgba(255,215,0,0.15)] hover:shadow-[0_12px_32px_rgba(255,215,0,0.25)] transition-shadow"
                                        variant="premium" size="lg"
                                    >
                                        LAUNCH MISSION <Send className="w-4 h-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

