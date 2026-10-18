"use client";

import React, { useEffect } from "react";
import { BRAND_COLORS, type BrandColor } from "@convex/lib/brand";
import { AppLayout } from "@/components/layout/app-layout";
import { useAccess } from "@/hooks/useAccess";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";

// Client half of the (main) layout: hooks live here so the layout itself can
// stay a Server Component and verify the session before rendering anything.
export function MainShell({ children }: { children: React.ReactNode }) {
  useIdleTimeout();
  useBrandColor();
  return <AppLayout>{children}</AppLayout>;
}

/**
 * Tints the app with the venue's brand accent. Set on <html> rather than a
 * wrapper so dialogs portalled to <body> pick it up too; cleared on the way
 * out so the marketing pages keep the house teal.
 */
function useBrandColor() {
  const brandColor = useAccess()?.profile?.brandColor as BrandColor | undefined;
  useEffect(() => {
    const hsl = brandColor && BRAND_COLORS[brandColor];
    if (!hsl) return;
    const root = document.documentElement.style;
    root.setProperty("--primary", hsl);
    return () => {
      root.removeProperty("--primary");
    };
  }, [brandColor]);
}
