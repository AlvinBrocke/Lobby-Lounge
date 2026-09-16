"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { COUNTRIES, US_STATES, PINNED_COUNTRY_COUNT } from "@/lib/countries";

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

const selectStyle = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  paddingRight: 40,
  cursor: "pointer",
};

const focusIn = (e) => (e.target.style.borderColor = "rgba(78,205,196,.6)");
const focusOut = (e) => (e.target.style.borderColor = "rgba(255,255,255,.1)");

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

// ─── Reusable inputs ──────────────────────────────────────────────────────────

function Chip({ name, selected, onToggle }) {
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
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      style={selected ? activeStyle : inactiveStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {name}
    </button>
  );
}

function ChipGroup({ children }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{children}</div>
  );
}

function Chevron() {
  return (
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
  );
}

function Select({ value, onChange, placeholder, children }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={onChange}
        style={selectStyle}
        onFocus={focusIn}
        onBlur={focusOut}
      >
        <option value="" disabled style={{ background: "#0F1419" }}>
          {placeholder}
        </option>
        {children}
      </select>
      <Chevron />
    </div>
  );
}

// ─── Step 1 — Your business ───────────────────────────────────────────────────

const LOCATION_OPTIONS = [
  { value: 1, label: "1" },
  { value: 2, label: "2–3" },
  { value: 4, label: "4–5" },
  { value: 6, label: "6+" },
];

function Step1({ business, setBusiness }) {
  const set = (key) => (value) => setBusiness((b) => ({ ...b, [key]: value }));
  const isUS = business.country === "US";
  const pinned = COUNTRIES.slice(0, PINNED_COUNTRY_COUNT);
  const rest = COUNTRIES.slice(PINNED_COUNTRY_COUNT);

  return (
    <div>
      <h1 style={headingStyle}>Tell us about your business</h1>
      <p style={subTextStyle}>
        We'll use this to set up your venue and keep your music licensed
        where you play it.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={labelStyle}>Business name</label>
          <input
            type="text"
            placeholder="e.g. The Grand Café"
            value={business.name}
            onChange={(e) => set("name")(e.target.value)}
            style={inputStyle}
            onFocus={focusIn}
            onBlur={focusOut}
            autoFocus
          />
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={labelStyle}>Country</label>
            <Select
              value={business.country}
              placeholder="Select…"
              onChange={(e) => {
                set("country")(e.target.value);
                set("region")(""); // region list changes with country
              }}
            >
              {pinned.map((c) => (
                <option key={c.code} value={c.code} style={{ background: "#0F1419" }}>
                  {c.name}
                </option>
              ))}
              <option disabled style={{ background: "#0F1419" }}>
                ──────────
              </option>
              {rest.map((c) => (
                <option key={c.code} value={c.code} style={{ background: "#0F1419" }}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label style={labelStyle}>{isUS ? "State" : "State / Region"}</label>
            {isUS ? (
              <Select
                value={business.region}
                placeholder="Select…"
                onChange={(e) => set("region")(e.target.value)}
              >
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code} style={{ background: "#0F1419" }}>
                    {s.name}
                  </option>
                ))}
              </Select>
            ) : (
              <input
                type="text"
                placeholder="e.g. Greater London"
                value={business.region}
                onChange={(e) => set("region")(e.target.value)}
                style={inputStyle}
                onFocus={focusIn}
                onBlur={focusOut}
              />
            )}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Locations you operate</label>
          <ChipGroup>
            {LOCATION_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                name={o.label}
                selected={business.locationCount === o.value}
                onToggle={() => set("locationCount")(o.value)}
              />
            ))}
          </ChipGroup>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 — Your guests ─────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  "Restaurant",
  "Café",
  "Bar & Lounge",
  "Hotel",
  "Retail",
  "Spa & Wellness",
  "Gym",
  "Office",
  "Other",
];

const GUEST_DEMOGRAPHICS = [
  "Families",
  "Young professionals",
  "Tourists",
  "Business travellers",
  "Students",
  "Regulars & locals",
  "Mixed",
];

