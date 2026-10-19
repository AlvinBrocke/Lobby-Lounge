"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useClerk, useSignUp, useUser } from "@clerk/nextjs";
import { describeClerkError, isSessionExistsError } from "@/lib/clerkErrors";
import { Loader2, Mail, Lock, User, ChevronRight, Eye, EyeOff, Check, Circle } from "lucide-react";
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
  iconStyle,
  inputStyle,
  labelStyle,
  linkStyle,
  primaryButtonStyle,
  subTextStyle,
} from "@/components/auth/authStyles";

type Step = "entry" | "form" | "verify" | "verified";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shown as a live checklist. Clerk applies its own password policy on top.
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "1 uppercase letter (A–Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "1 number (0–9)", test: (p: string) => /\d/.test(p) },
  { label: "1 special character (!@#$…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={labelStyle}>{label}</span>
      <span style={{ position: "relative", display: "block" }}>
        <Icon style={iconStyle} />
        {children}
      </span>
    </label>
  );
}

const CODE_LENGTH = 6;

/** Six single-digit boxes: typing advances, Backspace goes back, paste fills all. */
function CodeBoxes({
  digits,
  setDigits,
  disabled,
}: {
  digits: string[];
  setDigits: (d: string[]) => void;
  disabled: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (digits.every((d) => !d)) refs.current[0]?.focus();
  }, [digits]);

  const fill = (start: number, text: string) => {
    const incoming = text.replace(/\D/g, "").slice(0, CODE_LENGTH - start).split("");
    if (incoming.length === 0) return;
    const next = [...digits];
    incoming.forEach((d, i) => (next[start + i] = d));
    setDigits(next);
    refs.current[Math.min(start + incoming.length, CODE_LENGTH - 1)]?.focus();
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Verification digit ${i + 1}`}
          maxLength={CODE_LENGTH}
          onChange={(e) => {
            if (e.target.value === "") {
              const next = [...digits];
              next[i] = "";
              setDigits(next);
            } else {
              const v = e.target.value;
              // Typing over a filled box gives two chars; keep the new one. Autofill
              // drops the whole code into one box, and fill() spreads it out.
              fill(i, d && v.length === 2 ? (v[0] === d ? v[1] : v[0]) : v);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            fill(i, e.clipboardData.getData("text"));
          }}
          onFocus={focusIn}
          onBlur={focusOut}
          style={{
            width: 48,
            height: 58,
            textAlign: "center",
            fontFamily: "ui-monospace, monospace",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--ll-auth-text)",
            background: d ? "var(--ll-auth-ghost)" : "var(--ll-auth-field)",
            border: "1.5px solid var(--ll-auth-line)",
            borderRadius: 10,
            outline: "none",
          }}
        />
      ))}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<Step>("entry");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set when arriving from a team invitation email (Settings → Zone & staff).
  const [ticket, setTicket] = useState<string | null>(null);
  // Opened an invitation while already signed in. Clerk can't redeem a ticket over an
  // active session (`session_exists`), so the page offers to sign out first.
  const [inviteBlocked, setInviteBlocked] = useState(false);
  // setActive flips isSignedIn before we can show the "verified" screen; this tells
  // the effect below not to redirect a sign-up that's finishing on this page.
  const finishingHere = useRef(false);

  // Clerk appends `__clerk_status`: "sign_up" for a new email, "sign_in" when it
  // already has an account, "complete" once the invitation is accepted.
  useEffect(() => {
    if (!authLoaded) return;
    const params = new URLSearchParams(window.location.search);
    const t = params.get("__clerk_ticket");
    const status = params.get("__clerk_status");
    if (isSignedIn) {
      if (finishingHere.current) return;
      // `ticket` is only set for signed-out visitors, so someone who has just
      // signed up through the invitation goes on to onboarding as usual.
      if (t && !ticket && status !== "complete") setInviteBlocked(true);
      // Middleware forwards onboarded users to /dashboard, so this never fights the post-signup push.
      else router.replace("/signup/onboarding");
      return;
    }
    if (!t) return;
    if (status === "sign_up") {
      setTicket(t);
      setStep("form"); // invitees have no sign-up method to choose
    } else router.replace(status === "sign_in" ? `/signin?${params}` : "/signin");
  }, [authLoaded, isSignedIn, ticket, router]);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password));

  // First problem in reading order, so the message points at what to fix next.
  const formProblem = () => {
    if (!firstName.trim() || !lastName.trim()) return "Add your first and last name to continue.";
    if (!ticket && !EMAIL_RE.test(email)) return "Enter a valid work email address.";
    if (!passwordValid) return "Complete all four password requirements.";
    if (!agreed) return "Please accept the terms to create your account.";
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    const problem = formProblem();
    if (problem) {
      setError(problem);
      return;
    }
    setLoading(true);
    setError(null);

    const names = { firstName: firstName.trim(), lastName: lastName.trim() };
    try {
      // The ticket carries the (already verified) email, so invitees skip the code step.
      const result = ticket
        ? await signUp.create({ strategy: "ticket", ticket, password, ...names })
        : await signUp.create({ emailAddress: email, password, ...names });
      if (result.status === "complete") {
        finishingHere.current = true;
        await setActive({ session: result.createdSessionId });
        router.push("/signup/onboarding");
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setDigits(Array(CODE_LENGTH).fill(""));
        setResent(false);
        setStep("verify");
      }
    } catch (err) {
      if (isSessionExistsError(err)) {
        router.replace("/dashboard");
        return;
      }
      setError(describeClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (code: string) => {
    if (!isLoaded || loading) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        finishingHere.current = true;
        await setActive({ session: result.createdSessionId });
        setStep("verified");
      }
    } catch (err) {
      if (isSessionExistsError(err)) {
        router.replace("/dashboard");
        return;
      }
      setError(describeClerkError(err));
      // Clearing also stops the auto-submit below from retrying the same wrong code.
      setDigits(Array(CODE_LENGTH).fill(""));
    } finally {
      setLoading(false);
    }
  };

  const code = digits.join("");
  useEffect(() => {
    if (step === "verify" && code.length === CODE_LENGTH) verify(code);
    // Fire once per completed code, so `verify` is deliberately not a dependency.
  }, [code, step]);

  const resend = async () => {
    if (!isLoaded) return;
    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setDigits(Array(CODE_LENGTH).fill(""));
      setResent(true);
    } catch (err) {
      setError(describeClerkError(err));
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded) return;
    setError(null);

    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/signup/onboarding",
      });
    } catch (err) {
      if (isSessionExistsError(err)) {
        router.replace("/dashboard");
        return;
      }
      setError(describeClerkError(err));
    }
  };

  const lift = {
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!e.currentTarget.disabled) e.currentTarget.style.transform = "translateY(-1px)";
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.transform = "none";
    },
  };

  const secondaryButton: React.CSSProperties = {
    width: "100%",
    height: 48,
    background: "var(--ll-auth-field)",
    border: "1px solid var(--ll-auth-line)",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    cursor: "pointer",
    fontFamily: "var(--ll-font-body)",
    fontWeight: 700,
    fontSize: 14,
    color: "var(--ll-auth-text)",
    transition: "background .2s, border-color .2s",
  };

  const errorLine = error && <p style={errorStyle} role="alert">{error}</p>;

  let body: React.ReactNode;

  if (inviteBlocked) {
    body = (
      <>
        <h1 style={headingStyle}>Accept your invitation</h1>
        <p style={subTextStyle}>
          You&apos;re signed in{user ? ` as ${user.primaryEmailAddress?.emailAddress}` : ""}. Sign out first and
          this link will bring you straight back.
        </p>
        <button
          type="button"
          // Back to this same URL, ticket and all, now signed out.
          onClick={() => signOut({ redirectUrl: window.location.pathname + window.location.search })}
          style={primaryButtonStyle(false)}
        >
          Sign out and continue
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </>
    );
  } else if (step === "entry") {
    body = (
      <>
        {/* Hero strip, full-bleed inside the card */}
        <div
          style={{
            margin: "-40px -36px 28px",
            padding: "56px 36px 26px",
            background: "var(--ll-auth-grad)",
            color: "#fff",
          }}
        >
          <p
            style={{
              margin: "0 0 4px",
              fontFamily: "var(--ll-font-body)",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#7FEFE3",
            }}
          >
            Music for Business.
          </p>
          <h1 style={{ ...headingStyle, color: "#fff", fontSize: 30, margin: 0 }}>Play legal.</h1>
        </div>

        <p style={{ ...subTextStyle, textAlign: "center" }}>
          Create your business music account. Free for your first month. No credit card required.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button type="button" onClick={() => setStep("form")} style={primaryButtonStyle(false)} {...lift}>
            Sign up with email
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--ll-auth-line-soft)" }} />
            <span style={{ fontFamily: "var(--ll-font-body)", fontSize: 12, color: "var(--ll-auth-muted)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--ll-auth-line-soft)" }} />
          </div>

          {[
            {
              label: "Continue with Google",
              icon: (
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt=""
                  style={{ width: 18, height: 18 }}
                />
              ),
              onClick: () => handleOAuth("oauth_google"),
            },
            {
              label: "Continue with Apple",
              icon: (
                <svg style={{ width: 18, height: 18, fill: "currentColor" }} viewBox="0 0 18 18" aria-hidden>
                  <path d="M11.833 3.51c.367-1.16.035-2.28-.755-3.097a3.007 3.007 0 0 0-3.009-.64 2.822 2.822 0 0 0-2.202 2.766 2.89 2.89 0 0 0 3.037 3.03c1.071 0 2.298-.826 2.929-2.059Zm-1.637 4.197c-1.332 0-2.585.807-3.328.807-.738 0-1.844-.764-2.883-.746-1.365.02-2.625.795-3.328 2.016-.279.48-.44 1.157-.44 2.146 0 2.21 1.63 4.249 3.25 4.249.774 0 1.488-.52 2.261-.52.753 0 1.405.52 2.259.52 1.558 0 2.868-1.845 3.328-3.024-1.637-.622-2.311-2.146-2.311-3.693 0-1.32.744-2.593 1.836-3.235-.553-.872-1.46-1.428-2.644-1.52Z" />
                </svg>
              ),
              onClick: () => handleOAuth("oauth_apple"),
            },
          ].map(({ label, icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              style={secondaryButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--ll-auth-hover)";
                e.currentTarget.style.borderColor = "var(--ll-auth-focus)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--ll-auth-field)";
                e.currentTarget.style.borderColor = "var(--ll-auth-line)";
              }}
            >
              {icon}
              {label}
            </button>
          ))}

          {errorLine}
        </div>

        <p
          style={{
            margin: "24px 0 0",
            textAlign: "center",
            fontFamily: "var(--ll-font-body)",
            fontSize: 13,
            color: "var(--ll-auth-muted)",
          }}
        >
          Already have an account?{" "}
          <Link href="/signin" style={linkStyle}>
            Sign in
          </Link>
        </p>
      </>
    );
  } else if (step === "form") {
    body = (
      <form onSubmit={handleSignup} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <StepBar step={1} />
          <h1 style={headingStyle}>{ticket ? "Join your team" : "Create your account"}</h1>
          <p style={{ ...subTextStyle, marginBottom: 4 }}>
            {ticket ? "Add your name and choose a password to accept your invitation." : "Use your work email to get started."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="First name" icon={User}>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Alexandra"
              autoComplete="given-name"
              autoFocus
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </Field>
          <Field label="Last name" icon={User}>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Morrison"
              autoComplete="family-name"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </Field>
        </div>

        {!ticket && (
          <Field label="Work email" icon={Mail}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
            />
          </Field>
        )}

        <div>
          <Field label="Password" icon={Lock}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              aria-describedby="password-rules"
              style={{ ...inputStyle, paddingRight: 44 }}
              onFocus={(e) => {
                focusIn(e);
                setPasswordFocused(true);
              }}
              onBlur={focusOut}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                padding: 4,
                cursor: "pointer",
                color: showPassword ? "var(--ll-accent)" : "var(--ll-auth-muted)",
                display: "flex",
              }}
            >
              {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </Field>
          {/* Appears once the field is used, then stays so progress stays visible. */}
          {(passwordFocused || password) && (
            <ul
              id="password-rules"
              style={{
                listStyle: "none",
                margin: "10px 0 0",
                padding: "12px 14px",
                borderRadius: 12,
                background: "var(--ll-auth-hover)",
                display: "grid",
                gap: 6,
              }}
            >
              {PASSWORD_RULES.map(({ label, test }) => {
                const met = test(password);
                return (
                  <li
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "var(--ll-font-body)",
                      fontSize: 12.5,
                      color: met ? "var(--ll-auth-text)" : "var(--ll-auth-muted)",
                    }}
                  >
                    {met ? (
                      <Check style={{ width: 13, height: 13, color: "var(--ll-accent)" }} strokeWidth={3} />
                    ) : (
                      <Circle style={{ width: 11, height: 11 }} />
                    )}
                    {label}
                    <span className="sr-only">{met ? "(done)" : "(not yet)"}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            fontFamily: "var(--ll-font-body)",
            fontSize: 13,
            lineHeight: 1.55,
            color: "var(--ll-auth-text-2)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: 16, height: 16, marginTop: 2, accentColor: "var(--ll-accent)", flexShrink: 0 }}
          />
          <span>
            I agree to the{" "}
            <Link href="/terms" target="_blank" style={linkStyle}>
              Terms of Service
            </Link>
            ,{" "}
            <Link href="/privacy" target="_blank" style={linkStyle}>
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/cookies" target="_blank" style={linkStyle}>
              Cookies Policy
            </Link>{" "}
            of Lobby &amp; Lounge.
          </span>
        </label>

        {errorLine}

        <button type="submit" disabled={loading || !isLoaded} style={primaryButtonStyle(loading)} {...lift}>
          {loading ? (
            <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
          ) : (
            <>
              Create account
              <ChevronRight style={{ width: 16, height: 16 }} />
            </>
          )}
        </button>

        {!ticket && (
          <button
            type="button"
            onClick={() => {
              setStep("entry");
              setError(null);
            }}
            style={ghostButtonStyle}
          >
            ← Other sign-up options
          </button>
        )}
      </form>
    );
  } else if (step === "verify") {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <StepBar step={2} />
          <h1 style={headingStyle}>Check your inbox</h1>
          <p style={{ ...subTextStyle, marginBottom: 0 }}>
            We sent a 6-digit code to{" "}
            <span style={{ color: "var(--ll-accent)", fontWeight: 600 }}>{email}</span>
          </p>
        </div>

        <CodeBoxes digits={digits} setDigits={setDigits} disabled={loading} />

        <p style={{ margin: 0, fontFamily: "var(--ll-font-body)", fontSize: 13, color: "var(--ll-auth-muted)" }}>
          Didn&apos;t receive it?{" "}
          <button type="button" onClick={resend} style={{ ...ghostButtonStyle, ...linkStyle, fontSize: 13 }}>
            Resend code
          </button>
          <br />
          <span role="status" style={{ color: resent ? "var(--ll-accent)" : undefined }}>
            {resent ? "A fresh code has been sent." : "or check your spam folder."}
          </span>
        </p>

        {errorLine}

        <button
          type="button"
          onClick={() => verify(code)}
          disabled={loading || code.length < CODE_LENGTH}
          style={primaryButtonStyle(loading || code.length < CODE_LENGTH)}
          {...lift}
        >
          {loading ? (
            <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
          ) : (
            <>
              Verify
              <ChevronRight style={{ width: 16, height: 16 }} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setStep("form");
            setError(null);
          }}
          style={ghostButtonStyle}
        >
          ← Back to sign up
        </button>
      </div>
    );
  } else {
    body = (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "12px 0" }}>
        <div
          style={{
            width: 86,
            height: 86,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "var(--ll-auth-ghost)",
            boxShadow: "0 0 0 10px rgba(34,211,194,.06)",
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "var(--ll-auth-grad)",
              color: "#fff",
            }}
          >
            <Check style={{ width: 27, height: 27 }} strokeWidth={2.5} />
          </div>
        </div>
        <p
          style={{
            margin: "28px 0 8px",
            fontFamily: "var(--ll-font-body)",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--ll-accent)",
          }}
        >
          Email verified
        </p>
        <h1 style={headingStyle}>You&apos;re successfully verified{firstName.trim() ? `, ${firstName.trim()}` : ""}!</h1>
        <p style={{ ...subTextStyle, maxWidth: 340 }}>
          You&apos;re almost there. A few quick questions shape the right music for your business.
        </p>
        <button
          type="button"
          onClick={() => router.push("/signup/onboarding")}
          style={primaryButtonStyle(false)}
          {...lift}
          autoFocus
        >
          Next: tell us about your business
          <ChevronRight style={{ width: 16, height: 16 }} />
        </button>
      </div>
    );
  }

  return (
    <AuthShell>
      <div style={cardStyle}>
        <div style={cardStripStyle} />
        {body}
      </div>
    </AuthShell>
  );
}
