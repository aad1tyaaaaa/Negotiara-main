"use client";

import { motion } from "framer-motion";
import { ArrowRight, Cpu, ShieldCheck, Zap, Crosshair, Database, Bot, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import ColorBends from "@/components/ui/ColorBends";
import { AIConsole } from "@/components/landing/AIConsole";
import { SavingsProof } from "@/components/landing/SavingsProof";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleStartNegotiation = () => {
    setIsDeploying(true);
    setTimeout(() => {
      window.location.href = "/auth/login";
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-transparent overflow-x-hidden font-sans selection:bg-[#FFB800]/30 flex flex-col">
      {/* Dynamic Background: Full-Bleed Canvas */}
      <div className="fixed inset-0 z-0">
        <ColorBends
          colors={["#FFB800", "#FF5C00", "#FFB800"]}
          rotation={45}
          speed={0.1}
          scale={1}
          frequency={1}
          warpStrength={1.5}
          mouseInfluence={0.8}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0.02}
        />
        <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-8 md:px-12 lg:px-24">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 relative">
              <img src="/logo.png" alt="Negotiara Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(255,184,0,0.4)]" />
            </div>
            <span className="font-display font-black text-2xl tracking-tighter uppercase italic text-white group-hover:text-primary transition-colors">
              Negotiara<span className="text-primary">.</span>
            </span>
          </Link>

          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="px-6 pt-12 pb-24 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-12 shadow-2xl backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Autonomous Logistics Engine</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white italic uppercase mb-12"
            >
              Autonomous <br />
              <span className="text-[#FFB800]">Freight</span> <br />
              Nego.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-2xl text-white/50 text-xl font-bold tracking-tight mb-16 leading-relaxed"
            >
              Secure the best possible rates at machine speed. Negotiara deploys autonomous agents to execute complex B2B negotiations in seconds, not days.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Button
                onClick={handleStartNegotiation}
                disabled={isDeploying}
                size="lg"
                className="!px-12 !py-7 flex items-center gap-4 group relative overflow-hidden text-xl"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Agents Deploying...
                  </>
                ) : (
                  <>
                    Start Negotiating
                    <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
                  </>
                )}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              <Link href="/demo">
                <Button variant="outline" size="lg" className="!px-10 !py-7 flex items-center gap-4">
                  <Zap className="w-4 h-4" />
                  Explore Live Demo
                </Button>
              </Link>
            </motion.div>
          </div>
        </main>

        {/* How it Works / AI Core Simulation */}
        <section className="px-6 py-32 md:px-12 lg:px-24 bg-gradient-to-b from-transparent to-black/80">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-16 space-y-4">
              <span className="text-primary font-black text-xs uppercase tracking-[0.4em] italic">Operational Protocol</span>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter">Machine Speed Logistics.</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Step 1-3: Process Stack */}
              <div className="lg:col-span-4 space-y-6">
                <div className="w-full glass p-8 rounded-2xl border-l-4 border-primary hover:translate-x-2 transition-transform shadow-2xl">
                  <Database className="w-10 h-10 text-primary mb-6" />
                  <h3 className="font-black text-xl italic text-white uppercase mb-3 leading-none tracking-tighter">01. Connect Data</h3>
                  <p className="text-[11px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">Integrate lane history, volume commitments, and target thresholds via encrypted API bridge.</p>
                </div>

                <div className="w-full glass p-8 rounded-2xl border-l-4 border-primary/40 hover:translate-x-2 transition-transform shadow-2xl">
                  <Bot className="w-10 h-10 text-primary mb-6" />
                  <h3 className="font-black text-xl italic text-white uppercase mb-3 leading-none tracking-tighter">02. Deploy Agents</h3>
                  <p className="text-[11px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">Agents initialize Bicorn Strategy protocols and establish direct secure uplinks to carriers.</p>
                </div>

                <div className="w-full glass p-8 rounded-2xl border-l-4 border-primary/40 hover:translate-x-2 transition-transform shadow-2xl text-right">
                  <BarChart3 className="w-10 h-10 text-primary mb-6 ml-auto" />
                  <h3 className="font-black text-xl italic text-white uppercase mb-3 leading-none tracking-tighter">03. Secure Savings</h3>
                  <p className="text-[11px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">Automated settlement within predefined limits. No manual intervention required.</p>
                </div>
              </div>

              {/* AI Core Simulation View: Balanced */}
              <div className="lg:col-span-8 grid grid-cols-1 gap-8 h-full">
                <AIConsole />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                  <SavingsProof />
                  <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col justify-center gap-4 bg-primary/5">
                    <div className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Protocol_Efficiency</div>
                    <div className="text-4xl font-black italic text-white tracking-tighter uppercase">98.4%</div>
                    <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest leading-relaxed">Agent autonomy rating across all active multimodal negotiation lanes.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards: Re-styled */}
        <section className="px-6 py-32 md:px-12 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={Cpu}
                title="Bicorn Strategy"
                description="Our agents use Game Theory algorithms to find mathematical equilibrium in seconds."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Secure Uplink"
                description="Zero-trust architecture ensuring your proprietary lane data never leaves the protocol."
              />
              <FeatureCard
                icon={Zap}
                title="Nano Response"
                description="Eliminate communication lag-time. Agents communicate at the speed of the network."
              />
              <FeatureCard
                icon={Crosshair}
                title="Force Field"
                description="Automated hard-stops and maximum thresholds enforced with cryptographic rigor."
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 md:px-12 lg:px-24 border-t border-white/5 bg-black">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 relative">
                <img src="/logo.png" alt="Negotiara Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-sm tracking-widest text-white italic uppercase">NEGOTIARA © 2024</span>
            </div>

            <div className="flex gap-12">
              {['Terms', 'Privacy', 'Security'].map((item) => (
                <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-primary transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="glass p-10 text-left flex flex-col gap-8 group hover:scale-[1.02] transition-all duration-500 rounded-3xl cursor-pointer hover:border-primary/40 relative overflow-hidden">
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-4 relative z-10">
        <h3 className="font-black text-lg uppercase tracking-tight italic text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-white/40 leading-relaxed font-bold">{description}</p>
      </div>
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="w-5 h-5 text-primary" />
      </div>
    </div>
  );
}