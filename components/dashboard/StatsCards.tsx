"use client";

import { motion } from "motion/react";
import type { DashboardStats } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Link2, MousePointerClick, CheckCircle2, Star } from "lucide-react";

interface StatsCardsProps { stats: DashboardStats; }

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Links",
      value: stats.totalUrls.toString(),
      sub: "All time",
      Icon: Link2,
    },
    {
      label: "Total Clicks",
      value: formatNumber(stats.totalClicks),
      sub: "All time",
      Icon: MousePointerClick,
    },
    {
      label: "Active Links",
      value: stats.activeUrls.toString(),
      sub: `${stats.totalUrls - stats.activeUrls} inactive`,
      Icon: CheckCircle2,
    },
    {
      label: "Top Performer",
      value: stats.topUrl ? formatNumber(stats.topUrl.clicks) + " clicks" : "—",
      sub: stats.topUrl ? `snip.ly/${stats.topUrl.shortCode}` : "No links yet",
      Icon: Star,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.Icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.08 }}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            className="group gradient-border-card p-5 shadow-card cursor-default hover:bg-card2 transition-colors duration-300"
          >
            {/* Top shimmer */}
            <div className="absolute top-0 left-[15%] right-[15%] h-px shimmer-line opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">{card.label}</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-white/30 group-hover:text-white/55 group-hover:bg-white/8 transition-all">
                <Icon size={14} strokeWidth={1.7} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight mb-1">{card.value}</div>
            <div className="text-[11px] text-white/30">{card.sub}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
