"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { motion } from "motion/react";
import DeleteAccountModal from "@/components/dashboard/DeleteAccountModal";
import { showToast } from "@/components/ui/Toast";
import { Shield, Key, Mail, Smartphone, ArrowLeft, Link2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SettingsPage() {
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);
  const [isVirusTotalScanEnabled, setIsVirusTotalScanEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // 2FA Setup state
  const [setupStep, setSetupStep] = useState<"none" | "choose" | "totp" | "email">("none");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  
  const [userSlug, setUserSlug] = useState("Dashboard");

  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUserSlug(data.user?.full_name?.split(" ")[0] || "Dashboard");
          
          // Actually, we need an endpoint to fetch 2FA status, or just include it in /api/auth/me
          // I will update /api/auth/me to include 2fa status.
          setIs2faEnabled(data.user?.is_2fa_enabled || false);
          setTwoFactorMethod(data.user?.two_factor_method || null);
          setIsVirusTotalScanEnabled(data.user?.is_virus_total_scan_enabled !== false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserStatus();
  }, []);

  const handleDeleteAccount = async () => {
    setDeleteAccountModalOpen(false);
    // Handled in modal component which calls /api/account DELETE
  };

  const handleStartSetup = async (method: "totp" | "email") => {
    setSetupStep(method);
    try {
      const res = await fetch("/api/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      });
      const data = await res.json();
      if (res.ok) {
        if (method === "totp") {
          setQrCodeUrl(data.qrCodeUrl);
        } else {
          showToast.success("OTP sent to your email");
        }
      } else {
        showToast.error(data.message || "Failed to initiate setup");
        setSetupStep("none");
      }
    } catch (err) {
      showToast.error("Failed to initiate setup");
      setSetupStep("none");
    }
  };

  const handleVerifyEnable = async () => {
    if (!verifyCode) {
      showToast.error("Please enter the verification code");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: setupStep, code: verifyCode }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast.success("2FA enabled successfully");
        setIs2faEnabled(true);
        setTwoFactorMethod(prev => prev && prev !== setupStep ? "both" : setupStep);
        setSetupStep("none");
        setVerifyCode("");
      } else {
        showToast.error(data.message || "Failed to verify code");
      }
    } catch (err) {
      showToast.error("Failed to verify code");
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async (methodToDisable?: string) => {
    if (!confirm(`Are you sure you want to disable ${methodToDisable === 'totp' ? 'Authenticator App' : methodToDisable === 'email' ? 'Email OTP' : '2FA'}?`)) return;
    try {
      const res = await fetch("/api/2fa/disable", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: methodToDisable })
      });
      if (res.ok) {
        showToast.success(`${methodToDisable === 'totp' ? 'Authenticator App' : methodToDisable === 'email' ? 'Email OTP' : '2FA'} disabled successfully`);
        if (twoFactorMethod === "both" && methodToDisable) {
          setTwoFactorMethod(methodToDisable === "totp" ? "email" : "totp");
        } else {
          setIs2faEnabled(false);
          setTwoFactorMethod(null);
        }
      } else {
        showToast.error("Failed to disable 2FA");
      }
    } catch (err) {
      showToast.error("Failed to disable 2FA");
    }
  };

  const handleToggleVirusTotalScan = async () => {
    const newValue = !isVirusTotalScanEnabled;
    setIsVirusTotalScanEnabled(newValue);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_virus_total_scan_enabled: newValue }),
      });
      if (res.ok) {
        showToast.success(`Secure Redirect ${newValue ? 'enabled' : 'disabled'} successfully`);
      } else {
        setIsVirusTotalScanEnabled(!newValue);
        showToast.error("Failed to update security settings");
      }
    } catch (err) {
      setIsVirusTotalScanEnabled(!newValue);
      showToast.error("Failed to update security settings");
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href={`/dashboard/${userSlug}`} className="text-muted hover:text-text flex items-center gap-2 w-fit mb-6 transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            Security Settings
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage your account security and authentication methods.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 2FA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                  <Shield size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-text mb-2">Two-Factor Authentication (2FA)</h2>
                  <p className="text-muted text-sm mb-6">
                    Add an extra layer of security to your account. When enabled, you'll need to provide a verification code along with your password when signing in.
                  </p>

                  {is2faEnabled && (
                    <div className="space-y-3 mb-6">
                      <h3 className="text-text font-medium text-sm">Active Methods</h3>
                      {(twoFactorMethod === "totp" || twoFactorMethod === "both") && (
                        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-text font-medium">Authenticator App</span>
                          </div>
                          <button
                            onClick={() => handleDisable2FA("totp")}
                            className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            Disable
                          </button>
                        </div>
                      )}
                      
                      {(twoFactorMethod === "email" || twoFactorMethod === "both") && (
                        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                            <span className="text-text font-medium">Email OTP</span>
                          </div>
                          <button
                            onClick={() => handleDisable2FA("email")}
                            className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            Disable
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(!is2faEnabled || twoFactorMethod !== "both") && (
                    <div className="border-t border-border pt-6 mt-2">
                      {setupStep === "none" ? (
                        <div>
                          {is2faEnabled && <h3 className="text-text font-medium text-sm mb-3">Add another method</h3>}
                          <button
                            onClick={() => setSetupStep("choose")}
                            className="gradient-bg text-black px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 cursor-pointer"
                          >
                            {is2faEnabled ? "Add 2FA Method" : "Enable 2FA"}
                          </button>
                        </div>
                      ) : setupStep === "choose" ? (
                        <div className="space-y-4">
                          <h3 className="text-text font-medium mb-3">Choose a verification method:</h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {twoFactorMethod !== "totp" && (
                              <button
                                onClick={() => handleStartSetup("totp")}
                                className="flex flex-col items-center gap-3 p-6 border border-border rounded-xl hover:border-primary/50 hover:bg-white/5 transition-all text-center w-full"
                              >
                                <Smartphone size={32} className="text-primary" />
                                <div>
                                  <div className="font-semibold text-text">Authenticator App</div>
                                  <div className="text-xs text-muted mt-1">Google Authenticator, Authy, etc.</div>
                                </div>
                              </button>
                            )}
                            {twoFactorMethod !== "email" && (
                              <button
                                onClick={() => handleStartSetup("email")}
                                className="flex flex-col items-center gap-3 p-6 border border-border rounded-xl hover:border-primary/50 hover:bg-white/5 transition-all text-center w-full"
                              >
                                <Mail size={32} className="text-primary" />
                                <div>
                                  <div className="font-semibold text-text">Email OTP</div>
                                  <div className="text-xs text-muted mt-1">Receive a code via email</div>
                                </div>
                              </button>
                            )}
                          </div>
                          <button onClick={() => setSetupStep("none")} className="text-sm text-muted hover:text-text mt-4 block">Cancel</button>
                        </div>
                      ) : (
                        <div className="space-y-4 bg-black/20 p-6 rounded-xl border border-white/5">
                          <h3 className="text-text font-medium">Verify your {setupStep === "totp" ? "Authenticator App" : "Email"}</h3>
                          
                          {setupStep === "totp" && qrCodeUrl && (
                            <div className="mb-4">
                              <p className="text-sm text-muted mb-3">Scan this QR code with your authenticator app:</p>
                              <div className="bg-white p-2 rounded-xl inline-block">
                                <Image src={qrCodeUrl} alt="QR Code" width={150} height={150} />
                              </div>
                            </div>
                          )}

                          {setupStep === "email" && (
                            <p className="text-sm text-muted mb-4">We've sent a 6-digit verification code to your email address.</p>
                          )}

                          <div className="flex gap-3 max-w-sm">
                            <input
                              type="text"
                              placeholder="Enter 6-digit code"
                              value={verifyCode}
                              onChange={(e) => setVerifyCode(e.target.value)}
                              className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50"
                            />
                            <button
                              onClick={handleVerifyEnable}
                              disabled={verifying}
                              className="gradient-bg text-black px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
                            >
                              {verifying ? "Verifying..." : "Verify & Enable"}
                            </button>
                          </div>
                          <button onClick={() => setSetupStep("none")} className="text-sm text-muted hover:text-text mt-2 block">Cancel Setup</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Link Security Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                  <Link2 size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-text mb-2">Link Security (Secure Redirect)</h2>
                  <p className="text-muted text-sm mb-6">
                    Automatically scan destination URLs before redirecting users. This protects your visitors from malicious links.
                  </p>

                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${isVirusTotalScanEnabled ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`}></div>
                      <div>
                        <span className="text-text font-medium block">Malicious Link Scanning</span>
                        <span className="text-xs text-muted block">{isVirusTotalScanEnabled ? "Currently protecting your links" : "Currently disabled"}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleVirusTotalScan}
                      className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                        isVirusTotalScanEnabled 
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                          : 'gradient-bg text-black shadow-lg shadow-primary/25'
                      }`}
                    >
                      {isVirusTotalScanEnabled ? "Disable" : "Enable"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-xl font-semibold text-red-500 mb-2">Danger Zone</h2>
              <p className="text-muted text-sm mb-6">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              <button
                onClick={() => setDeleteAccountModalOpen(true)}
                className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Delete Account
              </button>
            </motion.div>

          </div>
        )}

      </div>

      <DeleteAccountModal
        isOpen={deleteAccountModalOpen}
        onClose={() => setDeleteAccountModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
