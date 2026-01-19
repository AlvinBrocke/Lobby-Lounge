import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lobby & Lounge - Authentication",
  description: "Sign in or create an account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full h-full">{children}</div>;
}
