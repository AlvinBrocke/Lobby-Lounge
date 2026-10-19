"use client";

import type React from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { Loader2, Mail, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  describeClerkError,
  isSessionExistsError,
  safeRedirectPath,
} from "@/lib/clerkErrors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  // `proxy.ts` appends ?redirect_url=… when it bounces a guest off a protected route.
  const afterSignInUrl = safeRedirectPath(searchParams.get("redirect_url"), "/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clerk refuses to start a new sign-in while a session is active, so never let an
  // already-signed-in user sit on this page.
  useEffect(() => {
    if (isSignedIn) router.replace(afterSignInUrl);
  }, [isSignedIn, afterSignInUrl, router]);

  // Team invitation for an existing account (forwarded by /signup): the ticket
  // signs them in and joins the venue in one step. Tickets are single-use, so
  // the ref stops React's dev double-effect from spending it twice.
  const ticket = searchParams.get("__clerk_ticket");
  const ticketUsed = useRef(false);
  useEffect(() => {
    if (!ticket || !isLoaded || isSignedIn || ticketUsed.current) return;
    ticketUsed.current = true;
    signIn
      .create({ strategy: "ticket", ticket })
      .then(async (result) => {
        if (result.status !== "complete") throw new Error("incomplete");
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      })
      .catch((err) => setError(`${describeClerkError(err)} Sign in below to continue.`));
  }, [ticket, isLoaded, isSignedIn, signIn, setActive, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(afterSignInUrl);
      } else {
        // e.g. needs_second_factor / needs_new_password — not handled by this UI yet.
        setError("Additional verification is required to finish signing in.");
      }
    } catch (err) {
      if (isSessionExistsError(err)) {
        router.replace(afterSignInUrl);
        return;
      }
      setError(describeClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setError(null);

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: afterSignInUrl,
      });
    } catch (err) {
      if (isSessionExistsError(err)) {
        router.replace(afterSignInUrl);
        return;
      }
      setError(describeClerkError(err));
    }
  };

  return (
    <AuthShell>
      <div
        style={{
          background: "var(--ll-auth-card)",
          backdropFilter: "blur(24px)",
          border: "1px solid var(--ll-auth-line)",
          borderRadius: 24,
          padding: "40px 36px",
          boxShadow: "0 30px 70px -24px var(--ll-auth-shadow)",
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
              color: "var(--ll-auth-text)",
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
                color: "var(--ll-auth-text-2)",
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
                  color: "var(--ll-auth-muted)",
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
                  background: "var(--ll-auth-field)",
                  border: "1px solid var(--ll-auth-line)",
                  borderRadius: 12,
                  color: "var(--ll-auth-text)",
                  fontFamily: "var(--ll-font-body)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color .2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ll-auth-focus)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ll-auth-line)")}
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
                  color: "var(--ll-auth-text-2)",
                }}
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                style={{
                  fontFamily: "var(--ll-font-body)",
                  fontSize: 12,
                  color: "var(--ll-auth-muted)",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--ll-auth-text)")}
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "var(--ll-auth-muted)")
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
                  color: "var(--ll-auth-muted)",
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
                  background: "var(--ll-auth-field)",
                  border: "1px solid var(--ll-auth-line)",
                  borderRadius: 12,
                  color: "var(--ll-auth-text)",
                  fontFamily: "var(--ll-font-body)",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color .2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ll-auth-focus)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--ll-auth-line)")}
              />
            </div>
          </div>

          {error && (
            <p
              style={{
                fontFamily: "var(--ll-font-body)",
                fontSize: 13,
                color: "var(--ll-auth-error)",
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
              boxShadow: "0 8px 24px -6px var(--ll-auth-glow)",
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
          <div style={{ flex: 1, height: 1, background: "var(--ll-auth-line-soft)" }} />
          <span
            style={{
              fontFamily: "var(--ll-font-body)",
              fontWeight: 700,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: ".15em",
              color: "var(--ll-auth-muted)",
            }}
          >
            Or
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--ll-auth-line-soft)" }} />
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignIn}
          style={{
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
            transition: "background .2s, border-color .2s",
            fontFamily: "var(--ll-font-body)",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--ll-auth-text)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--ll-auth-hover)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ll-auth-focus)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--ll-auth-field)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--ll-auth-line)";
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
            color: "var(--ll-auth-muted)",
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

// `useSearchParams` opts a client component out of prerendering unless it sits inside
// a Suspense boundary, so keep the form as a child and export the wrapper as the page.
export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell>{null}</AuthShell>}>
      <LoginForm />
    </Suspense>
  );
}
