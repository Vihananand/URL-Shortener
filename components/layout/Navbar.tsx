"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled || isDashboard
          ? "bg-bg/85 backdrop-blur-xl border-b border-border shadow-lg shadow-bg/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </motion.div>
          <span className="text-lg font-bold gradient-text">Snip.ly</span>
        </Link>

        {/* Desktop nav */}
        {!isDashboard && (
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm text-fg/60 hover:text-fg rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {isDashboard && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm text-fg/60 hover:text-fg rounded-lg hover:bg-white/5 transition-all duration-200"
            >
              Dashboard
            </Link>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          {!isDashboard ? (
            <>
              <Link
                href="/auth/signin"
                className="hidden md:block text-sm text-fg/70 hover:text-fg transition-colors duration-200 px-3 py-2"
              >
                Sign in
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/auth/signup"
                  className="gradient-bg text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow duration-200"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/"
                className="text-sm text-fg/70 hover:text-fg transition-colors duration-200 px-3 py-2"
              >
                ← Home
              </Link>
            </motion.div>
          )}

          {/* Mobile hamburger */}
          {!isDashboard && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-fg/70 cursor-pointer"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.svg
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-5 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-sm text-fg/70 hover:text-fg hover:bg-white/5 rounded-xl transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-3 mt-2 border-t border-border flex flex-col gap-2">
                <Link
                  href="/auth/signin"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm text-fg/70 hover:text-fg hover:bg-white/5 rounded-xl transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 text-sm text-center gradient-bg text-white font-medium rounded-xl"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
