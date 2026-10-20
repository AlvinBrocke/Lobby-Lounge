"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useConvexAuth } from "convex/react";
import { BRAND_COLORS, type BrandColor } from "@convex/lib/brand";
import { AppLayout } from "@/components/layout/app-layout";
import { AppSplash } from "@/components/layout/AppSplash";
import { useAccess } from "@/hooks/useAccess";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { useApplyTheme } from "@/hooks/useTheme";

// Client half of the (main) layout: hooks live here so the layout itself can
// stay a Server Component and verify the session before rendering anything.
export function MainShell({ children }: { children: React.ReactNode }) {
  useIdleTimeout();
  useBrandColor();
  useApplyTheme();
  const ready = useAppReady();
  // The app mounts under the splash so its queries load in parallel with it.
  return (
    <>
      <AppLayout>{children}</AppLayout>
      <AppSplash ready={ready} />
    </>
  );
}

/**
 * True once the profile has loaded (so the brand colour is already applied),
 * or once there's no point waiting: Convex rejected the token, which skips the
 * profile query for good, or the backend hasn't answered within 8s.
 */
function useAppReady() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const profileLoaded = useAccess() !== undefined;
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(id);
  }, []);
  return profileLoaded || (!isLoading && !isAuthenticated) || timedOut;
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
