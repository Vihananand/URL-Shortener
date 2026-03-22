"use client";

import "@/app/auth/auth.css";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";
import { Link2, User, Mail, Lock, ShieldCheck } from "lucide-react";

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
  const barColors = [
    "",
    "bg-red-500",
    "bg-yellow-500",
    "bg-white/60",
    "bg-white",
  ];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
              strength >= i ? barColors[strength] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-white/35">{labels[strength]}</p>
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

  const router = useRouter();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8)
      e.password = "At least 8 characters required.";
    if (!confirm) e.confirm = "Please confirm your password.";
    else if (confirm !== password) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors({ general: data.message });
      setLoading(false);
      router.push("/signup");
      showToast.error(`${data.message}`, {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "fadeIn",
        icon: "❌",
        sound: true
      });
      return;
    }

    router.push("/dashboard");
    showToast.success(`${data.message}`, {
      duration: 4000,
      progress: true,
      position: "top-center",
      transition: "fadeIn",
      icon: "✅",
      sound: true
    });
  };

  const clearErr = (field: string) =>
    setErrors((p) => {
      const n = { ...p };
      delete n[field];
      return n;
    });

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 dot-bg pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none auth-gradient-bg" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Link2 size={16} className="text-black" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">Snip.ly</span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-sm text-white/40 mt-1.5">Start shortening links for free</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="gradient-border-card p-7 shadow-card mb-5"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => { setName(e.target.value); clearErr("name"); }}
              error={errors.name}
              icon={<User size={15} strokeWidth={1.8} />}
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
              icon={<Mail size={15} strokeWidth={1.8} />}
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
                icon={<Lock size={15} strokeWidth={1.8} />}
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
              icon={<ShieldCheck size={15} strokeWidth={1.8} />}
              autoComplete="new-password"
            />

            <Button variant="primary" type="submit" loading={loading} size="lg" className="w-full mt-2">
              {loading ? "Creating account…" : "Create free account"}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-sm text-white/40">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-white/80 hover:text-white font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-[11px] text-white/25 mt-4"
        >
          By signing up, you agree to our{" "}
          <Link href="#" className="hover:text-white/50 transition-colors">Terms</Link>{" "}and{" "}
          <Link href="#" className="hover:text-white/50 transition-colors">Privacy Policy</Link>.
        </motion.p>
      </div>
    </div>
  );
}
