"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { ShortenedUrl } from "@/types";
import { APP_DOMAIN } from "@/lib/site";
import { ChevronDown, ShieldCheck, Clock, MousePointer2, Settings2, ShieldAlert } from "lucide-react";

interface CreateUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (url: ShortenedUrl) => void;
}

export default function CreateUrlModal({ isOpen, onClose, onCreated }: CreateUrlModalProps) {
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [deleteAfter24h, setDeleteAfter24h] = useState(false);
  const [customExpiryDate, setCustomExpiryDate] = useState("");
  const [maxClicks, setMaxClicks] = useState("");
  const [securedRedirect, setSecuredRedirect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ longUrl?: string; customSlug?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!longUrl.trim()) {
      errs.longUrl = "URL is required.";
    } else {
      try { new URL(longUrl.startsWith("http") ? longUrl : `https://${longUrl}`); }
      catch { errs.longUrl = "Please enter a valid URL."; }
    }
    if (customSlug && !/^[a-zA-Z0-9_-]+$/.test(customSlug)) {
      errs.customSlug = "Only letters, numbers, hyphens and underscores allowed.";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    try {
      const normalised = longUrl.startsWith("http") ? longUrl : `https://${longUrl}`;
      const res = await fetch("/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: normalised,
          customSlug: customSlug || undefined,
          deleteAfter24h,
          customExpiryDate: customExpiryDate || undefined,
          maxClicks: maxClicks ? parseInt(maxClicks) : undefined,
          securedRedirect,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ longUrl: data.message || "Failed to create URL" });
        setLoading(false);
        return;
      }

      onCreated(data.url);
      setLongUrl("");
      setCustomSlug("");
      setDeleteAfter24h(false);
      setCustomExpiryDate("");
      setMaxClicks("");
      setSecuredRedirect(true);
      setShowAdvanced(false);
      onClose();
    } catch (err) {
      setErrors({ longUrl: "An error occurred while creating the URL" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Destination URL"
          placeholder="https://your-long-url.com/..."
          value={longUrl}
          onChange={(e) => { setLongUrl(e.target.value); setErrors((p) => ({ ...p, longUrl: undefined })); }}
          error={errors.longUrl}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          }
          autoFocus
        />

        <div>
          <Input
            label="Custom slug (optional)"
            placeholder="e.g. my-brand-link"
            value={customSlug}
            onChange={(e) => { setCustomSlug(e.target.value); setErrors((p) => ({ ...p, customSlug: undefined })); }}
            error={errors.customSlug}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            }
          />
          {customSlug && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 text-xs text-muted"
            >
              Preview: <span className="text-primary font-medium">{APP_DOMAIN}/{customSlug}</span>
            </motion.p>
          )}
        </div>

        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <Settings2 size={16} />
            Advanced Options
            <motion.div animate={{ rotate: showAdvanced ? 180 : 0 }}>
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 flex flex-col gap-4 border-t border-white/5 mt-4">
                  {/* Security Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-md">
                        <ShieldCheck size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Secured Redirect</p>
                        <p className="text-xs text-white/50">Checks link for malicious activity</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securedRedirect}
                        onChange={(e) => setSecuredRedirect(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white peer-checked:after:bg-zinc-900 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  {!securedRedirect && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
                      <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                      <p>Security checks are disabled. This link will be created without verifying if it is malicious.</p>
                    </div>
                  )}

                  {/* 24h Expiry Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-md">
                        <Clock size={16} className="text-white/70" />
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Auto-delete after 24h</p>
                        <p className="text-xs text-white/50">Link will expire automatically</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={deleteAfter24h}
                        onChange={(e) => {
                          setDeleteAfter24h(e.target.checked);
                          if (e.target.checked) setCustomExpiryDate("");
                        }}
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white peer-checked:after:bg-zinc-900 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  {!deleteAfter24h && (
                    <Input
                      label="Custom Expiry Date & Time (Optional)"
                      type="datetime-local"
                      value={customExpiryDate}
                      onChange={(e) => setCustomExpiryDate(e.target.value)}
                      icon={<Clock size={16} strokeWidth={2} />}
                    />
                  )}

                  <Input
                    label="Maximum Clicks (Optional)"
                    type="number"
                    placeholder="e.g. 100"
                    min="1"
                    value={maxClicks}
                    onChange={(e) => setMaxClicks(e.target.value)}
                    icon={<MousePointer2 size={16} strokeWidth={2} />}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            className="w-full sm:flex-1"
          >
            {loading ? "Creating…" : "Create short link"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
