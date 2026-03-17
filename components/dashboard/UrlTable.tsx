"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { ShortenedUrl } from "@/types";
import { timeAgo, truncateUrl, formatNumber } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import CopyButton from "@/components/ui/CopyButton";

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
    .filter(
      (u) =>
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
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 300);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links..."
            className="w-full bg-card border border-border text-text placeholder-muted rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-card border border-border text-text rounded-xl py-2.5 px-4 text-sm outline-none focus:border-primary cursor-pointer transition-all"
        >
          <option value="newest">Newest first</option>
          <option value="clicks">Most clicks</option>
          <option value="alpha">A–Z</option>
        </select>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-muted"
        >
          <svg className="mx-auto mb-3 text-border" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
          </svg>
          <p className="text-sm">No links found</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((url, i) => (
              <motion.div
                key={url.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={
                  deletingId === url.id
                    ? { opacity: 0, scale: 0.92, y: -10 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={{ opacity: 0, scale: 0.92, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.04 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="group bg-card rounded-2xl border border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
              >
                {/* Card header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-primary truncate">
                          snip.ly/{url.shortCode}
                        </span>
                        <CopyButton text={url.shortUrl} />
                      </div>
                      <p
                        className="text-xs text-muted truncate"
                        title={url.originalUrl}
                      >
                        {truncateUrl(url.originalUrl, 50)}
                      </p>
                    </div>
                    <Badge variant={url.isActive ? "active" : "inactive"}>
                      {url.isActive ? "Active" : "Off"}
                    </Badge>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <span className="font-semibold text-text/70">{formatNumber(url.clicks)}</span> clicks
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {timeAgo(url.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border mx-5" />

                {/* Actions */}
                <div className="flex items-center justify-between px-5 py-3">
                  <a
                    href={url.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted hover:text-primary flex items-center gap-1 transition-colors"
                  >
                    Open link
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggleActive(url.id)}
                      title={url.isActive ? "Deactivate" : "Activate"}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {url.isActive ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
                          <circle cx="16" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
                          <circle cx="8" cy="12" r="3" />
                        </svg>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(url.id)}
                      title="Delete"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
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
