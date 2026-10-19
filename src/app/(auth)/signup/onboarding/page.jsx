"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Briefcase,
  Check,
  ChevronRight,
  Clapperboard,
  Dumbbell,
  Flower2,
  Hotel,
  Landmark,
  Laptop,
  PartyPopper,
  Sailboat,
  Scissors,
  ShoppingBag,
  ShoppingBasket,
  Sun,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { StepBar } from "@/components/auth/StepBar";
import {
  cardStripStyle,
  cardStyle,
  errorStyle,
  focusIn,
  focusOut,
  ghostButtonStyle,
  headingStyle,
  inputStyle,
  labelStyle,
  primaryButtonStyle,
  subTextStyle,
} from "@/components/auth/authStyles";
import {
  AGE_GROUPS,
  AUDIENCE_GENDERS,
  BUSINESS_TYPES,
  GENRES,
  LIFESTYLES,
  MAX_GENRES,
  TEMPOS,
  VOLUME_LEVELS,
} from "@/lib/preferences";
import { completeOnboarding, syncOnboardingClaim } from "./actions";

// Where to send the user once onboarding is done. Middleware passes the page
// they originally asked for as ?redirect_url=; only trust same-origin paths.
function nextUrl() {
  const target = new URLSearchParams(window.location.search).get("redirect_url");
  if (target && target.startsWith("/") && !target.startsWith("//")) {
    return target;
  }
  return "/dashboard";
}

const BUSINESS_ICONS = [
  Hotel,
  UtensilsCrossed,
  ShoppingBag,
  Flower2,
  Briefcase,
  Wine,
  Laptop,
  Dumbbell,
  PartyPopper,
  Sun,
  Landmark,
  Scissors,
  ShoppingBasket,
  Sailboat,
  Clapperboard,
];

const photo = (name) => `/images/onboarding/${name}.jpg`;
const toggle = (list, item) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

// ─── Reusable inputs ──────────────────────────────────────────────────────────

const sectionLabelStyle = { ...labelStyle, marginBottom: 10 };

function SelectedBadge() {
  return (
    <span
      style={{
        position: "absolute",
        top: 6,
        right: 6,
        width: 18,
        height: 18,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: "var(--ll-accent)",
        color: "var(--ll-accent-ink)",
      }}
    >
      <Check style={{ width: 11, height: 11 }} strokeWidth={3} />
    </span>
  );
}

/** Photo tile with a label along the bottom (gender, lifestyle, genre). */
function PhotoCard({ src, label, selected, disabled = false, onClick, height = 76 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      style={{
        position: "relative",
        height,
        padding: 0,
        overflow: "hidden",
        borderRadius: 14,
        border: `2px solid ${selected ? "var(--ll-accent)" : "transparent"}`,
        boxShadow: selected ? "0 0 0 2px var(--ll-auth-focus)" : "none",
        background: "var(--ll-auth-hover)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "box-shadow .2s, border-color .2s, opacity .2s",
      }}
    >
      <img
        src={src}
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: selected
            ? "linear-gradient(180deg, transparent 30%, rgba(22,127,145,.85) 100%)"
            : "linear-gradient(180deg, transparent 30%, rgba(32,40,111,.8) 100%)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: 6,
          right: 6,
          bottom: 7,
          fontFamily: "var(--ll-font-body)",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: 1.15,
          color: "#fff",
          textAlign: "center",
        }}
      >
        {label}
      </span>
      {selected && <SelectedBadge />}
    </button>
  );
}

/** Text tile for single/multi selects that have no photo. */
function OptionCard({ selected, onClick, children, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        position: "relative",
        borderRadius: 14,
        padding: "12px 10px",
        cursor: "pointer",
        border: `1.5px solid ${selected ? "var(--ll-accent)" : "var(--ll-auth-line)"}`,
        background: selected ? "var(--ll-auth-ghost)" : "var(--ll-auth-field)",
        color: "var(--ll-auth-text)",
        fontFamily: "var(--ll-font-body)",
        transition: "background .2s, border-color .2s",
        ...style,
      }}
    >
      {children}
      {selected && <SelectedBadge />}
    </button>
  );
}

