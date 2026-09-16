import type { Metadata } from "next";
import { MarketingPage } from "@/components/landing/MarketingPage";

export const metadata: Metadata = { title: "Cookies · Lobby & Lounge" };

// DRAFT — replace with the final reviewed policy.
export default function CookiesPage() {
  return (
    <MarketingPage eyebrow="Legal" title="Cookie Policy" draft>
      <p><small>Last updated: September 2026</small></p>

      <h2>What cookies we use</h2>
      <ul>
        <li><b>Sign-in cookies</b> (set by Clerk) — keep you signed in to the dashboard. Strictly necessary.</li>
        <li><b><code>ll-onboarded</code></b> — remembers that you have completed onboarding so we don&apos;t show it again. Strictly necessary.</li>
        <li><b><code>ll-theme</code></b> (local storage) — remembers your light/dark preference.</li>
      </ul>

      <h2>What we don&apos;t use</h2>
      <p>We do not currently use advertising or cross-site tracking cookies. Basic, privacy-friendly page analytics may be added later and will be described here.</p>

      <h2>Managing cookies</h2>
      <p>You can clear or block cookies in your browser settings. Blocking the sign-in cookies will prevent you from using the dashboard.</p>

      <h2>Contact</h2>
      <p>Questions about cookies: <a href="/contact">contact us</a>.</p>
    </MarketingPage>
  );
}
