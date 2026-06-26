"use client";

import React from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useIdleTimeout();
  return <AppLayout>{children}</AppLayout>;
}
