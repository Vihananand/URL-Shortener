"use client";
import { ReactNode } from "react";
import { useKeepAlive } from "@/hooks/useKeepAlive";
import { ToastProvider } from "@/components/ui/Toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
export function ClientWrapper({ children }: { children: ReactNode }) {
  useKeepAlive();
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <ToastProvider />
      {children}
    </GoogleOAuthProvider>
  );
}
