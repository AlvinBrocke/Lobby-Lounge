"use client";
export const dynamic = "force-dynamic";
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/AuthShell";

// ─── Shared style tokens ─────────────────────────────────────────────────────

const cardStyle = {
  background: "rgba(15,20,25,.55)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 24,
  padding: "40px 36px",
  boxShadow:
    "0 40px 80px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)",
};

const headingStyle = {
  fontFamily: "var(--ll-font-display)",
  fontWeight: 800,
  fontSize: 26,
  letterSpacing: "-.025em",
  color: "#fff",
  marginBottom: 8,
  marginTop: 0,
};

const subTextStyle = {
  fontFamily: "var(--ll-font-body)",
  fontSize: 14,
  color: "var(--ll-on-ink-3)",
  marginBottom: 28,
  marginTop: 0,
};

const labelStyle = {
  display: "block",
  fontFamily: "var(--ll-font-body)",
  fontWeight: 700,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".12em",
  color: "rgba(255,255,255,.5)",
  marginBottom: 8,
};

const inputStyle = {
  width: "100%",
  height: 48,
  padding: "0 16px",
  background: "rgba(255,255,255,.05)",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 12,
  color: "#fff",
  fontFamily: "var(--ll-font-body)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s",
};

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 10,
        }}
      >
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            style={{
              height: 6,
              width: step === currentStep ? 20 : 6,
              borderRadius: 999,
              background:
                step === currentStep
                  ? "var(--ll-accent)"
                  : "rgba(255,255,255,.18)",
              transition: "width .3s, background .3s",
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontFamily: "var(--ll-font-body)",
          fontSize: 11,
          color: "var(--ll-on-ink-3)",
        }}
      >
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  );
}

// ─── Step 1 — Genre selection ─────────────────────────────────────────────────

const GENRES = [
  { id: "jazz", name: "Jazz" },
  { id: "lofi", name: "Lo-Fi" },
  { id: "classical", name: "Classical" },
  { id: "pop", name: "Pop" },
  { id: "acoustic", name: "Acoustic" },
  { id: "electronic", name: "Electronic" },
  { id: "ambient", name: "Ambient" },
  { id: "rnb", name: "R&B" },
];

function GenreChip({ name, selected, onToggle }) {
  const [hovered, setHovered] = useState(false);

  const base = {
    borderRadius: 999,
    padding: "10px 18px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "var(--ll-font-body)",
    cursor: "pointer",
    border: "1px solid",
    transition: "background .2s, border-color .2s, color .2s",
  };

  const activeStyle = {
    ...base,
    background: "rgba(78,205,196,.12)",
    borderColor: "rgba(78,205,196,.35)",
    color: "var(--ll-accent)",
  };

  const inactiveStyle = {
    ...base,
    background: hovered ? "rgba(255,255,255,.09)" : "rgba(255,255,255,.05)",
    borderColor: hovered ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.1)",
    color: "rgba(255,255,255,.6)",
  };

  return (
    <button
      onClick={onToggle}
      style={selected ? activeStyle : inactiveStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {name}
    </button>
  );
}

function Step1({ selectedGenres, toggleGenre }) {
  return (
    <div>
      <h1 style={headingStyle}>What's your venue's vibe?</h1>
      <p style={subTextStyle}>We'll curate channels that fit your space.</p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {GENRES.map((g) => (
          <GenreChip
            key={g.id}
            name={g.name}
            selected={selectedGenres.includes(g.id)}
            onToggle={() => toggleGenre(g.id)}
          />
        ))}
      </div>

      <p
        style={{
          fontFamily: "var(--ll-font-body)",
          fontSize: 12,
          color: "var(--ll-on-ink-3)",
          marginBottom: 0,
          marginTop: 0,
        }}
      >
        {selectedGenres.length === 0
          ? "Select at least one genre to continue"
          : `${selectedGenres.length} genre${selectedGenres.length > 1 ? "s" : ""} selected`}
      </p>
    </div>
  );
}

// ─── Step 2 — Mood selection ──────────────────────────────────────────────────

const MOODS = [
  {
    id: "relaxed",
    name: "Relaxed",
    emoji: "😌",
    description: "Calm & unhurried",
  },
  {
    id: "upbeat",
    name: "Upbeat",
    emoji: "⚡",
    description: "Energetic & lively",
  },
  {
    id: "elegant",
    name: "Elegant",
    emoji: "🎻",
    description: "Refined & polished",
  },
  {
    id: "focused",
    name: "Focused",
    emoji: "🎯",
    description: "Productive & clear",
  },
];

function MoodCard({ mood, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);

  const style = {
    borderRadius: 14,
    padding: "16px",
    cursor: "pointer",
    minHeight: 80,
    border: "1px solid",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    transition: "background .2s, border-color .2s",
    background: selected
      ? "rgba(78,205,196,.10)"
      : hovered
        ? "rgba(255,255,255,.07)"
        : "rgba(255,255,255,.04)",
    borderColor: selected
      ? "rgba(78,205,196,.3)"
      : hovered
        ? "rgba(255,255,255,.15)"
        : "rgba(255,255,255,.08)",
    textAlign: "left",
  };

  return (
    <button
      onClick={onSelect}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>{mood.emoji}</span>
      <span
        style={{
          fontFamily: "var(--ll-font-body)",
          fontWeight: 700,
          fontSize: 13,
          color: "#fff",
          lineHeight: 1.2,
        }}
      >
        {mood.name}
      </span>
      <span
        style={{
          fontFamily: "var(--ll-font-body)",
          fontSize: 11,
          color: "var(--ll-on-ink-3)",
          lineHeight: 1.3,
        }}
      >
        {mood.description}
      </span>
    </button>
  );
}

