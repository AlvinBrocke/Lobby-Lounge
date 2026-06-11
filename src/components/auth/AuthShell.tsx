"use client";

import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  "Fully licensed music for commercial use",
  "Curated channels for every venue type",
  "Smart scheduling — set it and forget it",
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 15, height: 15, color: "var(--ll-accent)", flexShrink: 0 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function NowPlayingChip() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 13,
        padding: "13px 17px 13px 13px",
        background: "rgba(15,20,25,.72)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,.12)",
        borderRadius: 16,
        boxShadow: "0 24px 50px -18px rgba(0,0,0,.6)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: "var(--ll-grad-product)",
          display: "grid",
          placeItems: "center",
          color: "var(--ll-accent-ink)",
          flexShrink: 0,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 20, height: 20 }}
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div
          style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 18 }}
          aria-hidden
        >
          {[
            { h: "40%", delay: "-.2s" },
            { h: "90%", delay: "-.5s" },
            { h: "60%", delay: "-.1s" },
            { h: "100%", delay: "-.7s" },
          ].map((b, i) => (
            <span
              key={i}
              style={{
                width: 3,
                height: b.h,
                background: "var(--ll-accent)",
                borderRadius: 2,
                animation: "ll-eq 1.1s var(--ll-ease) infinite",
                animationDelay: b.delay,
              }}
            />
          ))}
        </div>
        <b
          style={{
            display: "block",
            fontFamily: "var(--ll-font-body)",
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1.2,
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          Now playing · Lounge Vibes
        </b>
        <span
          style={{
            fontFamily: "var(--ll-font-body)",
            fontWeight: 500,
            fontSize: 11.5,
            lineHeight: 1.2,
            color: "var(--ll-on-ink-3)",
          }}
        >
          Zone 1 — Main floor
        </span>
      </div>
    </div>
  );
}

interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{
        background: `
          radial-gradient(120% 90% at 85% 0%, rgba(44,181,176,.18) 0%, transparent 55%),
          radial-gradient(90% 80% at 0% 100%, rgba(21,31,108,.55) 0%, transparent 60%),
          linear-gradient(160deg, #0F1419 0%, #0c1322 45%, #0A0E12 100%)
        `,
      }}
    >
      {/* Soundwave texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/images/LL soundwave3.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.11,
          mixBlendMode: "screen",
        }}
      />

      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[440px] shrink-0 p-12 relative z-10 border-r border-white/[0.06]">
        {/* Logo */}
        <Link href="/" className="block w-fit">
          <Image
            src="/images/L&L White Logo.png"
            alt="Lobby & Lounge"
            width={156}
            height={28}
            style={{ height: 28, width: "auto", objectFit: "contain" }}
            priority
          />
        </Link>

        {/* Headline + features */}
        <div>
          <span
            style={{
              fontFamily: "var(--ll-font-body)",
              fontWeight: 700,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: ".2em",
              color: "var(--ll-accent)",
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 22,
            }}
          >
            <span
              style={{
                width: 22,
                height: 1,
                background: "var(--ll-accent)",
                opacity: 0.6,
              }}
            />
            Licensed music for hospitality
          </span>

          <h2
            style={{
              fontFamily: "var(--ll-font-display)",
              fontWeight: 800,
              fontSize: "clamp(32px, 4vw, 44px)",
              lineHeight: 1.05,
              letterSpacing: "-.03em",
              color: "#fff",
              marginBottom: 20,
            }}
          >
            Music that sets
            <br />
            the perfect{" "}
            <span
              style={{
                background: "var(--ll-grad-product)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              atmosphere
            </span>
          </h2>

          <p
            style={{
              fontFamily: "var(--ll-font-body)",
              fontSize: 15,
              lineHeight: 1.65,
              color: "var(--ll-on-ink-2)",
              marginBottom: 32,
              maxWidth: 340,
            }}
          >
            The complete music platform for hotels, cafés, restaurants, and retail.
            Legal, curated, and built to impress.
          </p>

          <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FEATURES.map((f) => (
              <li
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontFamily: "var(--ll-font-body)",
                  fontWeight: 500,
                  fontSize: 13.5,
                  color: "var(--ll-on-ink-2)",
                }}
              >
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Now playing chip */}
        <NowPlayingChip />
      </div>

      {/* Right — form area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto relative z-10">
        {/* Mobile logo */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/">
            <Image
              src="/images/L&L White Logo.png"
              alt="Lobby & Lounge"
              width={130}
              height={24}
              style={{ height: 24, width: "auto" }}
              priority
            />
          </Link>
        </div>

        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
