"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

function PasswordStrength({ password }: { password: string }) {
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-yellow-500", "bg-blue-400", "bg-accent"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              strength >= i ? colors[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted">{labels[strength]}</p>
    </div>
  );
}

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8) e.password = "At least 8 characters required.";
    if (!confirm) e.confirm = "Please confirm your password.";
    else if (confirm !== password) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    // TODO: replace with API call — POST /api/auth/signup { name, email, password }
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    window.location.href = "/dashboard";
  };

  const clearErr = (field: string) =>
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 blob bg-secondary/15 animate-blob pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 blob bg-primary/10 animate-blob animation-delay-4000 pointer-events-none" />

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
          <h1 className="text-2xl font-bold text-text">Create your account</h1>
          <p className="text-sm text-muted mt-1">Start shortening links for free</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/30"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => { setName(e.target.value); clearErr("name"); }}
              error={errors.name}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
              autoFocus
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearErr("email"); }}
              error={errors.email}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22 6 12 13 2 6" />
                </svg>
              }
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearErr("password"); }}
                error={errors.password}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                }
                autoComplete="new-password"
              />
              <PasswordStrength password={password} />
            </div>

            <Input
              label="Confirm password"
              type="password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); clearErr("confirm"); }}
              error={errors.confirm}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
              autoComplete="new-password"
            />

            <Button variant="primary" type="submit" loading={loading} size="lg" className="w-full mt-2">
              {loading ? "Creating account…" : "Create free account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary hover:text-secondary font-medium transition-colors">
                Sign in
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
          By signing up, you agree to our{" "}
          <Link href="#" className="hover:text-text transition-colors">Terms</Link>{" "}
          and{" "}
          <Link href="#" className="hover:text-text transition-colors">Privacy Policy</Link>.
        </motion.p>
      </div>
    </div>
  );
}
