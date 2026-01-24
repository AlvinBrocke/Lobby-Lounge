import React from "react";
import PlayerBar from "@/components/layout/PlayerBar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 mb-20">{children}</main>
      <PlayerBar />
    </div>
  );
}
