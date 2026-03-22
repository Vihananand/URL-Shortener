"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export default function Input({ label, error, icon, rightElement, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-white/45 mb-2 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-white/25 pointer-events-none">{icon}</span>
        )}
        <input
          id={inputId}
          className={cn(
            "w-full bg-card2 border border-border text-white/85 placeholder-white/20",
            "rounded-xl py-2.5 text-sm outline-none transition-all duration-200",
            "focus:border-border2 focus:ring-1 focus:ring-white/10",
            icon ? "pl-10 pr-4" : "px-4",
            rightElement ? "pr-28" : "",
            error ? "border-white/20 focus:border-white/30" : "",
            className
          )}
          {...props}
        />
        {rightElement && <div className="absolute right-2">{rightElement}</div>}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-white/40">{error}</p>
      )}
    </div>
  );
}
