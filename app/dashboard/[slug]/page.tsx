"use client";

import { useState, useEffect } from "react";
import type { ShortenedUrl } from "@/types";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import UrlTable from "@/components/dashboard/UrlTable";
import { motion, AnimatePresence } from "motion/react";
import StatsCards from "@/components/dashboard/StatsCards";
import CreateUrlModal from "@/components/dashboard/CreateUrlModal";
import { showToast } from "@/components/ui/Toast";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();

  const stats = {
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, u) => sum + u.clicks, 0),
    activeUrls: urls.filter((u) => u.isActive).length,
    topUrl: urls.length > 0
      ? [...urls].sort((a, b) => b.clicks - a.clicks)[0]
      : null,
  };

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const res = await fetch("/api/urls", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/auth/signin");
            return;
          }
          throw new Error("Failed to fetch URLs");
        }

        const data = await res.json();
        setUrls(data.urls || []);
      } catch (err) {
        console.error("Error fetching URLs:", err);
        showToast.error("Failed to load your links", {
          duration: 4000,
          position: "top-center",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, [router]);

  const handleCreated = (newUrl: ShortenedUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
    showToast.success("Link created successfully", {
      duration: 3000,
      position: "top-center",
    });
  };

  const handleDelete = (id: string) => {
    setUrls((prev) => prev.filter((u) => u.id !== id));
    showToast.success("Link deleted", {
      duration: 3000,
      position: "top-center",
    });
  };

  const handleToggleActive = (id: string) => {
    setUrls((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)),
    );
  };


  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
      });

      if (res.ok) {
        showToast.success("Logged out successfully");
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      }
    } catch (err) {
      console.error("Logout error:", err);
      showToast.error("Failed to logout");
    }
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
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              Hello {params.slug?.toString().split("%20")[0]}
            </h1>
            <p className="text-sm text-muted mt-1">
              Manage and track all your short links in one place.
            </p>
          </div>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-2 gradient-bg text-black px-5 py-2.5 rounded-xl text-sm sm:text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New Link
            </motion.button>
          </div>
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
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6366F1"
                    strokeWidth="1.5"
                  >
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">
                  No links yet
                </h3>
                <p className="text-sm text-muted mb-6">
                  Create your first short link to get started.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 gradient-bg text-black px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-primary/25 cursor-pointer"
                >
                  Create your first link →
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
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


      {/* Bottom Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
        <div className="flex flex-col sm:flex-row gap-3 border-t border-white/5 pt-8 mt-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-card border border-border text-text hover:bg-white/5 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <LogOut size={16} />
            Logout
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard/settings")}
            className="flex items-center justify-center gap-2 bg-card border border-border text-text hover:bg-white/5 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-colors cursor-pointer w-full sm:w-auto"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Settings
          </motion.button>
        </div>
      </div>
    </div>
  );
}
