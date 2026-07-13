"use client";
import "@/app/auth/auth.css";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toast";
import { Link2, Mail, Lock, Smartphone } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
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
    if (data.requires2FA) {
      setRequires2FA(true);
      setTwoFactorMethod(data.method);
      setTempToken(data.tempToken);
      setLoading(false);
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
  const handleVerify2FA = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setErrors({ otp: "Enter a valid code" });
      return;
    }
    setVerifying(true);
    setErrors({});
    try {
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code: otp, method: selectedMethod || twoFactorMethod }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast.success("Verification successful");
        router.push(`/dashboard/${data.user.full_name}`);
      } else {
        setErrors({ otp: data.message || "Invalid code" });
        showToast.error(data.message || "Invalid code");
      }
    } catch (err) {
      showToast.error("An error occurred during verification");
    } finally {
      setVerifying(false);
    }
  };
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast.error(data.message || "Google authentication failed");
        setLoading(false);
        return;
      }
      if (data.requires2FA) {
        setRequires2FA(true);
        setTwoFactorMethod(data.method);
        setTempToken(data.tempToken);
        setLoading(false);
        return;
      }
      router.push(`/dashboard/${data.user.full_name}`);
      showToast.success("Successfully authenticated with Google");
    } catch (err) {
      showToast.error("An error occurred during Google authentication");
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {}
      <div className="absolute inset-0 dot-bg pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none auth-gradient-bg" />
      <div className="w-full max-w-md relative z-10">
        {}
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
              Slicly
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-white/40 mt-1.5">
            Sign in to your Slicly account
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="gradient-border-card p-7 shadow-card mb-5"
        >
          {requires2FA ? (
            twoFactorMethod === "both" && !selectedMethod ? (
              <div className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <p className="text-sm text-white/70">Choose a verification method</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMethod("totp")}
                  className="flex flex-col items-center gap-3 p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-white/5 transition-all text-center w-full"
                >
                  <Smartphone size={24} className="text-primary" />
                  <div className="font-semibold text-white text-sm">Authenticator App</div>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const res = await fetch("/api/2fa/send-email-otp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tempToken })
                      });
                      if (res.ok) {
                        showToast.success("OTP sent to your email");
                        setSelectedMethod("email");
                      } else {
                        const data = await res.json();
                        showToast.error(data.message || "Failed to send email");
                      }
                    } catch (e) {
                      showToast.error("Failed to send email");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex flex-col items-center gap-3 p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-white/5 transition-all text-center w-full disabled:opacity-50"
                >
                  <Mail size={24} className="text-primary" />
                  <div className="font-semibold text-white text-sm">{loading ? "Sending..." : "Email OTP"}</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false);
                    setTwoFactorMethod(null);
                    setTempToken(null);
                  }}
                  className="text-sm text-white/50 hover:text-white mt-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerify2FA} className="flex flex-col gap-4">
                <div className="text-center mb-2">
                  <p className="text-sm text-white/70">
                    {(selectedMethod || twoFactorMethod) === "totp" 
                      ? "Enter the code from your authenticator app"
                      : "We've sent a code to your email"}
                  </p>
                </div>
                <Input
                  label="Verification Code"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  error={errors.otp}
                  icon={<Lock size={15} strokeWidth={1.8} />}
                  autoComplete="one-time-code"
                  autoFocus
                />
                <Button
                  variant="primary"
                  type="submit"
                  loading={verifying}
                  size="lg"
                  className="w-full mt-1"
                >
                  {verifying ? "Verifying..." : "Verify & Sign in"}
                </Button>
                {twoFactorMethod === "both" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMethod(null);
                      setOtp("");
                      setErrors({});
                    }}
                    className="text-sm text-white/50 hover:text-white mt-2 transition-colors"
                  >
                    Choose a different method
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setRequires2FA(false);
                      setOtp("");
                      setErrors({});
                    }}
                    className="text-sm text-white/50 hover:text-white mt-2 transition-colors"
                  >
                    Back to login
                  </button>
                )}
              </form>
            )
          ) : (
            <>
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
          <div className="mt-6 mb-4 flex items-center justify-center gap-3">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">Or continue with</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>
          <div className="flex justify-center mt-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => showToast.error("Google Login popup closed or failed")}
              theme="filled_black"
              shape="pill"
              text="signin_with"
            />
          </div>
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
          </>
          )}
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
