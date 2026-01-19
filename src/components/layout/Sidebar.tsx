"use client";
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
  );
}
