"use client";

import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    title: "Paste your long URL",
    desc: "Drop any URL into the input — blog posts, product pages, social profiles. Any link works.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Customize your slug",
    desc: "Optionally pick a memorable name. Otherwise we'll generate a clean, random short code for you.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Share and track",
    desc: "Share your snip link anywhere. Watch clicks roll in from your real-time analytics dashboard.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">
            Simple process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-text/55 max-w-lg mx-auto text-base leading-relaxed">
            From paste to publish in seconds. No account required to try it.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full origin-left"
              style={{
                background:
                  "linear-gradient(90deg, #6366F1 0%, #8B5CF6 50%, #22C55E 100%)",
                opacity: 0.3,
              }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.15 }}
              className="relative flex flex-col items-center text-center p-6"
            >
              {/* Circle */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 + i * 0.15 }}
                className="relative w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-xl shadow-primary/25 glow-primary"
              >
                <div className="text-white">{step.icon}</div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border border-border text-xs font-bold text-primary flex items-center justify-center">
                  {i + 1}
                </span>
              </motion.div>

              <h3 className="text-lg font-semibold text-text mb-3">{step.title}</h3>
              <p className="text-sm text-text/55 leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
