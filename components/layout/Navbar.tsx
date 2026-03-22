"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Link2, X, Menu, ArrowRight } from "lucide-react";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#stats", label: "Stats" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || isDashboard
          ? "bg-bg/85 backdrop-blur-2xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="w-7 h-7 bg-white rounded-lg flex items-center justify-center"
          >
            <Link2 size={14} className="text-black" strokeWidth={2.5} />
          </motion.div>
          <span className="text-[15px] font-semibold tracking-tight text-white">Snip.ly</span>
        </Link>

        {/* Desktop links */}
        {!isDashboard && (
          <div className="hidden md:flex items-center gap-0.5 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-1.5 text-white/45 hover:text-white/90 rounded-lg hover:bg-white/5 transition-all duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {isDashboard && (
          <Link href="/dashboard" className="text-sm text-white/50 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
            Dashboard
          </Link>
        )}

        {/* CTA */}
        <div className="flex items-center gap-2">
          {!isDashboard ? (
            <>
              <Link href="/auth/signin" className="hidden md:block text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5">
                Sign in
              </Link>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/auth/signup"
                  className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
                >
                  Get Started <ArrowRight size={13} />
                </Link>
              </motion.div>
            </>
          ) : (
            <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors px-3 py-1.5">
              ← Home
            </Link>
          )}

          {!isDashboard && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/6 transition-all border border-border cursor-pointer"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.12 }}>
                    <X size={15} />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.12 }}>
                    <Menu size={15} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-5 flex flex-col gap-0.5">
              {navLinks.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link href={link.href} onClick={() => setMobileOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                    {link.label}
                    <ArrowRight size={13} className="text-white/25" />
                  </Link>
                </motion.div>
              ))}
              <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
                <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">Sign in</Link>
                <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center py-2.5 px-3">Get Started Free</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
