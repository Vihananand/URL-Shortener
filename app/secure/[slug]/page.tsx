"use client";

import { useState, use } from "react";
import { motion } from "motion/react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SecurePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/secure/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.originalUrl) {
        window.location.href = data.originalUrl;
      } else {
        setError(data.message || "Incorrect password");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative background blur */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] aspect-square bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-text mb-2">Protected Link</h1>
              <p className="text-muted text-sm">
                This link requires a password to access the destination URL.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Password"
                type="password"
                placeholder="Enter the password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                error={error}
                icon={<Lock size={16} />}
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full h-12"
                loading={loading}
              >
                {loading ? "Verifying..." : (
                  <span className="flex items-center justify-center gap-2">
                    Access Link <ArrowRight size={16} />
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted/60">
            Powered by Antigravity URL Shortener
          </p>
        </div>
      </motion.div>
    </div>
  );
}
