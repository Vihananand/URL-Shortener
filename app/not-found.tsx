"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 blob bg-primary/10 animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 blob bg-secondary/10 animate-blob animation-delay-2000 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        {/* 404 Number */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="text-[120px] sm:text-[180px] font-black gradient-text leading-none mb-4 select-none"
        >
          404
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-text mb-3"
        >
          This link doesn&apos;t exist
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-text/55 text-base max-w-sm mx-auto mb-10 leading-relaxed"
        >
          The page you&apos;re looking for has been moved, deleted, or the URL
          was mistyped.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 gradient-bg text-white font-semibold px-7 py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-card border border-border text-text font-medium px-7 py-3 rounded-xl hover:border-primary/40 transition-colors"
            >
              Open Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
