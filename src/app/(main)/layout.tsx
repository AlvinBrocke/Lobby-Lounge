import type React from "react";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { MainShell } from "@/components/layout/MainShell";

// Layer 2 of auth: even if middleware were misconfigured, nothing under (main)
// renders for a signed-out user. `verifySession` redirects to /signin.
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  // Mirrors the onboarding gate in src/proxy.ts. Users whose Convex profile is
  // complete but whose claim isn't set yet get it backfilled on that page.
  if (!session.onboardingComplete) redirect("/signup/onboarding");
  return <MainShell>{children}</MainShell>;
}
