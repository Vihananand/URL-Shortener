"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ShortenedUrl } from "@/types";
import { timeAgo, truncateUrl, formatNumber } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import CopyButton from "@/components/ui/CopyButton";
import { MousePointerClick, Clock, ExternalLink, ToggleRight, ToggleLeft, Trash2, Link2 } from "lucide-react";

interface UrlTableProps {
  urls: ShortenedUrl[];
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export default function UrlTable({ urls, onDelete, onToggleActive }: UrlTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "clicks" | "alpha">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = urls
    .filter((u) =>
      u.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
      u.shortCode.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "clicks") return b.clicks - a.clicks;
      if (sortBy === "alpha") return a.shortCode.localeCompare(b.shortCode);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => { onDelete(id); setDeletingId(null); }, 280);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links..."
            className="w-full bg-card2 border border-border text-white/80 placeholder-white/20 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-border2 transition-all"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-card2 border border-border text-white/60 rounded-xl py-2.5 px-4 text-sm outline-none cursor-pointer transition-all"
        >
          <option value="newest">Newest first</option>
          <option value="clicks">Most clicks</option>
          <option value="alpha">A–Z</option>
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/4 border border-border flex items-center justify-center">
            <Link2 size={22} className="text-white/20" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-white/30 font-medium">No links found</p>
          <p className="text-xs text-white/20 mt-1">Create a new link to get started</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((url, i) => (
              <motion.div
                key={url.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={deletingId === url.id ? { opacity: 0, scale: 0.93, y: -10 } : { opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.93, y: -10 }}
                transition={{ duration: 0.28, ease: "easeOut", delay: i * 0.03 }}
                whileHover={{ y: -2, transition: { duration: 0.18 } }}
                className="group gradient-border-card shadow-card hover:bg-card2 transition-colors duration-300 overflow-hidden"
              >
                {/* Hover shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px shimmer-line opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-sm font-semibold text-white/85 truncate">snip.ly/{url.shortCode}</span>
                        <CopyButton text={url.shortUrl} />
                      </div>
                      <p className="text-[11px] text-white/30 truncate" title={url.originalUrl}>
                        {truncateUrl(url.originalUrl, 50)}
                      </p>
                    </div>
                    <Badge variant={url.isActive ? "active" : "inactive"}>
                      {url.isActive ? "Active" : "Off"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-white/25">
                    <span className="flex items-center gap-1.5">
                      <MousePointerClick size={10} />
                      <span className="font-medium text-white/45">{formatNumber(url.clicks)}</span> clicks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={10} />
                      {timeAgo(url.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-border mx-4" />

                <div className="flex items-center justify-between px-4 py-2.5">
                  <a href={url.shortUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-white/30 hover:text-white/65 flex items-center gap-1.5 transition-colors">
                    <ExternalLink size={10} /> Open link
                  </a>
                  <div className="flex items-center gap-0.5">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => onToggleActive(url.id)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                        url.isActive ? "text-white/50 hover:text-white/80 hover:bg-white/6" : "text-white/25 hover:text-white/50 hover:bg-white/5"
                      }`}
                    >
                      {url.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(url.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer">
                      <Trash2 size={12} strokeWidth={1.8} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
