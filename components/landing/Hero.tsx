"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { generateShortCode } from "@/lib/utils";

export default function Hero() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleShorten = async () => {
    if (!url.trim()) { setError("Please enter a URL first."); return; }
    try { new URL(url.startsWith("http") ? url : `https://${url}`); }
    catch { setError("Please enter a valid URL."); return; }

    setError("");
    setLoading(true);
    // TODO: replace with API call — POST /api/urls { originalUrl: url }
    await new Promise((r) => setTimeout(r, 700));
    const code = generateShortCode();
    setResult(`https://snip.ly/${code}`);
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-20 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob animate-blob absolute top-1/4 left-1/4 w-80 h-80 bg-primary/20" />
        <div className="blob animate-blob animation-delay-2000 absolute top-1/3 right-1/4 w-96 h-96 bg-secondary/15" />
        <div className="blob animate-blob animation-delay-4000 absolute bottom-1/4 left-1/2 w-64 h-64 bg-accent/10" />
        <div className="absolute inset-0 bg-bg/40" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#F8FAFC 1px, transparent 1px), linear-gradient(90deg, #F8FAFC 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/25">
            ✦ Now with real-time analytics
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6"
        >
          Shorten URLs.{" "}
          <span className="gradient-text">Amplify</span>{" "}
          Your Reach.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-base sm:text-lg text-text/60 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Create clean short links, track every click, and share with
          confidence — all from one beautiful dashboard.
        </motion.p>

        {/* URL Input */}
        <motion.div variants={fadeUp} className="w-full max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl p-2 flex gap-2 shadow-2xl shadow-black/30">
            <div className="flex-1 flex items-center gap-3 px-4">
              <svg className="text-muted shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                placeholder="Paste your long URL here..."
                className="flex-1 bg-transparent outline-none text-text placeholder-muted text-sm py-2"
                spellCheck={false}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleShorten}
              disabled={loading}
              className="gradient-bg text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Shorten →"
              )}
            </motion.button>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm mt-2 text-left px-4"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* Result card */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-4 w-full max-w-2xl mx-auto glass-card rounded-2xl p-4 flex items-center gap-4 border border-accent/20 glow-accent"
            >
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs text-muted mb-0.5">Your short link is ready</p>
                <p className="text-sm font-semibold text-accent truncate">{result}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    copied
                      ? "bg-accent/20 text-accent"
                      : "bg-white/5 text-text/70 hover:text-text hover:bg-white/10"
                  }`}
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </motion.button>
                <a
                  href={result}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-text/70 hover:text-text hover:bg-white/10 transition-all"
                >
                  Open ↗
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badges */}
        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-text/40">
          {["10M+ URLs shortened", "500M+ clicks tracked", "Free to start"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#22C55E">
                <polyline points="20 6 9 17 4 12" stroke="#22C55E" strokeWidth="2.5" fill="none" />
              </svg>
              {item}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