/** The design's 3-way segmented control (Tempo, Volume). */
function Segmented({ label, options, value, onChange }) {
  return (
    <div>
      <span style={sectionLabelStyle}>{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
          gap: 4,
          padding: 4,
          borderRadius: 14,
          background: "var(--ll-auth-hover)",
        }}
      >
        {options.map((o) => {
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.id)}
              style={{
                padding: "10px 6px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: on ? "var(--ll-accent)" : "transparent",
                color: on ? "var(--ll-accent-ink)" : "var(--ll-auth-text)",
                fontFamily: "var(--ll-font-body)",
                transition: "background .2s, color .2s",
              }}
            >
              <span style={{ display: "block", fontWeight: 700, fontSize: 14 }}>{o.name}</span>
              <span style={{ display: "block", fontSize: 11, opacity: 0.75, marginTop: 2 }}>{o.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1 — Business ────────────────────────────────────────────────────────

function StepBusiness({ business, setBusiness }) {
  return (
    <div>
      <h1 style={headingStyle}>What kind of business?</h1>
      <p style={subTextStyle}>This shapes your music recommendations.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <label style={{ display: "block" }}>
          <span style={labelStyle}>Business name</span>
          <input
            type="text"
            placeholder="e.g. The Grand Café"
            value={business.name}
            onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))}
            style={{ ...inputStyle, paddingLeft: 16 }}
            onFocus={focusIn}
            onBlur={focusOut}
            autoFocus
          />
        </label>

        <div>
          <span style={sectionLabelStyle}>Business type</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))", gap: 8 }}>
            {BUSINESS_TYPES.map((t, i) => {
              const Icon = BUSINESS_ICONS[i];
              const on = business.type === t;
              return (
                <OptionCard
                  key={t}
                  selected={on}
                  onClick={() => setBusiness((b) => ({ ...b, type: t, other: "" }))}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    minHeight: 92,
                    justifyContent: "center",
                  }}
                >
                  <Icon style={{ width: 22, height: 22, color: on ? "var(--ll-accent)" : "var(--ll-auth-text-2)" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.2, textAlign: "center" }}>{t}</span>
                </OptionCard>
              );
            })}
          </div>
        </div>

        <label style={{ display: "block" }}>
          <span style={labelStyle}>Other — not listed above?</span>
          <input
            type="text"
            placeholder="Describe your business"
            value={business.other}
            maxLength={100}
            onChange={(e) => setBusiness((b) => ({ ...b, other: e.target.value, type: "" }))}
            style={{ ...inputStyle, paddingLeft: 16 }}
            onFocus={focusIn}
            onBlur={focusOut}
          />
        </label>
      </div>
    </div>
  );
}

// ─── Step 2 — Audience ────────────────────────────────────────────────────────

