"use client";

import { motion, AnimatePresence } from "motion/react";
import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative w-full ${maxWidth} bg-card border border-border rounded-2xl shadow-2xl z-10`}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-fg">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-fg hover:bg-white/5 transition-colors cursor-pointer"
                >.
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
