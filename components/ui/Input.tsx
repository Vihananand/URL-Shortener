"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  rightElement,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-fg/70 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-muted pointer-events-none">
            {icon}
          </span>
        )}
        <motion.input
          id={inputId}
          whileFocus={{ scale: 1.005 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "w-full bg-card border border-border text-fg placeholder-muted",
            "rounded-xl py-3 outline-none transition-all duration-200",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            icon ? "pl-10 pr-4" : "px-4",
            rightElement ? "pr-32" : "",
            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "",
            className
          )}
          {...(props as React.ComponentPropsWithoutRef<typeof motion.input>)}
        />
        {rightElement && (
          <div className="absolute right-2">{rightElement}</div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
