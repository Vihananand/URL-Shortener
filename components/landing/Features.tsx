"use client";

import { motion } from "motion/react";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Real-Time Analytics",
    desc: "Track every click with live stats. See exactly where your audience comes from.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Custom Short Slugs",
    desc: "Brand your links with memorable custom slugs that reflect your identity.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <rect x="7" y="7" width="3" height="9" />
        <rect x="14" y="7" width="3" height="5" />
      </svg>
    ),
    title: "QR Code Generator",
    desc: "Auto-generate QR codes for every short link. Perfect for print and offline campaigns.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "API Access",
    desc: "Integrate our powerful API into your workflow. SDKs for all major languages.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Link Expiration",
    desc: "Set expiry dates on sensitive links. Auto-deactivate when they're no longer needed.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "Team Collaboration",
    desc: "Share link workspaces with your team. Manage permissions and collaborate in real time.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
            Everything you need
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Features built for{" "}
            <span className="gradient-text">modern teams</span>
          </h2>
          <p className="text-text/55 max-w-lg mx-auto text-base leading-relaxed">
            From startups to enterprises, Snip.ly adapts to every workflow with
            the features that matter most.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-default"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                {feat.icon}
              </div>
              <h3 className="font-semibold text-text mb-2 text-base">{feat.title}</h3>
              <p className="text-sm text-text/55 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
