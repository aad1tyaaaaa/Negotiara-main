import { ShaderAnimation } from "@/components/ui/shader-animation";

export default function ShaderDemoPage() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 z-0">
        <ShaderAnimation />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <span className="pointer-events-none text-center text-7xl md:text-9xl leading-none font-bold tracking-tighter whitespace-pre-wrap text-white drop-shadow-2xl">
          Shader Animation
        </span>
        <p className="text-white/60 font-mono text-sm tracking-[0.2em] uppercase">
          Three.js WebGL Core // Protocol_v5
        </p>
      </div>
    </div>
  )
}
