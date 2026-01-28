"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Library,
  Calendar,
  Settings,
  PlusSquare,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Search", href: "/music", icon: Search },
  { name: "Your Library", href: "/library", icon: Library },
];

const b2bItems = [
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-card/40 backdrop-blur-md text-muted-foreground p-2 space-y-2 w-full">
      {/* Brand */}
      <div className="px-4 py-6">
        <Link href="/" className="flex items-center border border-primary-800">
          <img
            src="/images/L&L Main Logo.png"
            alt="Lobby & Lounge Logo"
            className="h-10 w-auto"
          />
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center space-x-4 px-4 py-3 rounded-md transition-colors font-semibold",
              pathname === item.href
                ? "bg-accent text-accent-foreground shadow-sm"
                : "hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <item.icon className="w-6 h-6" />
            <span>{item.name}</span>
          </Link>
        ))}

        <div className="pt-6 pb-2 px-4 uppercase text-[11px] font-bold tracking-widest text-[#b3b3b3] opacity-60">
          Business Tools
        </div>

        {b2bItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center space-x-4 px-4 py-3 rounded-md transition-colors font-semibold",
              pathname === item.href
                ? "bg-accent text-accent-foreground shadow-sm"
                : "hover:bg-accent/50 hover:text-foreground",
            )}
          >
            <item.icon className="w-6 h-6" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 pb-4 space-y-1">
        <button className="flex items-center space-x-4 px-4 py-2 w-full text-left rounded-md transition-colors hover:bg-accent/50 hover:text-foreground group">
          <div className="bg-muted group-hover:bg-accent p-1 rounded-sm transition-colors">
            <PlusSquare className="w-4 h-4 text-foreground/80" />
          </div>
          <span className="text-sm font-semibold">Create Playlist</span>
        </button>
        <button className="flex items-center space-x-4 px-4 py-2 w-full text-left rounded-md transition-colors hover:bg-accent/50 hover:text-foreground group">
          <div className="bg-gradient-to-br from-indigo-700/80 to-blue-500/80 p-1 rounded-sm shadow-sm group-hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold">Liked Songs</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
