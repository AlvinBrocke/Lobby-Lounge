"use client";

import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";

// Client half of the (main) layout: hooks live here so the layout itself can
// stay a Server Component and verify the session before rendering anything.
export function MainShell({ children }: { children: React.ReactNode }) {
  useIdleTimeout();
  return <AppLayout>{children}</AppLayout>;
}
