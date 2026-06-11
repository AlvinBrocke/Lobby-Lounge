"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { Loader2, Mail, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  useEffect(() => {
    if (isSignedIn) router.replace("/dashboard");
  }, [isSignedIn, router]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
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

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/dashboard",
    });
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
            Welcome back
          </h1>
          <p
            style={{
              fontFamily: "var(--ll-font-body)",
              fontSize: 14,
              color: "var(--ll-on-ink-3)",
            }}
          >
            Sign in to manage your venue&apos;s atmosphere
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                fontFamily: "var(--ll-font-body)",
                fontWeight: 700,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: ".12em",
                color: "rgba(255,255,255,.5)",
                marginBottom: 8,
              }}
            >
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 15,
                  height: 15,
                  color: "rgba(255,255,255,.3)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
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
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(78,205,196,.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <label
                style={{
                  fontFamily: "var(--ll-font-body)",
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: ".12em",
                  color: "rgba(255,255,255,.5)",
                }}
              >
                Password
              </label>
              <Link
                href="#"
                style={{
                  fontFamily: "var(--ll-font-body)",
                  fontSize: 12,
                  color: "rgba(255,255,255,.4)",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#fff")}
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "rgba(255,255,255,.4)")
                }
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 15,
                  height: 15,
                  color: "rgba(255,255,255,.3)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
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
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(78,205,196,.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,.1)")}
              />
            </div>
          </div>

          {error && (
            <p
              style={{
                fontFamily: "var(--ll-font-body)",
                fontSize: 13,
                color: "#f87171",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !isLoaded}
            style={{
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
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
            }}
          >
            {loading ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} /> : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "24px 0",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
          <span
            style={{
              fontFamily: "var(--ll-font-body)",
              fontWeight: 700,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".15em",
              color: "rgba(255,255,255,.3)",
            }}
          >
            Or
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
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
            transition: "background .2s, border-color .2s",
            fontFamily: "var(--ll-font-body)",
            fontWeight: 700,
            fontSize: 14,
            color: "rgba(255,255,255,.8)",
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
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: 18, height: 18 }}
          />
          Continue with Google
        </button>

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
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            style={{
              color: "var(--ll-accent)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Register free
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
