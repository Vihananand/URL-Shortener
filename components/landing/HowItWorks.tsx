"use client";

import { motion } from "motion/react";
import { Link2, Pen, BarChart2 } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Paste your long URL",
    desc: "Drop any URL into the input. Blog posts, product pages, social profiles — any link works.",
    Icon: Link2,
  },
  {
    num: "02",
    title: "Customize your slug",
    desc: "Pick a memorable name or let us generate a clean, random short code automatically.",
    Icon: Pen,
  },
  {
    num: "03",
    title: "Share and track",
    desc: "Share your snip link anywhere. Watch clicks roll in from your real‑time analytics dashboard.",
    Icon: BarChart2,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-[11px] uppercase tracking-widest text-white/30 font-medium mb-4">Simple process</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-4">
            <span className="text-white">How it </span>
            <span className="text-white/30">works</span>
          </h2>
          <p className="text-white/35 max-w-sm mx-auto text-sm leading-relaxed">
            From paste to publish in seconds. No account required to try it.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="flex flex-col gap-4">
          {steps.map((step, i) => {
            const Icon = step.Icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.12 }}
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
                className="group gradient-border-card p-5 sm:p-6 flex items-start gap-5 cursor-default shadow-card hover:border-white/15"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 text-white/40 group-hover:text-white/70 group-hover:bg-white/8 group-hover:border-white/15 transition-all duration-300">
                  <Icon size={19} strokeWidth={1.7} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[10px] font-mono text-white/20 tracking-widest">{step.num}</span>
                    <h3 className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{step.title}</h3>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed group-hover:text-white/50 transition-colors">{step.desc}</p>
                </div>

                {/* Arrow */}
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-white/15 group-hover:text-white/35 transition-colors shrink-0 self-center"
                >
                  →
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
