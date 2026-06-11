"use client";
<<<<<<< HEAD
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Music,
  CalendarDays,
  Search,
  ListMusic,
  Settings,
  LogOut,
  HelpCircle,
  Mail,
  User,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export default function Sidebar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: "Channels", href: "/dashboard", icon: Music },
    { name: "Schedules", href: "/schedule", icon: CalendarDays },
    { name: "Search", href: "/music", icon: Search },
    { name: "My Playlists", href: "/account", icon: ListMusic },
    { name: "Settings", href: "/account", icon: Settings },
  ];

  return (
    <div className="w-64 bg-surface border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <Music className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white">Lobby & Lounge</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
            <User className="text-white w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">My Venue</p>
            <p className="text-xs text-gray-400">Premium Trial</p>
          </div>
        </div>
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-3 h-3" />
            <span>Help Center</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-3 h-3" />
            <span>support@lobbylounge.com</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-gray-300 transition-colors cursor-pointer">
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </div>
        </div>
      </div>
    </div>
=======

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Calendar,
  LayoutGrid,
  Library,
  ListMusic,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { name: "Channels", href: "/dashboard", icon: LayoutGrid },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Library", href: "/library", icon: Library },
  { name: "My Playlists", href: "/playlists", icon: ListMusic },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { signOut } = useClerk();

  const userName = user?.fullName ?? user?.firstName ?? "Loading...";
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  return (
    <aside className="w-64 min-w-[256px] flex flex-col bg-card border-r border-border overflow-hidden shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-[18px] py-[18px] pb-4 border-b border-border">
        <div className="relative w-[34px] h-[34px] rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] flex items-center justify-center">
          <Image
            src="/images/Logo Icon.png"
            alt="Logo"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-bold text-sm text-foreground leading-tight truncate"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Lobby &amp; Lounge
          </div>
          <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
            Business Music
          </div>
        </div>
        <button
          onClick={toggleTheme}
          title="Toggle theme"
          className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
        >
          {theme === "light" ? (
            <Moon className="w-3.5 h-3.5" />
          ) : (
            <Sun className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Live bar */}
      <div className="flex items-center gap-2 px-[18px] py-2.5 bg-[rgba(52,211,153,0.05)] border-b border-border">
        <span className="live-dot w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground flex-1 truncate">
          Live · The Grand Lobby
        </span>
        <span className="text-[9px] font-bold tracking-widest text-emerald-400 bg-[rgba(52,211,153,0.1)] px-2 py-0.5 rounded-full shrink-0">
          ON AIR
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3.5 flex flex-col gap-0.5">
        <div className="text-[9px] font-bold text-muted-foreground tracking-[0.12em] uppercase px-2 pb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[rgba(78,205,196,0.10)] text-primary font-semibold dark:bg-[rgba(78,205,196,0.10)] dark:text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <span className="w-[5px] h-[5px] rounded-full bg-primary shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Trial card */}
      <div className="mx-3 mb-3 p-4 rounded-xl bg-gradient-to-br from-[rgba(78,205,196,0.11)] to-[rgba(68,160,141,0.05)] border border-[rgba(78,205,196,0.16)]">
        <div
          className="text-[9px] font-bold tracking-[0.12em] text-primary mb-1 uppercase"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Premium Trial
        </div>
        <div
          className="text-base font-bold text-foreground mb-0.5"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          12 days left
        </div>
        <div className="text-xs font-medium text-muted-foreground mb-3">
          Full catalog, scheduling &amp; analytics.
        </div>
        <button className="w-full py-2 bg-primary text-[#04201d] rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">
          Upgrade Plan
        </button>
      </div>

      {/* User row */}
      <div className="flex items-center gap-2.5 px-3.5 py-3 border-t border-border">
        <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] flex items-center justify-center shrink-0">
          <span className="text-[#04201d] text-xs font-bold">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-foreground truncate">
            {userName}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {userEmail}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
        >
          <LogOut className="w-3 h-3" />
        </button>
      </div>
    </aside>
>>>>>>> feature/ui-ux
  );
}