function StepAudience({ audience, setAudience }) {
  return (
    <div>
      <h1 style={headingStyle}>Who&apos;s your target audience?</h1>
      <p style={subTextStyle}>Helps us match music energy to your guests.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div>
          <span style={sectionLabelStyle}>Gender</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {AUDIENCE_GENDERS.map((g) => (
              <PhotoCard
                key={g.id}
                src={photo(`gender-${g.id}`)}
                label={g.name}
                height={88}
                selected={audience.gender === g.id}
                onClick={() => setAudience((a) => ({ ...a, gender: g.id }))}
              />
            ))}
          </div>
        </div>

        <div>
          <span style={sectionLabelStyle}>Age groups on your floor — pick all that apply</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))", gap: 8 }}>
            {AGE_GROUPS.map((g) => (
              <OptionCard
                key={g.id}
                selected={audience.ages.includes(g.id)}
                onClick={() => setAudience((a) => ({ ...a, ages: toggle(a.ages, g.id) }))}
                style={{ textAlign: "left" }}
              >
                <span style={{ display: "block", fontWeight: 700, fontSize: 14 }}>{g.name}</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--ll-auth-text-2)", marginTop: 2 }}>
                  {g.years}
                </span>
                <span style={{ display: "block", fontSize: 11, color: "var(--ll-auth-muted)", marginTop: 4 }}>
                  {g.description}
                </span>
              </OptionCard>
            ))}
          </div>
        </div>

        <div>
          <span style={sectionLabelStyle}>Lifestyle — pick all that apply</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {LIFESTYLES.map((l) => (
              <PhotoCard
                key={l}
                src={photo(`lifestyle-${l.toLowerCase()}`)}
                label={l}
                height={68}
                selected={audience.lifestyles.includes(l)}
                onClick={() => setAudience((a) => ({ ...a, lifestyles: toggle(a.lifestyles, l) }))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 — Genres ──────────────────────────────────────────────────────────

function StepGenres({ genres, setGenres }) {
  const full = genres.length >= MAX_GENRES;
  const nameOf = (id) => GENRES.find((g) => g.id === id)?.name ?? id;

  return (
    <div>
      <h1 style={headingStyle}>Build your mix</h1>
      <p style={subTextStyle}>Tap up to {MAX_GENRES} genres. You can change them any time in Settings.</p>

      {/* The design's "mix box" */}
      <div
        aria-live="polite"
        style={{
          minHeight: 64,
          padding: 12,
          marginBottom: 18,
          borderRadius: 16,
          border: "1.5px dashed var(--ll-auth-line)",
          background: "var(--ll-auth-hover)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
        }}
      >
        {genres.length === 0 ? (
          <span style={{ fontFamily: "var(--ll-font-body)", fontSize: 13, color: "var(--ll-auth-muted)" }}>
            Your mix is empty. Pick genres below.
          </span>
        ) : (
          genres.map((id) => (
            <span
              key={id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 6px 4px 4px",
                borderRadius: 999,
                background: "var(--ll-auth-card)",
                border: "1px solid var(--ll-auth-line)",
                fontFamily: "var(--ll-font-body)",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--ll-auth-text)",
              }}
            >
              <img src={photo(`genre-${id}`)} alt="" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
              {nameOf(id)}
              <button
                type="button"
                onClick={() => setGenres((g) => g.filter((x) => x !== id))}
                aria-label={`Remove ${nameOf(id)}`}
                style={{ ...ghostButtonStyle, display: "flex", padding: 2 }}
              >
                <X style={{ width: 13, height: 13 }} />
              </button>
            </span>
          ))
        )}
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--ll-font-body)",
            fontSize: 12,
            fontWeight: 700,
            color: full ? "var(--ll-accent)" : "var(--ll-auth-muted)",
          }}
        >
          {genres.length}/{MAX_GENRES}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))", gap: 8 }}>
        {GENRES.map((g) => {
          const on = genres.includes(g.id);
          return (
            <PhotoCard
              key={g.id}
              src={photo(`genre-${g.id}`)}
              label={g.name}
              height={84}
              selected={on}
              disabled={full && !on}
              onClick={() => setGenres((list) => toggle(list, g.id))}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4 — Playback ────────────────────────────────────────────────────────

function StepPlayback({ playback, setPlayback }) {
  return (
    <div>
      <h1 style={headingStyle}>Customise mood</h1>
      <p style={subTextStyle}>Set the energy for your space.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Segmented
          label="Tempo"
          options={TEMPOS}
          value={playback.tempo}
          onChange={(tempo) => setPlayback((p) => ({ ...p, tempo }))}
        />
        <Segmented
          label="Volume"
          options={VOLUME_LEVELS}
          value={playback.volume}
          onChange={(volume) => setPlayback((p) => ({ ...p, volume }))}
        />
      </div>
    </div>
  );
}

// ─── Launch — Your Lobby ──────────────────────────────────────────────────────

function Vinyl({ ready }) {
  return (
    <svg
      width={140}
      height={140}
      viewBox="0 0 140 140"
      aria-hidden
      className="animate-spin"
      // Spins fast while saving, then slows right down once everything is set.
      style={{ animationDuration: ready ? "6s" : "1.4s" }}
    >
      <circle cx={70} cy={70} r={68} fill="#0a0f1e" stroke="var(--ll-auth-line)" />
      {[58, 50, 42, 34, 27].map((r) => (
        <circle key={r} cx={70} cy={70} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={1.2} />
      ))}
      <circle cx={70} cy={70} r={22} fill="url(#ll-vinyl-label)" />
      <path d="M 70,5 A 65,65 0 0,1 135,70" fill="none" stroke="#22D3C2" strokeWidth={1.5} opacity={0.45} strokeLinecap="round" />
      <circle cx={70} cy={70} r={3.5} fill="#fff" />
      <defs>
        <linearGradient id="ll-vinyl-label" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#20286F" />
          <stop offset="100%" stopColor="#22B9AE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function LaunchScreen({ ready, chips, onEnter }) {
  const [almost, setAlmost] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAlmost(true), 1800);
    return () => clearTimeout(t);
  }, []);

  // "All set" only once the save has really finished, never on a timer.
  const title = ready ? "Your Lobby & Lounge is all set!" : almost ? "Almost there…" : "Sit tight…";
  const detail = ready
    ? `Built from your ${chips.length} saved choice${chips.length === 1 ? "" : "s"}.`
    : almost
      ? "Curating your first playlists…"
      : "Saving your preferences…";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 20, padding: "8px 0" }}>
      <Vinyl ready={ready} />
      <div role="status" aria-live="polite">
        <p style={{ ...headingStyle, fontSize: 22, color: ready ? "var(--ll-accent)" : "var(--ll-auth-text)" }}>{title}</p>
        <p style={{ ...subTextStyle, margin: 0 }}>{detail}</p>
      </div>
      {chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {chips.map((c) => (
            <span
              key={c}
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                background: "var(--ll-auth-ghost)",
                border: "1px solid var(--ll-auth-line)",
                fontFamily: "var(--ll-font-body)",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--ll-accent)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
      {ready && (
        <button type="button" onClick={onEnter} style={primaryButtonStyle(false)} autoFocus>
          Enter your Lobby
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

function MainComponent() {
  const { user } = useUser();
  const { session } = useSession();

  // proxy.ts reads the onboarding claim from the session JWT cookie, which Clerk
  // caches for ~60s. Once the server has set publicMetadata, mint a fresh token
  // so the very next request carries the claim — otherwise middleware sees the
  // stale token and bounces the user straight back here.
  const refreshClaims = async () => {
    await user.reload();
    await session?.getToken({ skipCache: true });
  };
  const { isAuthenticated } = useConvexAuth();
  // Existing profile — used to bounce users who already onboarded (on another
  // browser, or before the JWT claim existed) straight on without the wizard.
  const profile = useQuery(api.userProfiles.get, isAuthenticated ? {} : "skip");

  const [currentStep, setCurrentStep] = useState(1);
  // True from the moment finish() starts until the user leaves for the app. The
  // Lobby screen stays up through the save, which flips `profile` to onboarded.
  const [launching, setLaunching] = useState(false);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [business, setBusiness] = useState({ name: "", type: "", other: "" });
  const [audience, setAudience] = useState({ gender: "", ages: [], lifestyles: [] });
  const [genres, setGenres] = useState([]);
  const [playback, setPlayback] = useState({ tempo: "mid", volume: "mid" });

  // Users who finished onboarding before the JWT claim existed land here because
  // middleware doesn't see the claim yet. Their Convex profile is the source of
  // truth, so sync the claim and send them on without showing the wizard.
  // Skip while launching: our own save flips `profile` to onboarded mid-way,
  // and racing it here aborts one of the two requests on navigation.
  const alreadyOnboarded = profile?.onboardingCompleted === true;
  useEffect(() => {
    if (!alreadyOnboarded || !user || launching) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await syncOnboardingClaim();
        if (!res.ok) throw new Error(res.error);
        await refreshClaims();
        if (!cancelled) window.location.assign(nextUrl());
      } catch (e) {
        console.error("Failed to sync onboarding claim", e);
        if (!cancelled) setSaveError("Something went wrong. Please refresh.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [alreadyOnboarded, user, launching]);

  const businessType = business.other.trim() || business.type;

  // Everything is optional on the backend, so the same payload serves both
  // "Launch" and "Skip for now" — blanks are simply left undefined. Playback is
  // only sent from Launch, so skipping never overwrites sound settings.
  const buildPayload = (withPlayback) => ({
    displayName: user?.fullName || user?.firstName || "",
    venueName: business.name.trim() || undefined,
    businessType: businessType || undefined,
    audienceGender: audience.gender || undefined,
    ageGroups: audience.ages.length > 0 ? audience.ages : undefined,
    guestDemographics: audience.lifestyles.length > 0 ? audience.lifestyles : undefined,
    genres,
    ...(withPlayback && {
      tempo: playback.tempo,
      defaultVolume: VOLUME_LEVELS.find((v) => v.id === playback.volume)?.value,
    }),
    onboardingCompleted: true,
  });

  const chipsFor = (withPlayback) =>
    [
      businessType,
      audience.gender && `Audience: ${AUDIENCE_GENDERS.find((g) => g.id === audience.gender)?.name}`,
      ...AGE_GROUPS.filter((g) => audience.ages.includes(g.id)).map((g) => g.name),
      ...audience.lifestyles,
      ...genres.map((id) => GENRES.find((g) => g.id === id)?.name),
      withPlayback && `${TEMPOS.find((t) => t.id === playback.tempo)?.name} tempo`,
      withPlayback && `${VOLUME_LEVELS.find((v) => v.id === playback.volume)?.name} volume`,
    ].filter(Boolean);

  const [chips, setChips] = useState([]);

  const finish = async (withPlayback) => {
    if (!isAuthenticated || !user) {
      // Convex auth lags Clerk by a moment on first load (it has to fetch a
      // JWT); tell the user rather than swallowing the click.
      setSaveError("Still connecting to your account — please try again in a moment.");
      return;
    }
    setChips(chipsFor(withPlayback));
    setLaunching(true);
    setReady(false);
    setSaveError(null);
    try {
      const res = await completeOnboarding(buildPayload(withPlayback));
      if (!res.ok) throw new Error(res.error);
      // The claim is only visible to middleware once Clerk mints a new session
      // JWT; refreshClaims() forces that now instead of waiting for the ~60s refresh.
      await refreshClaims();
      setReady(true);
    } catch (e) {
      console.error("Failed to save profile", e);
      setSaveError(e.message || "Something went wrong. Please try again.");
      setLaunching(false);
    }
  };

  // Hard navigation so the refreshed cookie is guaranteed to reach proxy.ts.
  const enter = () => window.location.assign(nextUrl());

  const canContinue = currentStep !== 1 || (business.name.trim().length > 0 && businessType !== "");

  // Don't flash the wizard until we know whether this user has already onboarded.
  if (!launching && (profile === undefined || alreadyOnboarded)) {
    return (
      <AuthShell>
        <div style={cardStyle}>
          <div style={cardStripStyle} />
          <p
            style={{
              fontFamily: "var(--ll-font-body)",
              fontSize: 14,
              color: saveError ? "var(--ll-auth-error)" : "var(--ll-auth-text-2)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {saveError ?? (alreadyOnboarded ? "Finishing up…" : "Loading…")}
          </p>
        </div>
      </AuthShell>
    );
  }

  if (launching) {
    return (
      <AuthShell>
        <div style={cardStyle}>
          <div style={cardStripStyle} />
          <LaunchScreen ready={ready} chips={chips} onEnter={enter} />
        </div>
      </AuthShell>
    );
  }

  const lift = {
    onMouseEnter: (e) => {
      if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-1px)";
    },
    onMouseLeave: (e) => (e.currentTarget.style.transform = "none"),
  };
  const hoverText = {
    onMouseEnter: (e) => (e.currentTarget.style.color = "var(--ll-auth-text)"),
    onMouseLeave: (e) => (e.currentTarget.style.color = "var(--ll-auth-muted)"),
  };

  return (
    <AuthShell wide>
      <div style={cardStyle}>
        <div style={cardStripStyle} />
        <StepBar step={currentStep === 1 ? 3 : 4} />

        {currentStep === 1 && <StepBusiness business={business} setBusiness={setBusiness} />}
        {currentStep === 2 && <StepAudience audience={audience} setAudience={setAudience} />}
        {currentStep === 3 && <StepGenres genres={genres} setGenres={setGenres} />}
        {currentStep === 4 && <StepPlayback playback={playback} setPlayback={setPlayback} />}

        {saveError && <p style={{ ...errorStyle, marginTop: 16 }}>{saveError}</p>}

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
              <button type="button" onClick={() => setCurrentStep((s) => s - 1)} style={ghostButtonStyle} {...hoverText}>
                ← Back
              </button>
            )}
            {/* Zero-commitment path: saves what's picked so far, leaves sound settings alone. */}
            <button type="button" onClick={() => finish(false)} style={ghostButtonStyle} {...hoverText}>
              Skip for now
            </button>
          </div>

          <div style={{ width: 170, flexShrink: 0 }}>
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canContinue}
                style={{ ...primaryButtonStyle(!canContinue), height: 44, fontSize: 14 }}
                {...lift}
              >
                Next
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => finish(true)}
                style={{ ...primaryButtonStyle(false), height: 44, fontSize: 14 }}
                {...lift}
              >
                Launch
                <ChevronRight style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </AuthShell>
  );
}

export default MainComponent;
