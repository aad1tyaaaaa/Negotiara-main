import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    // Base styles: Incorporating your specific Neo-Brutalism properties
    "inline-flex items-center justify-center whitespace-nowrap font-sans font-black uppercase tracking-tight transition-all cursor-pointer select-none active:translate-x-[0.05em] active:translate-y-[0.05em] active:shadow-[0.05em_0.05em_0px_0px_rgba(0,0,0,1)] disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                // This is your requested style: #fbca1f, 3px border, 0.1em shadow
                default:
                    "bg-[#fbca1f] text-black border-[3px] border-black shadow-[0.1em_0.1em_0px_0px_rgba(0,0,0,1)] hover:shadow-[0.15em_0.15em_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[0.05em] hover:-translate-y-[0.05em]",
                destructive:
                    "bg-red-500 text-white border-[3px] border-black shadow-[0.1em_0.1em_0px_0px_rgba(0,0,0,1)] hover:bg-red-600",
                outline:
                    "bg-white text-black border-[3px] border-black shadow-[0.1em_0.1em_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-100",
                secondary:
                    "bg-zinc-900 text-white border-[3px] border-black shadow-[0.1em_0.1em_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-800",
                ghost:
                    "text-black hover:bg-black/5 border-[3px] border-transparent",
                link:
                    "text-black underline-offset-4 hover:underline",
                cyber:
                    "bg-black text-[#fbca1f] border-[3px] border-[#fbca1f] shadow-[0.1em_0.1em_0px_0px_#fbca1f] hover:shadow-[0.15em_0.15em_0px_0px_#fbca1f] hover:-translate-x-[0.05em] hover:-translate-y-[0.05em]",
                premium:
                    "bg-primary text-black border-[3px] border-black shadow-[0.15em_0.15em_0px_0px_rgba(0,0,0,1)] hover:shadow-[0.2em_0.2em_0px_0px_rgba(0,0,0,1)] hover:-translate-x-[0.05em] hover:-translate-y-[0.05em]",
            },
            size: {
                // Optimized for 110% visibility (18px font-size)
                default: "h-auto py-[0.6em] px-[1.3em] text-[18px] rounded-[0.4em]",
                sm: "h-9 px-4 text-[14px] rounded-[0.3em] border-[2px] shadow-[0.08em_0.08em_0px_0px_rgba(0,0,0,1)]",
                lg: "h-16 px-12 text-[22px] rounded-[0.5em] border-[4px]",
                icon: "h-12 w-12 text-[18px]",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }