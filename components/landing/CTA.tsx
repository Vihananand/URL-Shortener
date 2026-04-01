"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative gradient-border-card p-10 sm:p-16 text-center overflow-hidden shadow-card"
        >
          {/* Dot grid inside card */}
          <div className="absolute inset-0 dot-bg rounded-2xl opacity-60" />
          {/* Vignette */}
          <div className="absolute inset-0 rounded-2xl" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 100%, #0f0f0f 0%, transparent 100%)" }} />
          {/* Top shine */}
          <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-[11px] uppercase tracking-widest text-white/30 font-medium mb-5"
            >
              Free plan available — no card required
            </motion.p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] leading-tight mb-5">
              <span className="text-white">Ready to shorten your first link?</span>
              <br />
              <span className="text-white/30">Start for free today.</span>
            </h2>

            <p className="text-white/35 text-sm max-w-md mx-auto mb-10 leading-relaxed">
              Join 50,000+ marketers, developers, and creators who trust Slicly to power their links.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                <Link href="/auth/signup" className="btn-primary px-7 py-3 text-sm flex items-center gap-2 glow-white-sm">
                  Create Free Account <ArrowRight size={14} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
                <Link href="/dashboard" className="btn-ghost px-7 py-3 text-sm">
                  View Dashboard Demo
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
