"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const links = [
  { label: "Licensing", href: "/home#licensing" },
  { label: "How it works", href: "/home#how-it-works" },
  { label: "Business types", href: "/home#business-types" },
  { label: "Pricing", href: "/home#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Help", href: "/help" },
];

export const Navigation = () => {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200",
        stuck ? "border-ll-line bg-[rgba(250,250,247,0.88)] backdrop-blur-md" : "border-transparent bg-ll-paper"
      )}
    >
      <div className="ll-container flex h-[68px] items-center justify-between gap-6">
        <Link href="/" className="ll-link shrink-0 rounded-md">
          <Image
            src="/images/ll-logo-color.png"
            alt="Lobby & Lounge"
            width={76}
            height={32}
            className="block h-8 w-auto"
            priority
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
          {links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="ll-link rounded-sm text-[15px] font-medium text-ll-text-2 hover:text-ll-text"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/signin"
            className="ll-link hidden rounded-sm text-[15px] font-medium text-ll-text-2 hover:text-ll-text sm:block"
          >
            Log in
          </Link>
          <Link href="/signup" className="ll-btn ll-btn-primary h-10 px-4">
            Try it free
          </Link>
        </div>
      </div>
    </header>
  );
};
