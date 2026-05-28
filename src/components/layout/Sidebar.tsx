"use client";

import { cn } from "@/lib/utils";
import {
  BarChart2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  LayoutGrid,
  Library,
  ListMusic,
  Menu,
  Settings,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const navItems = [
  { name: "Playlists", href: "/dashboard", icon: ListMusic },
  { name: "Explore", href: "/explore", icon: Globe },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Library", href: "/library", icon: Library },
  { name: "Admin Console", href: "/admin", icon: Settings },
];

interface NavItemProps {
  item: (typeof navItems)[0];
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

function NavItem({ item, isActive, isCollapsed, onClick }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center rounded-xl transition-all duration-300 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        isCollapsed ? "justify-center p-3" : "px-4 py-3 space-x-3.5",
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-[1.02]",
      )}
      aria-current={isActive ? "page" : undefined}
      title={isCollapsed ? item.name : undefined}
    >
      <Icon
        className={cn(
          "flex-shrink-0 transition-colors duration-300",
          isCollapsed ? "w-6 h-6" : "w-5 h-5",
          isActive
            ? "text-white"
            : "text-muted-foreground group-hover:text-foreground",
        )}
        aria-hidden="true"
      />
      {!isCollapsed && (
        <span className="font-medium text-[15px] tracking-tight truncate">
          {item.name}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-collapse on mobile/tablet (simple check)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Toggle & Overlay */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-md border-white/10 shadow-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "flex flex-col h-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-40",
          "bg-background/95 backdrop-blur-xl border border-border/50", // Theme-aware glassmorphism
          "shadow-[0_8px_30px_rgb(0,0,0,0.04)]", // Subtle premium shadow
          isCollapsed ? "w-[80px]" : "w-[280px]",
          "lg:relative fixed inset-y-0 left-0 lg:translate-x-0 rounded-2xl my-2 ml-2",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header / Brand */}
        <div
          className={cn(
            "h-20 flex items-center",
            isCollapsed ? "justify-center" : "px-6",
          )}
        >
          <div className="flex items-center justify-center w-full overflow-hidden">
            {isCollapsed ? (
              <div className="relative w-10 h-10">
                <Image
                  src="/images/Logo Icon.png"
                  alt="Lobby Lounge Icon"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="relative w-40 h-12">
                <Image
                  src="/images/L&L Main Logo.png"
                  alt="Lobby Lounge"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-none">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          ))}
        </nav>

        {/* Bottom Actions / User */}
        <div className="p-3 mt-auto space-y-3">
          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden lg:flex items-center justify-center w-full p-2 rounded-xl",
              "text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-300",
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center space-x-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
