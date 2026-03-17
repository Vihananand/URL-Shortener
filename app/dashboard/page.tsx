"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "@/components/layout/Navbar";
import StatsCards from "@/components/dashboard/StatsCards";
import UrlTable from "@/components/dashboard/UrlTable";
import CreateUrlModal from "@/components/dashboard/CreateUrlModal";
import { mockUrls, getMockStats } from "@/lib/mockData";
import type { ShortenedUrl } from "@/types";

export default function DashboardPage() {
  const [urls, setUrls] = useState<ShortenedUrl[]>(mockUrls);
  const [modalOpen, setModalOpen] = useState(false);

  const stats = getMockStats(urls);

  const handleCreated = (newUrl: ShortenedUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  const handleDelete = (id: string) => {
    setUrls((prev) => prev.filter((u) => u.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setUrls((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">Dashboard</h1>
            <p className="text-sm text-muted mt-1">
              Manage and track all your short links in one place.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 gradient-bg text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Link
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <StatsCards stats={stats} />
        </motion.div>

        {/* Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-text">Your Links</h2>
            <span className="text-sm text-muted">{urls.length} total</span>
          </div>

          <AnimatePresence mode="wait">
            {urls.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-card border border-border rounded-2xl p-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">No links yet</h3>
                <p className="text-sm text-muted mb-6">Create your first short link to get started.</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 gradient-bg text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-primary/25 cursor-pointer"
                >
                  Create your first link →
                </button>
              </motion.div>
            ) : (
              <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <UrlTable
                  urls={urls}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <CreateUrlModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
