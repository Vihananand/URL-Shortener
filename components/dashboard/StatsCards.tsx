"use client";

import { motion } from "motion/react";
import type { DashboardStats } from "@/types";
import { formatNumber } from "@/lib/utils";

const icons = {
  links: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  ),
  clicks: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  active: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  top: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Links",
      value: stats.totalUrls.toString(),
      sub: "All time",
      icon: icons.links,
      color: "text-primary",
      bg: "bg-primary/10",
      borderColor: "#6366F1",
    },
    {
      label: "Total Clicks",
      value: formatNumber(stats.totalClicks),
      sub: "All time",
      icon: icons.clicks,
      color: "text-secondary",
      bg: "bg-secondary/10",
      borderColor: "#8B5CF6",
    },
    {
      label: "Active Links",
      value: stats.activeUrls.toString(),
      sub: `${stats.totalUrls - stats.activeUrls} inactive`,
      icon: icons.active,
      color: "text-accent",
      bg: "bg-accent/10",
      borderColor: "#22C55E",
    },
    {
      label: "Top Performer",
      value: stats.topUrl ? formatNumber(stats.topUrl.clicks) + " clicks" : "—",
      sub: stats.topUrl ? `snip.ly/${stats.topUrl.shortCode}` : "No links yet",
      icon: icons.top,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      borderColor: "#FACC15",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.08 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300"
          style={{ borderLeftWidth: "3px", borderLeftColor: card.borderColor }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              {card.label}
            </span>
            <div className={`w-9 h-9 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
          <div className={`text-2xl font-bold ${card.color} mb-1`}>{card.value}</div>
          <div className="text-xs text-muted">{card.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}
