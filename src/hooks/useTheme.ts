"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

// Per device on purpose: a sunny front-desk tablet and a dim bar tablet differ.
// The inline script in src/app/(main)/layout.tsx reads the same key.
export const THEME_KEY = "ll-theme";
const CHANGE = "ll-theme-change";

function read(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {} // storage can throw (private mode, blocked site data)
  return "dark";
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The saved theme and a setter. Every caller shares one value via localStorage. */
export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(THEME_KEY, t);
    } catch {}
    window.dispatchEvent(new Event(CHANGE));
  }, []);
  return [theme, setTheme];
}

/**
 * Applies the theme to <html> (so portalled dialogs get it too). Call once,
 * from the app shell; on the way out it restores the dark root the marketing
 * pages expect.
 */
export function useApplyTheme() {
  const [theme] = useTheme();
  useEffect(() => {
    const root = document.documentElement.classList;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => root.toggle("dark", theme === "dark" || (theme === "system" && mq.matches));
    apply();
    if (theme === "system") mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      root.add("dark");
    };
  }, [theme]);
}
