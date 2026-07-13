"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link2, ArrowRight, Copy, Check, ExternalLink } from "lucide-react";
import { generateShortCode } from "@/lib/utils";
import { APP_URL } from "@/lib/site";
export default function Hero() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const handleShorten = async () => {
    if (!url.trim()) { setError("Please enter a URL."); return; }
    try { new URL(url.startsWith("http") ? url : `https://${url}`); }
    catch { setError("Please enter a valid URL."); return; }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 750));
    setResult(`${APP_URL}/${generateShortCode()}`);
    setLoading(false);
  };
  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
  const up = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } } };
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 pt-24 pb-20 overflow-hidden">
      {}
      <div className="absolute inset-0 dot-bg pointer-events-none" />
      {}
      <div className="absolute inset-0 pointer-events-none gradient-overlay-top" />
      <div className="absolute inset-0 pointer-events-none gradient-overlay-bottom" />
      {}
      <div className="blob animate-blob absolute top-1/4 left-1/4 w-125 h-125 bg-white/2.5 pointer-events-none" />
      <div className="blob animate-blob animation-delay-2000 absolute bottom-1/3 right-1/4 w-100 h-100 bg-white/[0.018] pointer-events-none" />
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-2xl mx-auto text-center"
      >
        {}
        <motion.h1
          variants={up}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.06] mb-5"
        >
          <span className="text-gradient-bright">Shorten links.</span>
          <br />
          <span className="text-white/30">Amplify reach.</span>
        </motion.h1>
        {}
        <motion.p variants={up} className="text-base text-white/40 max-w-md mx-auto mb-10 leading-relaxed">
          Create clean short links, track every click, and share with confidence — all from one beautiful dashboard.
        </motion.p>
        {}
        <motion.div variants={up} className="w-full max-w-xl mx-auto">
          <div className="gradient-border-card p-1.5 flex flex-col sm:flex-row gap-3 sm:gap-2 shadow-card">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Link2 size={15} className="text-white/30 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                placeholder="Paste your long URL here..."
                className="flex-1 bg-transparent outline-none text-white placeholder-white/25 text-sm py-2.5 w-full"
                spellCheck={false}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleShorten}
              disabled={loading}
              className="btn-primary text-sm px-5 py-3 sm:py-2.5 flex items-center justify-center sm:justify-start gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-full sm:w-auto"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />
              ) : (
                <><span>Shorten</span><ArrowRight size={13} /></>
              )}
            </motion.button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-xs text-white/40 text-left px-2 flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-white/40 inline-block shrink-0" />
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
        {}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.38, ease: "easeOut" }}
              className="mt-3 w-full max-w-xl mx-auto gradient-border-card p-4 flex items-center gap-3 shadow-card"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.1 }}
                className="hidden sm:flex w-8 h-8 rounded-lg bg-white/8 items-center justify-center shrink-0"
              >
                <Check size={14} className="text-white/80" strokeWidth={2.5} />
              </motion.div>
              <div className="flex-1 text-center sm:text-left min-w-0 w-full sm:w-auto">
                <p className="text-[10px] text-white/30 mb-0.5 uppercase tracking-wider hidden sm:block">Your short link</p>
                <p className="text-sm font-medium text-white truncate break-all">{result}</p>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 shrink-0 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all ${
                    copied ? "bg-white/12 text-white" : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? "Copied" : "Copy"}
                </motion.button>
                <motion.a
                  href={result} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                >
                  <ExternalLink size={11} /> Open
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {}
        <motion.div variants={up} className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/25">
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-white/25 inline-block" />
            Free to use
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
