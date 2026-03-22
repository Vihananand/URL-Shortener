"use client";

import { motion } from "motion/react";
import { Zap, Tag, QrCode, Code2, Timer, Users } from "lucide-react";

const features = [
  {
    Icon: Zap,
    title: "Real-Time Analytics",
    desc: "Track every click with live stats. See where your audience comes from, instantly.",
  },
  {
    Icon: Tag,
    title: "Custom Short Slugs",
    desc: "Brand your links with memorable custom slugs that reflect your identity.",
  },
  {
    Icon: QrCode,
    title: "QR Code Generator",
    desc: "Auto-generate QR codes for every short link. Perfect for print campaigns.",
  },
  {
    Icon: Code2,
    title: "API Access",
    desc: "Integrate our powerful API into your workflow. SDKs for all major languages.",
  },
  {
    Icon: Timer,
    title: "Link Expiration",
    desc: "Set expiry dates on sensitive links. Auto-deactivate when no longer needed.",
  },
  {
    Icon: Users,
    title: "Team Collaboration",
    desc: "Share link workspaces with your team. Manage permissions in real time.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-[11px] uppercase tracking-widest text-white/30 font-medium mb-4">Everything you need</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] leading-tight mb-4">
            <span className="text-white">Built for </span>
            <span className="text-white/35">modern teams</span>
          </h2>
          <p className="text-white/35 max-w-md mx-auto text-sm leading-relaxed">
            From startups to enterprises, Snip.ly adapts to every workflow with the features that matter most.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {features.map((feat, i) => {
            const Icon = feat.Icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                className="group bg-card p-7 cursor-default transition-colors duration-300 relative overflow-hidden"
              >
                {/* Hover shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px shimmer-line opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="w-9 h-9 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center mb-5 text-white/50 group-hover:text-white/80 group-hover:bg-white/10 group-hover:border-white/15 transition-all duration-300">
                  <Icon size={17} strokeWidth={1.7} />
                </div>
                <h3 className="text-sm font-semibold text-white/80 mb-2 group-hover:text-white transition-colors">{feat.title}</h3>
                <p className="text-xs text-white/35 leading-relaxed group-hover:text-white/50 transition-colors">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
