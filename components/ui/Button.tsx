"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import React from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "gradient-bg text-white shadow-lg shadow-primary/20 hover:shadow-primary/40",
  secondary:
    "bg-secondary text-white shadow-lg shadow-secondary/20 hover:shadow-secondary/40",
  outline:
    "border border-primary text-primary hover:bg-primary/10",
  ghost:
    "text-fg/70 hover:text-fg hover:bg-white/5",
  accent:
    "bg-accent text-bg font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/40",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
}
