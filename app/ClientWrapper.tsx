"use client";

import { ReactNode } from "react";
import { useKeepAlive } from "@/hooks/useKeepAlive";

export function ClientWrapper({ children }: { children: ReactNode }) {
  // Start keep-alive mechanism
  useKeepAlive();

  return <>{children}</>;
}
