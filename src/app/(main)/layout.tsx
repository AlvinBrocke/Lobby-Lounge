import React from "react";
import { verifySession } from "@/lib/session";
import { MainShell } from "@/components/layout/MainShell";

// Layer 2 of auth: even if middleware were misconfigured, nothing under (main)
// renders for a signed-out user. `verifySession` redirects to /signin.
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();
  return <MainShell>{children}</MainShell>;
}
