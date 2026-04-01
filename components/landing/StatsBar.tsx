"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate, motion } from "motion/react";
import { Link2, MousePointerClick, Users, TrendingUp } from "lucide-react";

interface PublicStats {
  totalUrls: number;
  totalClicks: number;
  totalUsers: number;
  activeUrls: number;
}

function CountUp({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const startedRef = useRef(false);

  useEffect(() => {
    if (isInView && !startedRef.current && ref.current) {
      startedRef.current = true;
      const el = ref.current;
      const controls = animate(0, to, {
        duration: 2.2, ease: "easeOut",
        onUpdate: (v) => {
          el.textContent = (decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()) + suffix;
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to, suffix, decimals]);

  return <span ref={ref}>{decimals > 0 ? (0).toFixed(decimals) : "0"}{suffix}</span>;
}

export default function StatsBar() {
  const [data, setData] = useState<PublicStats>({
    totalUrls: 0,
    totalClicks: 0,
    totalUsers: 0,
    activeUrls: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/public-stats", { cache: "no-store" });
        if (!res.ok) return;
        const stats = await res.json();
        setData({
          totalUrls: Number(stats.totalUrls) || 0,
          totalClicks: Number(stats.totalClicks) || 0,
          totalUsers: Number(stats.totalUsers) || 0,
          activeUrls: Number(stats.activeUrls) || 0,
        });
      } catch (err) {
        console.error("Failed to load public stats:", err);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { value: data.totalUrls, suffix: "+", label: "Links Shortened", Icon: Link2 },
    { value: data.totalClicks, suffix: "+", label: "Clicks Tracked", Icon: MousePointerClick },
    { value: data.totalUsers, suffix: "+", label: "Happy Users", Icon: Users },
    { value: data.activeUrls, suffix: "+", label: "Active Links", Icon: TrendingUp },
  ];

  return (
    <section id="stats" className="py-20 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="gradient-border-card p-0 overflow-hidden shadow-card">
          {/* Top bar */}
          <div className="h-px bg-linear-to-r from-transparent via-white/12 to-transparent" />

          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
            {stats.map((stat, i) => {
              const Icon = stat.Icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08 }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.025)" }}
                  className="group flex flex-col items-center justify-center gap-2 py-10 px-6 text-center cursor-default transition-colors duration-300"
                >
                  <Icon size={16} className="text-white/20 group-hover:text-white/40 transition-colors" strokeWidth={1.5} />
                  <div className="text-3xl sm:text-4xl font-bold tracking-[-0.04em] text-white tabular-nums">
                    <CountUp to={stat.value} suffix={stat.suffix} decimals={stat.value % 1 !== 0 ? 1 : 0} />
                  </div>
                  <div className="text-xs text-white/30 group-hover:text-white/50 transition-colors">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
