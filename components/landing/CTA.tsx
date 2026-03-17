"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-card border border-border rounded-3xl p-10 sm:p-16 text-center overflow-hidden"
        >
          {/* Background blobs */}
          <div className="absolute -top-20 -left-20 w-60 h-60 blob bg-primary/20 pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 blob bg-secondary/15 pointer-events-none" />
          {/* Grid */}
          <div
            className="cta-grid absolute inset-0 opacity-[0.03] pointer-events-none"
            
          />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-sm font-medium mb-6"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Free plan available — no card required
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Ready to shorten your first link?
              <br />
              <span className="gradient-text">Start for free today.</span>
            </h2>

            <p className="text-fg/55 text-lg max-w-xl mx-auto mb-10">
              Join 50,000+ marketers, developers, and creators who trust
              Snip.ly to power their links.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 gradient-bg text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-shadow duration-300 text-base"
                >
                  Create Free Account
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-white/5 border border-border text-fg font-medium px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors duration-200 text-base"
                >
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
