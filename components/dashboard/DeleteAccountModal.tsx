"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const confirmationRequired = "DELETE MY ACCOUNT";

  const handleConfirm = async () => {
    if (confirmText !== confirmationRequired) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        showToast.error("Failed to delete account", {
          duration: 4000,
          position: "top-center",
        });
        setIsLoading(false);
        return;
      }

      showToast.success("Account deleted successfully", {
        duration: 3000,
        position: "top-center",
      });

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error("Error deleting account:", err);
      showToast.error("An error occurred while deleting your account", {
        duration: 4000,
        position: "top-center",
      });
      setIsLoading(false);
    }
  };

  const isConfirmed = confirmText === confirmationRequired;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-0"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-linear-to-r from-red-500/10 to-red-600/10 border-b border-border px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-red-500"
                    >
                      <path d="M12 9v2m0 4v2m9-13H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-text">
                    Delete Account
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-muted">
                    <span className="font-semibold text-red-500">Warning:</span>{" "}
                    This action cannot be undone.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-sm text-text">
                    Deleting your account will:
                  </p>
                  <ul className="space-y-2 text-sm text-muted">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Permanently delete all your short links</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Remove all analytics and click data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>Close your account permanently</span>
                    </li>
                  </ul>
                </div>

                {/* Confirmation Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text mb-2">
                    Type{" "}
                    <span className="font-mono text-red-500">
                      {confirmationRequired}
                    </span>{" "}
                    to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Enter confirmation text"
                    className="w-full px-4 py-2.5 bg-bg border border-border rounded-lg text-text placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2.5 bg-bg border border-border text-text rounded-lg font-medium hover:bg-bg/80 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={
                      isConfirmed && !isLoading ? { scale: 1.02 } : {}
                    }
                    whileTap={isConfirmed && !isLoading ? { scale: 0.98 } : {}}
                    onClick={handleConfirm}
                    disabled={!isConfirmed || isLoading}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white cursor-pointer rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            opacity="0.25"
                          />
                          <path
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        Delete Account
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
