"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignUp } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { Loader2, Mail, Lock, KeyRound, ChevronRight } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  paddingLeft: 40,
  paddingRight: 16,
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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--ll-font-body)",
  fontWeight: 700,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".12em",
  color: "rgba(255,255,255,.5)",
  marginBottom: 8,
};

const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  width: 15,
  height: 15,
  color: "rgba(255,255,255,.3)",
  pointerEvents: "none",
};

export default function SignupPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState<"signup" | "verify">("signup");

  useEffect(() => {
    if (isSignedIn) router.replace("/dashboard");
  }, [isSignedIn, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signUp.create({ emailAddress: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/signup/onboarding");
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setStep("verify");
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0].longMessage ?? err.errors[0].message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/signup/onboarding");
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0].longMessage ?? err.errors[0].message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (!isLoaded) return;
    await signUp.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/signup/onboarding",
    });
  };

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    height: 48,
    marginTop: 4,
    background: "var(--ll-accent)",
    color: "var(--ll-accent-ink)",
    border: "none",
    borderRadius: 12,
    fontFamily: "var(--ll-font-body)",
    fontWeight: 700,
    fontSize: 15,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 8px 24px -6px rgba(78,205,196,.5)",
    transition: "opacity .2s, transform .2s",
  };

  return (
    <AuthShell>
      <div
        style={{
          background: "rgba(15,20,25,.55)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "0 40px 80px -20px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {step === "signup" ? (
            <>
              <h1
                style={{
                  fontFamily: "var(--ll-font-display)",
                  fontWeight: 800,
                  fontSize: 28,
                  letterSpacing: "-.025em",
                  color: "#fff",
                  marginBottom: 8,
                }}
              >
                Create your account
              </h1>
              <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 14, color: "var(--ll-on-ink-3)" }}>
                Start your 14-day free business trial
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "rgba(78,205,196,.12)",
                  border: "1px solid rgba(78,205,196,.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Mail style={{ width: 22, height: 22, color: "var(--ll-accent)" }} />
              </div>
              <h1
                style={{
                  fontFamily: "var(--ll-font-display)",
                  fontWeight: 800,
                  fontSize: 28,
                  letterSpacing: "-.025em",
                  color: "#fff",
                  marginBottom: 8,
                }}
              >
                Check your email
              </h1>
              <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 14, color: "var(--ll-on-ink-3)" }}>
                We sent a 6-digit code to{" "}
                <span style={{ color: "#fff", fontWeight: 600 }}>{email}</span>
              </p>
            </>
          )}
        </div>

        {step === "signup" ? (
          <>
            <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail style={iconStyle} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(78,205,196,.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <Lock style={iconStyle} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(78,205,196,.6)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                  />
                </div>
              </div>

              {error && (
                <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 13, color: "#f87171", textAlign: "center" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !isLoaded}
                style={primaryBtn}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
              >
                {loading ? (
                  <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
                ) : (
                  <>
                    Continue
                    <ChevronRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
              <span style={{ fontFamily: "var(--ll-font-body)", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: ".15em", color: "rgba(255,255,255,.3)" }}>
                Or
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
            </div>

            {/* OAuth buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  label: "Continue with Google",
                  icon: (
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      style={{ width: 18, height: 18 }}
                    />
                  ),
                  onClick: () => handleOAuth("oauth_google"),
                },
                {
                  label: "Continue with Apple",
                  icon: (
                    <svg style={{ width: 18, height: 18, fill: "#fff" }} viewBox="0 0 18 18">
                      <path d="M11.833 3.51c.367-1.16.035-2.28-.755-3.097a3.007 3.007 0 0 0-3.009-.64 2.822 2.822 0 0 0-2.202 2.766 2.89 2.89 0 0 0 3.037 3.03c1.071 0 2.298-.826 2.929-2.059Zm-1.637 4.197c-1.332 0-2.585.807-3.328.807-.738 0-1.844-.764-2.883-.746-1.365.02-2.625.795-3.328 2.016-.279.48-.44 1.157-.44 2.146 0 2.21 1.63 4.249 3.25 4.249.774 0 1.488-.52 2.261-.52.753 0 1.405.52 2.259.52 1.558 0 2.868-1.845 3.328-3.024-1.637-.622-2.311-2.146-2.311-3.693 0-1.32.744-2.593 1.836-3.235-.553-.872-1.46-1.428-2.644-1.52Z" />
                    </svg>
                  ),
                  onClick: () => handleOAuth("oauth_apple"),
                },
              ].map(({ label, icon, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  style={{
                    width: "100%",
                    height: 48,
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    cursor: "pointer",
                    fontFamily: "var(--ll-font-body)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "rgba(255,255,255,.8)",
                    transition: "background .2s, border-color .2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.09)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,.2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.05)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,.1)";
                  }}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            <p style={{ marginTop: 24, textAlign: "center", fontFamily: "var(--ll-font-body)", fontSize: 13, color: "rgba(255,255,255,.4)" }}>
              Already have an account?{" "}
              <Link href="/signin" style={{ color: "var(--ll-accent)", fontWeight: 700, textDecoration: "none" }}>
                Sign In
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Verification Code</label>
              <div style={{ position: "relative" }}>
                <KeyRound style={iconStyle} />
                <input
                  type="text"
                  required
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    letterSpacing: "0.3em",
                    fontSize: 20,
                    fontWeight: 700,
                    paddingLeft: 16,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(78,205,196,.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 13, color: "#f87171", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !isLoaded}
              style={primaryBtn}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; }}
            >
              {loading ? (
                <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
              ) : (
                <>
                  Verify Email
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep("signup"); setError(null); setCode(""); }}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--ll-font-body)",
                fontSize: 13,
                color: "rgba(255,255,255,.4)",
                cursor: "pointer",
                transition: "color .2s",
                padding: 0,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,.4)")}
            >
              ← Back to sign up
            </button>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
