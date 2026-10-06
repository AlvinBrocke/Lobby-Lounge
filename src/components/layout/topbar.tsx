"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { CreditCard, Home, LogOut, Search, Settings, X } from "lucide-react";
import { useAccess } from "@/hooks/useAccess";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Search lives in the URL (`/playlists?q=…`) rather than in React state, so the
 * Playlists page can read it and the result survives a refresh or a shared link.
 */
function PlaylistSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const onPlaylists = pathname === "/playlists";
  const [value, setValue] = useState(onPlaylists ? (params.get("q") ?? "") : "");

  // Leaving /playlists clears the box, so it doesn't look like a filter is active elsewhere.
  useEffect(() => {
    if (!onPlaylists) setValue("");
  }, [onPlaylists]);

  function go(term: string, replace: boolean) {
    const url = term.trim() ? `/playlists?q=${encodeURIComponent(term.trim())}` : "/playlists";
    // `replace` while typing on /playlists so each keystroke isn't a history entry.
    if (replace) router.replace(url, { scroll: false });
    else router.push(url);
  }

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        go(value, false);
      }}
      className="relative flex-1 max-w-[380px]"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-faint pointer-events-none" />
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (onPlaylists) go(e.target.value, true);
        }}
        placeholder="What do you want to play?"
        aria-label="Search playlists"
        className="w-full rounded-full border border-primary/20 bg-secondary py-[7px] pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            if (onPlaylists) go("", true);
          }}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </form>
  );
}

function AccountMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const access = useAccess();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on any click outside the menu.
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const venue = access?.profile?.venueName;
  const name = venue || user?.fullName || user?.firstName || "Your venue";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = initialsOf(name);

  const item =
    "w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs font-semibold text-foreground hover:bg-white/5 transition-colors";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open account menu"
        aria-expanded={open}
        className="w-[30px] h-[30px] rounded-full bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center hover:ring-4 hover:ring-primary/15 transition-shadow"
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+9px)] w-[240px] p-2.5 rounded-[11px] bg-popover border border-white/10 shadow-[0_18px_48px_rgba(0,0,0,0.62)] z-[60]">
          <div className="flex items-center gap-2.5 px-1.5 pt-1 pb-3 border-b border-white/5">
            <span className="w-[34px] h-[34px] rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shrink-0">
              {initials}
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{name}</div>
              <div className="text-[10px] text-muted-foreground truncate mt-0.5">{email}</div>
            </div>
          </div>
          <div className="pt-1.5 flex flex-col">
            <Link href="/settings" onClick={() => setOpen(false)} className={item}>
              <Settings className="w-3.5 h-3.5 text-primary" />
              Venue &amp; settings
            </Link>
            <Link href="/settings?tab=billing" onClick={() => setOpen(false)} className={item}>
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              Plan &amp; billing
            </Link>
            <button
              // Let Clerk own the redirect: it clears the session cookie *then*
              // navigates, so middleware never sees a stale session.
              onClick={() => signOut({ redirectUrl: "/signin" })}
              className={item}
            >
              <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Topbar() {
  return (
    <header className="relative shrink-0 flex items-center gap-3.5 px-5 py-[13px] border-b border-primary/[0.08]">
      <div className="flex-1" />
      <Link
        href="/playlists"
        title="Playlist home"
        aria-label="Playlist home"
        className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-foreground hover:text-primary transition-colors shrink-0"
      >
        <Home className="w-5 h-5" />
      </Link>
      <PlaylistSearch />
      <div className="flex-1 flex justify-end">
        <AccountMenu />
      </div>
    </header>
  );
}
