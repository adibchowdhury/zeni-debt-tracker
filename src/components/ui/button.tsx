import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tactilePrimary =
  "bg-[#FF6A00] text-white shadow-[0_6px_0_#C2410C,0_10px_20px_rgba(0,0,0,0.15)] hover:-translate-y-[2px] hover:bg-[#FF7A1A] hover:shadow-[0_8px_0_#C2410C,0_14px_25px_rgba(0,0,0,0.18)] active:translate-y-[3px] active:shadow-[0_2px_0_#C2410C,0_4px_8px_rgba(0,0,0,0.12)]";

const tactileCta =
  "bg-[#FF6A00] text-white shadow-[0_8px_0_#C2410C,0_16px_30px_rgba(255,106,0,0.25)] hover:-translate-y-[2px] hover:bg-[#FF7A1A] hover:shadow-[0_10px_0_#C2410C,0_18px_34px_rgba(255,106,0,0.28)] active:translate-y-[3px] active:shadow-[0_2px_0_#C2410C,0_6px_14px_rgba(255,106,0,0.2)]";

const tactileOutline =
  "border border-[#FF6A00] bg-white text-[#FF6A00] shadow-[0_4px_0_#E5E7EB,0_8px_15px_rgba(0,0,0,0.08)] hover:bg-[#FFF7ED] hover:-translate-y-[2px] hover:shadow-[0_5px_0_#E5E7EB,0_10px_18px_rgba(0,0,0,0.1)] active:translate-y-[2px] active:shadow-[0_1px_0_#E5E7EB,0_4px_10px_rgba(0,0,0,0.08)]";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 disabled:active:translate-y-0 disabled:hover:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 transition-all duration-150 ease-out",
  {
    variants: {
      variant: {
        default: "bg-[#FF6A00] text-white border-0",
        cta: "bg-[#FF6A00] text-white border-0",
        destructive:
          "rounded-2xl border-0 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:translate-y-[1px] active:shadow-sm",
        outline: "",
        secondary:
          "rounded-2xl border-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost:
          "rounded-md border-0 bg-transparent font-medium text-foreground shadow-none transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
        link: "rounded-none border-0 bg-transparent p-0 font-semibold text-primary underline-offset-4 shadow-none transition-colors duration-150 hover:underline",
      },
      size: {
        default: "h-auto min-h-10 px-6 py-3 text-sm [&_svg]:size-4",
        sm: "h-auto min-h-8 px-3 py-2 text-xs [&_svg]:size-3.5",
        lg: "h-auto min-h-11 px-8 py-3.5 text-base [&_svg]:size-5",
        icon: "h-9 w-9 min-h-9 p-0 [&_svg]:size-4",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        size: "default",
        class: `rounded-2xl ${tactilePrimary} disabled:hover:bg-[#FF6A00] disabled:active:shadow-[0_6px_0_#C2410C,0_10px_20px_rgba(0,0,0,0.15)]`,
      },
      {
        variant: "default",
        size: "lg",
        class: `rounded-2xl ${tactilePrimary} disabled:hover:bg-[#FF6A00] disabled:active:shadow-[0_6px_0_#C2410C,0_10px_20px_rgba(0,0,0,0.15)]`,
      },
      {
        variant: "default",
        size: "sm",
        class:
          "rounded-2xl border-0 bg-[#FF6A00] text-white shadow-sm hover:bg-[#FF7A1A] active:brightness-[0.97]",
      },
      {
        variant: "default",
        size: "icon",
        class:
          "rounded-2xl border-0 bg-[#FF6A00] text-white shadow-sm hover:bg-[#FF7A1A] active:brightness-[0.97]",
      },
      {
        variant: "cta",
        size: "default",
        class: `rounded-2xl px-8 py-4 text-base min-h-[52px] ${tactileCta} [&_svg]:size-5 disabled:hover:bg-[#FF6A00] disabled:active:shadow-[0_8px_0_#C2410C,0_16px_30px_rgba(255,106,0,0.25)]`,
      },
      {
        variant: "cta",
        size: "lg",
        class: `rounded-2xl px-8 py-4 text-base min-h-[52px] ${tactileCta} [&_svg]:size-5 disabled:hover:bg-[#FF6A00] disabled:active:shadow-[0_8px_0_#C2410C,0_16px_30px_rgba(255,106,0,0.25)]`,
      },
      {
        variant: "cta",
        size: "sm",
        class: `rounded-2xl px-8 py-4 text-base min-h-[52px] ${tactileCta} [&_svg]:size-5 disabled:hover:bg-[#FF6A00] disabled:active:shadow-[0_8px_0_#C2410C,0_16px_30px_rgba(255,106,0,0.25)]`,
      },
      {
        variant: "cta",
        size: "icon",
        class: `rounded-2xl px-8 py-4 text-base min-h-[52px] ${tactileCta} [&_svg]:size-5 disabled:hover:bg-[#FF6A00] disabled:active:shadow-[0_8px_0_#C2410C,0_16px_30px_rgba(255,106,0,0.25)]`,
      },
      { variant: "outline", size: "default", class: `rounded-2xl ${tactileOutline}` },
      { variant: "outline", size: "lg", class: `rounded-2xl ${tactileOutline}` },
      {
        variant: "outline",
        size: "sm",
        class:
          "rounded-xl border border-border bg-background font-medium text-foreground shadow-sm hover:bg-secondary active:translate-y-0",
      },
      {
        variant: "outline",
        size: "icon",
        class:
          "rounded-full border border-border bg-background font-medium text-foreground shadow-sm transition-colors duration-150 hover:bg-accent hover:translate-y-0 active:translate-y-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
