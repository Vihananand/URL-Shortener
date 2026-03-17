"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    // TODO: replace with API call — POST /api/auth/signin { email, password }
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 blob bg-primary/15 animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 blob bg-secondary/10 animate-blob animation-delay-2000 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">Snip.ly</span>
          </Link>
          <h1 className="text-2xl font-bold text-text">Welcome back</h1>
          <p className="text-sm text-muted mt-1">Sign in to your Snip.ly account</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/30"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
              error={errors.email}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22 6 12 13 2 6" />
                </svg>
              }
              autoComplete="email"
              autoFocus
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                error={errors.password}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                }
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-1.5">
                <Link href="#" className="text-xs text-primary hover:text-secondary transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button variant="primary" type="submit" loading={loading} size="lg" className="w-full mt-1">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary hover:text-secondary font-medium transition-colors">
                Sign up free
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-muted mt-6"
        >
          By signing in, you agree to our{" "}
          <Link href="#" className="hover:text-text transition-colors">Terms</Link>{" "}
          and{" "}
          <Link href="#" className="hover:text-text transition-colors">Privacy Policy</Link>.
        </motion.p>
      </div>
    </div>
  );
}
