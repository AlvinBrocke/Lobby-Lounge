"use client";

import React, { useEffect, useState } from "react";
import { getSharingOptOut, setSharingOptOut, hasGPCSignal } from "@/lib/privacy-preferences";

/**
 * "Do Not Sell or Share My Personal Information" control.
 * Persists the choice in the `ll_opt_out_sharing` cookie and honours a
 * Global Privacy Control signal automatically (Privacy Policy §10).
 */
export function DoNotSellToggle() {
  // null until mounted — cookies/navigator aren't available during SSR
  const [optedOut, setOptedOut] = useState<boolean | null>(null);
  const [gpc, setGpc] = useState(false);

  useEffect(() => {
    const signal = hasGPCSignal();
    setGpc(signal);
    if (signal && !getSharingOptOut()) setSharingOptOut(true);
    setOptedOut(signal || getSharingOptOut());
  }, []);

  const toggle = () => {
    if (gpc || optedOut === null) return;
    const next = !optedOut;
    setSharingOptOut(next);
    setOptedOut(next);
  };

  const on = optedOut === true;

  return (
    <div
      id="do-not-sell"
      style={{
        scrollMarginTop: 96,
        margin: "24px 0 8px",
        padding: "24px 26px",
        borderRadius: 18,
        border: "1px solid rgba(78,205,196,.35)",
        background: "linear-gradient(135deg, rgba(78,205,196,.10), rgba(21,31,108,.18))",
      }}
    >
      <p style={{ margin: "0 0 6px", fontFamily: "var(--ll-font-display)", fontWeight: 700, fontSize: 18, color: "#fff" }}>
        Do Not Sell or Share My Personal Information
      </p>
      <p style={{ margin: "0 0 20px", fontSize: 14.5, lineHeight: 1.6, color: "var(--ll-on-ink-2)" }}>
        Opt out of the &lsquo;sharing&rsquo; of your personal information for cross-context behavioral advertising on this browser. Strictly necessary and functional cookies are unaffected.
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Opt out of sale or sharing of my personal information"
          disabled={gpc || optedOut === null}
          onClick={toggle}
          style={{
            position: "relative",
            width: 54,
            height: 30,
            borderRadius: 999,
            border: "none",
            padding: 0,
            cursor: gpc ? "not-allowed" : "pointer",
            background: on ? "var(--ll-accent)" : "rgba(255,255,255,.14)",
            transition: "background .25s",
            flexShrink: 0,
            opacity: optedOut === null ? 0.5 : 1,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: on ? 27 : 3,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: on ? "var(--ll-accent-ink)" : "#fff",
              transition: "left .25s var(--ll-ease)",
            }}
          />
        </button>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: "#fff" }} aria-live="polite">
          {optedOut === null
            ? "Checking your preference…"
            : on
              ? "You are opted out of sale/sharing."
              : "You are currently opted in. Turn on to opt out."}
        </span>
      </div>

      {gpc && (
        <p style={{ margin: "16px 0 0", fontSize: 13.5, lineHeight: 1.55, color: "var(--ll-accent)" }}>
          Your browser is sending a Global Privacy Control signal. We have treated it as a valid opt-out request and applied it automatically for this browser.
        </p>
      )}
    </div>
  );
}
