"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "motion/react";

const stats = [
  { value: 1_200_000, suffix: "+", label: "Links Shortened", prefix: "" },
  { value: 500_000_000, suffix: "+", label: "Total Clicks Tracked", prefix: "" },
  { value: 50_000, suffix: "+", label: "Happy Users", prefix: "" },
  { value: 99.9, suffix: "%", label: "Uptime", prefix: "" },
];

function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (isInView && !started && ref.current) {
      setStarted(true);
      const el = ref.current;
      const controls = animate(0, to, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          el.textContent =
            prefix +
            (decimals > 0
              ? value.toFixed(decimals)
              : Math.round(value).toLocaleString()) +
            suffix;
        },
      });
      return () => controls.stop();
    }
  }, [isInView, started, to, prefix, suffix, decimals]);

  const formattedInitial =
    prefix +
    (decimals > 0 ? (0).toFixed(decimals) : "0") +
    suffix;

  return <span ref={ref}>{formattedInitial}</span>;
}

export default function StatsBar() {
  return (
    <section id="stats" className="py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-2xl shadow-bg/50 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none rounded-3xl" />

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center ${
                  i < stats.length - 1
                    ? "lg:border-r lg:border-border"
                    : ""
                }`}
              >
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2 tabular-nums">
                  <CountUp
                    to={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    decimals={stat.value % 1 !== 0 ? 1 : 0}
                  />
                </div>
                <div className="text-sm text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
