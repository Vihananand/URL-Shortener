"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, Users, Globe } from "lucide-react";

interface AnalyticsData {
  shortCode: string;
  summary: {
    totalClicks: number;
    uniqueVisitors: number;
    daysWithClicks: number;
    lastClicked: string;
    firstClicked: string;
  };
  deviceBreakdown: Array<{
    deviceType: string;
    count: number;
  }>;
  topReferrers: Array<{
    referrer: string;
    count: number;
  }>;
  hourlyClicks: Array<{
    hour: string;
    count: number;
  }>;
  recentClicks: Array<{
    id: number;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    referrer: string;
    deviceType: string;
  }>;
}

interface AnalyticsViewProps {
  urlId: string;
  onClose: () => void;
}

export default function AnalyticsView({ urlId, onClose }: AnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/urls/${urlId}/analytics`);

        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [urlId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
        >
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/60">Loading analytics...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-2xl w-full max-w-4xl p-8 text-center"
        >
          <p className="text-red-400 mb-4">{error || "Failed to load analytics"}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 cursor-pointer"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  const DEVICE_COLORS = {
    Desktop: "#6366F1",
    Mobile: "#EC4899",
    Tablet: "#F59E0B",
  };

  const REFERRER_COLORS = [
    "#6366F1",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#06B6D4",
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statCards = [
    {
      icon: <TrendingUp size={20} className="text-primary" />,
      label: "Total Clicks",
      value: analytics.summary.totalClicks.toLocaleString(),
      bg: "bg-primary/10",
    },
    {
      icon: <Users size={20} className="text-pink-500" />,
      label: "Unique Visitors",
      value: analytics.summary.uniqueVisitors.toLocaleString(),
      bg: "bg-pink-500/10",
    },
    {
      icon: <Calendar size={20} className="text-amber-500" />,
      label: "Days Active",
      value: analytics.summary.daysWithClicks.toString(),
      bg: "bg-amber-500/10",
    },
    {
      icon: <Globe size={20} className="text-cyan-500" />,
      label: "Short Code",
      value: analytics.shortCode,
      bg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics</h2>
            <p className="text-sm text-white/50 mt-1">snip.ly/{analytics.shortCode}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors cursor-pointer text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className={`${card.bg} border border-border rounded-xl p-4 backdrop-blur`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {card.icon}
                  <p className="text-xs text-white/60 font-medium">{card.label}</p>
                </div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Clicks Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-border rounded-xl p-4 bg-card2"
            >
              <h3 className="text-white font-semibold mb-4">Clicks (Last 24h)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.hourlyClicks}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="hour"
                    stroke="rgba(255,255,255,0.3)"
                    tickFormatter={(d) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit" })}
                  />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#6366F1"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Device Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="border border-border rounded-xl p-4 bg-card2"
            >
              <h3 className="text-white font-semibold mb-4">Device Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.deviceType}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.deviceBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DEVICE_COLORS[entry.deviceType as keyof typeof DEVICE_COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Top Referrers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border border-border rounded-xl p-4 bg-card2"
          >
            <h3 className="text-white font-semibold mb-4">Top Referrers</h3>
            {analytics.topReferrers.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topReferrers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="referrer"
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="rgba(255,255,255,0.3)" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0,0,0,0.8)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-white/40 py-8">No referrer data available</p>
            )}
          </motion.div>

          {/* Recent Clicks Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="border border-border rounded-xl p-4 bg-card2 overflow-x-auto"
          >
            <h3 className="text-white font-semibold mb-4">Recent Clicks</h3>
            <table className="w-full text-sm text-white/70">
              <thead>
                <tr className="border-b border-border text-white/50 text-xs">
                  <th className="text-left py-3 px-3">Time</th>
                  <th className="text-left py-3 px-3">Device</th>
                  <th className="text-left py-3 px-3">IP Address</th>
                  <th className="text-left py-3 px-3">Referrer</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentClicks.slice(0, 10).map((click) => (
                  <tr key={click.id} className="border-b border-border/50 hover:bg-white/5">
                    <td className="py-2 px-3 text-xs">
                      {formatDate(click.timestamp)}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                        {click.deviceType}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-xs text-white/50">
                      {click.ipAddress}
                    </td>
                    <td className="py-2 px-3 text-xs truncate max-w-xs">
                      {click.referrer ? (
                        <a
                          href={click.referrer}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {click.referrer}
                        </a>
                      ) : (
                        <span className="text-white/30">Direct</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-3 pt-4 border-t border-border"
          >
            <button
              onClick={onClose}
              className="px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
