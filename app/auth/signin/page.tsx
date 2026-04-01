"use client";

import "@/app/auth/auth.css";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { showToast } from "nextjs-toast-notify";
import { Link2, Mail, Lock } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email.";
    if (!password) e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});

    const res = await fetch("/api/signin", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrors({ general: data.message });
      setLoading(false);
      showToast.error(`${data.message}`, {
        duration: 4000,
        progress: true,
        position: "top-center",
        transition: "fadeIn",
        icon: "X",
        sound: true,
      });
      return;
    }

    router.push(`/dashboard/${data.user.full_name}`);
    showToast.success(`${data.message}`, {
      duration: 4000,
      progress: true,
      position: "top-center",
      transition: "fadeIn",
      icon: "✅",
      sound: true,
    });

    setLoading(false);
  };

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
            <span className="text-lg font-semibold text-white tracking-tight">
              Snip.ly
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-white/40 mt-1.5">
            Sign in to your Snip.ly account
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="gradient-border-card p-7 shadow-card mb-5"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              error={errors.email}
              icon={<Mail size={15} strokeWidth={1.8} />}
              autoComplete="email"
              autoFocus
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                error={errors.password}
                icon={<Lock size={15} strokeWidth={1.8} />}
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-1.5">
                <Link
                  href="#"
                  className="text-[11px] text-white/35 hover:text-white/60 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              variant="primary"
              type="submit"
              loading={loading}
              size="lg"
              className="w-full mt-1"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-sm text-white/40">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                Sign up free
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
          By signing in, you agree to our{" "}
          <Link href="#" className="hover:text-white/50 transition-colors">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="hover:text-white/50 transition-colors">
            Privacy Policy
          </Link>
          .
        </motion.p>
      </div>
    </div>
  );
}