function Step2({ selectedMood, setSelectedMood }) {
  return (
    <div>
      <h1 style={headingStyle}>Set the atmosphere</h1>
      <p style={subTextStyle}>
        This helps us match energy levels to your schedule.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 4,
        }}
      >
        {MOODS.map((mood) => (
          <MoodCard
            key={mood.id}
            mood={mood}
            selected={selectedMood === mood.id}
            onSelect={() => setSelectedMood(mood.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Step 3 — Preferences ────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "Restaurant",
  "Café",
  "Hotel Lobby",
  "Retail Store",
  "Spa & Wellness",
  "Bar & Lounge",
  "Other",
];

function Step3({ preferences, setPreferences }) {
  return (
    <div>
      <h1 style={headingStyle}>Almost there!</h1>
      <p style={subTextStyle}>
        A few last details to personalise your experience.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Venue Name */}
        <div>
          <label style={labelStyle}>Venue Name</label>
          <input
            type="text"
            placeholder="e.g. The Grand Café"
            value={preferences.venueName}
            onChange={(e) =>
              setPreferences((p) => ({ ...p, venueName: e.target.value }))
            }
            style={inputStyle}
            onFocus={(e) =>
              (e.target.style.borderColor = "rgba(78,205,196,.6)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = "rgba(255,255,255,.1)")
            }
          />
        </div>

        {/* Business Type */}
        <div>
          <label style={labelStyle}>Business Type</label>
          <div style={{ position: "relative" }}>
            <select
              value={preferences.businessType}
              onChange={(e) =>
                setPreferences((p) => ({
                  ...p,
                  businessType: e.target.value,
                }))
              }
              style={{
                ...inputStyle,
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                paddingRight: 40,
                cursor: "pointer",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(78,205,196,.6)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,.1)")
              }
            >
              <option value="" disabled style={{ background: "#0F1419" }}>
                Select a type…
              </option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: "#0F1419" }}>
                  {t}
                </option>
              ))}
            </select>
            {/* Chevron icon */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 14,
                color: "rgba(255,255,255,.35)",
                pointerEvents: "none",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function MainComponent() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [preferences, setPreferences] = useState({
    venueName: "",
    businessType: "",
    // keep legacy fields for API compat
    tempo: "Medium",
    volume: "Medium",
    allowExplicit: false,
    timeBased: true,
  });

  const totalSteps = 3;

  const toggleGenre = (id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: user?.fullName || user?.firstName || "",
          genres: selectedGenres,
          mood: selectedMood,
          onboarding_completed: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      document.cookie = "ll-onboarded=true; path=/; max-age=31536000";
      window.location.href = "/dashboard";
    } catch (e) {
      console.error("Failed to save profile", e);
      setSaveError(e.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  // Determine whether Continue is enabled
  const canContinue =
    currentStep === 1
      ? selectedGenres.length >= 1
      : currentStep === 2
        ? selectedMood !== ""
        : true;

  // ── Shared button styles ──────────────────────────────────────────────────

  const primaryBtnStyle = {
    height: 44,
    padding: "0 22px",
    background: canContinue ? "var(--ll-accent)" : "rgba(78,205,196,.35)",
    color: "var(--ll-accent-ink)",
    border: "none",
    borderRadius: 12,
    fontFamily: "var(--ll-font-body)",
    fontWeight: 700,
    fontSize: 14,
    cursor: canContinue && !saving ? "pointer" : "not-allowed",
    opacity: saving ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: canContinue
      ? "0 8px 24px -6px rgba(78,205,196,.5)"
      : "none",
    transition: "opacity .2s, transform .2s, background .2s, box-shadow .2s",
    flexShrink: 0,
  };

  const ghostBtnStyle = {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,.4)",
    fontSize: 13,
    fontFamily: "var(--ll-font-body)",
    cursor: "pointer",
    padding: 0,
    transition: "color .2s",
  };

  return (
    <AuthShell>
      <div style={cardStyle}>
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step content */}
        {currentStep === 1 && (
          <Step1
            selectedGenres={selectedGenres}
            toggleGenre={toggleGenre}
          />
        )}
        {currentStep === 2 && (
          <Step2
            selectedMood={selectedMood}
            setSelectedMood={setSelectedMood}
          />
        )}
        {currentStep === 3 && (
          <Step3
            preferences={preferences}
            setPreferences={setPreferences}
          />
        )}

        {/* Error message */}
        {saveError && (
          <p
            style={{
              fontFamily: "var(--ll-font-body)",
              fontSize: 13,
              color: "#f87171",
              marginTop: 16,
              marginBottom: 0,
              textAlign: "center",
            }}
          >
            {saveError}
          </p>
        )}

        {/* Footer navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: currentStep > 1 ? "space-between" : "flex-end",
            alignItems: "center",
            marginTop: 28,
          }}
        >
          {/* Back button — only steps 2 & 3 */}
          {currentStep > 1 && (
            <button
              onClick={prevStep}
              style={ghostBtnStyle}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,.4)")
              }
            >
              ← Back
            </button>
          )}

          {/* Continue / Submit */}
          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              disabled={!canContinue}
              style={primaryBtnStyle}
              onMouseEnter={(e) => {
                if (canContinue)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              style={primaryBtnStyle}
              onMouseEnter={(e) => {
                if (!saving)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              {saving ? "Saving…" : "Start Exploring →"}
            </button>
          )}
        </div>
      </div>
    </AuthShell>
  );
}

export default MainComponent;