function Step2({ guests, setGuests }) {
  const toggleDemographic = (d) =>
    setGuests((g) => ({
      ...g,
      demographics: g.demographics.includes(d)
        ? g.demographics.filter((x) => x !== d)
        : [...g.demographics, d],
    }));

  return (
    <div>
      <h1 style={headingStyle}>Who walks through the door?</h1>
      <p style={subTextStyle}>
        Helps us suggest channels that suit your space and your guests.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <label style={labelStyle}>Business type</label>
          <ChipGroup>
            {BUSINESS_TYPES.map((t) => (
              <Chip
                key={t}
                name={t}
                selected={guests.businessType === t}
                onToggle={() => setGuests((g) => ({ ...g, businessType: t }))}
              />
            ))}
          </ChipGroup>
        </div>

        <div>
          <label style={labelStyle}>Guest demographic — pick all that apply</label>
          <ChipGroup>
            {GUEST_DEMOGRAPHICS.map((d) => (
              <Chip
                key={d}
                name={d}
                selected={guests.demographics.includes(d)}
                onToggle={() => toggleDemographic(d)}
              />
            ))}
          </ChipGroup>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 — Your sound ──────────────────────────────────────────────────────

const GENRES = [
  { id: "jazz", name: "Jazz" },
  { id: "lo-fi", name: "Lo-Fi" },
  { id: "classical", name: "Classical" },
  { id: "pop", name: "Pop" },
  { id: "acoustic", name: "Acoustic" },
  { id: "electronic", name: "Electronic" },
  { id: "ambient", name: "Ambient" },
  { id: "rnb", name: "R&B" },
];

const MOODS = [
  { id: "relaxed", name: "Relaxed", emoji: "😌", description: "Calm & unhurried" },
  { id: "upbeat", name: "Upbeat", emoji: "⚡", description: "Energetic & lively" },
  { id: "elegant", name: "Elegant", emoji: "🎻", description: "Refined & polished" },
  { id: "focused", name: "Focused", emoji: "🎯", description: "Productive & clear" },
];

function MoodCard({ mood, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);

  const style = {
    borderRadius: 14,
    padding: "14px 16px",
    cursor: "pointer",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    gap: 12,
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
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{mood.emoji}</span>
      <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
      </span>
    </button>
  );
}

function Step3({ sound, setSound }) {
  const toggleGenre = (id) =>
    setSound((s) => ({
      ...s,
      genres: s.genres.includes(id)
        ? s.genres.filter((g) => g !== id)
        : [...s.genres, id],
    }));

  return (
    <div>
      <h1 style={headingStyle}>What's your venue's vibe?</h1>
      <p style={subTextStyle}>We'll pick a starting channel that fits your space.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <label style={labelStyle}>Genres — pick at least one</label>
          <ChipGroup>
            {GENRES.map((g) => (
              <Chip
                key={g.id}
                name={g.name}
                selected={sound.genres.includes(g.id)}
                onToggle={() => toggleGenre(g.id)}
              />
            ))}
          </ChipGroup>
        </div>

        <div>
          <label style={labelStyle}>Mood</label>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {MOODS.map((mood) => (
              <MoodCard
                key={mood.id}
                mood={mood}
                selected={sound.mood === mood.id}
                onSelect={() => setSound((s) => ({ ...s, mood: mood.id }))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const ONBOARDED_COOKIE = "ll-onboarded=true; path=/; max-age=31536000; SameSite=Lax";

function MainComponent() {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const saveProfile = useMutation(api.userProfiles.createOrUpdate);
  // Existing profile — used to bounce users who already onboarded (on another
  // browser, or before the cookie gate existed) straight to the dashboard.
  const profile = useQuery(api.userProfiles.get, isAuthenticated ? {} : "skip");

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [business, setBusiness] = useState({
    name: "",
    country: "",
    region: "",
    locationCount: null,
  });
  const [guests, setGuests] = useState({ businessType: "", demographics: [] });
  const [sound, setSound] = useState({ genres: [], mood: "" });

  const totalSteps = 3;

  useEffect(() => {
    if (profile?.onboardingCompleted) {
      document.cookie = ONBOARDED_COOKIE;
      window.location.replace("/dashboard");
    }
  }, [profile]);

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Everything is optional on the backend, so the same payload serves both
  // "Finish" and "Skip for now" — blanks are simply left undefined.
  const buildPayload = () => ({
    displayName: user?.fullName || user?.firstName || "",
    venueName: business.name || undefined,
    country: business.country || undefined,
    region: business.region || undefined,
    locationCount: business.locationCount ?? undefined,
    businessType: guests.businessType || undefined,
    guestDemographics:
      guests.demographics.length > 0 ? guests.demographics : undefined,
    genres: sound.genres,
    mood: sound.mood || undefined,
    onboardingCompleted: true,
  });

  const finish = async () => {
    if (!isAuthenticated || !user) {
      // Convex auth lags Clerk by a moment on first load (it has to fetch a
      // JWT); tell the user rather than swallowing the click.
      setSaveError("Still connecting to your account — please try again in a moment.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await saveProfile(buildPayload());
      document.cookie = ONBOARDED_COOKIE;
      window.location.href = "/dashboard";
    } catch (e) {
      console.error("Failed to save profile", e);
      setSaveError(e.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  const canContinue =
    currentStep === 1
      ? business.name.trim().length > 0
      : currentStep === 2
        ? guests.businessType !== ""
        : sound.genres.length >= 1 && sound.mood !== "";

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

  const hoverWhite = (e) => (e.currentTarget.style.color = "#fff");
  const hoverDim = (e) => (e.currentTarget.style.color = "rgba(255,255,255,.4)");

  return (
    <AuthShell>
      <div style={cardStyle}>
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {currentStep === 1 && <Step1 business={business} setBusiness={setBusiness} />}
        {currentStep === 2 && <Step2 guests={guests} setGuests={setGuests} />}
        {currentStep === 3 && <Step3 sound={sound} setSound={setSound} />}

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
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 28,
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                style={ghostBtnStyle}
                onMouseEnter={hoverWhite}
                onMouseLeave={hoverDim}
              >
                ← Back
              </button>
            )}
            {/* Zero-commitment path: account exists, preferences can wait. */}
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              style={ghostBtnStyle}
              onMouseEnter={hoverWhite}
              onMouseLeave={hoverDim}
            >
              Skip for now
            </button>
          </div>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canContinue}
              style={primaryBtnStyle}
              onMouseEnter={(e) => {
                if (canContinue) e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={saving || !canContinue}
              style={primaryBtnStyle}
              onMouseEnter={(e) => {
                if (!saving && canContinue)
                  e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
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
