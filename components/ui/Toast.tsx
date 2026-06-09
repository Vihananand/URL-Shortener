"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastListener: ((toast: Toast) => void) | null = null;

export const showToast = {
  success: (message: string, options?: any) => {
    if (toastListener) {
      toastListener({ id: Math.random().toString(36).substring(2, 9), message, type: "success" });
    }
  },
  error: (message: string, options?: any) => {
    if (toastListener) {
      toastListener({ id: Math.random().toString(36).substring(2, 9), message, type: "error" });
    }
  }
};

export const ToastProvider = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    return () => {
      toastListener = null;
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ 
              opacity: 0, 
              y: -20, 
              clipPath: "inset(0 50% 0 50% round 16px)" 
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              clipPath: "inset(0 0% 0 0% round 16px)" 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9, 
              transition: { duration: 0.2 } 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            className="bg-white px-5 py-3.5 shadow-xl flex items-center gap-3 origin-center pointer-events-auto min-w-[240px]"
            style={{ borderRadius: "16px" }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 20 }}
              className="shrink-0"
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </motion.div>

            <motion.div
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
              className="text-[15px] font-medium text-black whitespace-nowrap overflow-hidden"
            >
              {toast.message}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
