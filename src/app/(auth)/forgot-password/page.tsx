"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
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

const focus = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.target.style.borderColor = "rgba(78,205,196,.6)");
const blur = (e: React.FocusEvent<HTMLInputElement>) =>
  (e.target.style.borderColor = "rgba(255,255,255,.1)");

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  // Already signed in — password changes belong in Settings.
  useEffect(() => {
    if (isSignedIn) router.replace("/settings");
  }, [isSignedIn, router]);

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showError = (err: unknown) => {
    if (isClerkAPIResponseError(err)) {
      setError(err.errors[0].longMessage ?? err.errors[0].message);
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  // Step 1: ask Clerk to email a reset code. This works for accounts that
  // signed up with Google too — Clerk treats it as "create a password".
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("reset");
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the code, then set the new password. A successful reset
  // signs the user in, so we activate the session and go to the dashboard.
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      });
      if (attempt.status !== "needs_new_password") {
        setError("Unexpected state. Please start over.");
        return;
      }
      const result = await signIn.resetPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      }
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
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
            {step === "email" ? (
              <KeyRound style={{ width: 22, height: 22, color: "var(--ll-accent)" }} />
            ) : (
              <Mail style={{ width: 22, height: 22, color: "var(--ll-accent)" }} />
            )}
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
            {step === "email" ? "Reset your password" : "Check your email"}
          </h1>
          <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 14, color: "var(--ll-on-ink-3)" }}>
            {step === "email" ? (
              "Enter your email and we'll send you a code. Works for Google accounts too."
            ) : (
              <>
                We sent a 6-digit code to{" "}
                <span style={{ color: "#fff", fontWeight: 600 }}>{email}</span>
              </>
            )}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendCode} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 13, color: "#f87171", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading || !isLoaded} style={primaryBtn}>
              {loading ? (
                <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
              ) : (
                <>
                  Send code
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Verification Code</label>
              <div style={{ position: "relative" }}>
                <KeyRound style={iconStyle} />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={inputStyle}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: "relative" }}>
                <Lock style={iconStyle} />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock style={iconStyle} />
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  style={inputStyle}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontFamily: "var(--ll-font-body)", fontSize: 13, color: "#f87171", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading || !isLoaded} style={primaryBtn}>
              {loading ? (
                <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" />
              ) : (
                "Set new password"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--ll-font-body)",
                fontSize: 12,
                color: "rgba(255,255,255,.4)",
              }}
            >
              Didn&apos;t get a code? Try again
            </button>
          </form>
        )}

        {/* Footer */}
        <p
          style={{
            marginTop: 24,
            textAlign: "center",
            fontFamily: "var(--ll-font-body)",
            fontSize: 13,
            color: "rgba(255,255,255,.4)",
          }}
        >
          Remembered it?{" "}
          <Link href="/signin" style={{ color: "var(--ll-accent)", fontWeight: 700, textDecoration: "none" }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
