"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { ShortenedUrl } from "@/types";
import { APP_DOMAIN } from "@/lib/site";

interface CreateUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (url: ShortenedUrl) => void;
}

export default function CreateUrlModal({ isOpen, onClose, onCreated }: CreateUrlModalProps) {
  const [longUrl, setLongUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
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

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            className="flex-1"
          >
            {loading ? "Creating…" : "Create short link"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
