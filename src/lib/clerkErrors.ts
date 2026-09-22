import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

/**
 * Clerk rejects `signIn.create` / `authenticateWithRedirect` with this code when a
 * session is already active on the client. It is not really a failure — the user is
 * simply already logged in — so callers should send them onward instead of surfacing
 * an error.
 */
export function isSessionExistsError(err: unknown): boolean {
  return (
    isClerkAPIResponseError(err) &&
    err.errors.some((e) => e.code === "session_exists")
  );
}

/** Human-readable message for any error thrown by a Clerk call. */
export function describeClerkError(err: unknown): string {
  if (isClerkAPIResponseError(err)) {
    const first = err.errors[0];
    return first?.longMessage ?? first?.message ?? "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

/**
 * Only allow same-site relative paths from `?redirect_url=`, so a crafted link
 * can't bounce a freshly signed-in user to an external site.
 */
export function safeRedirectPath(value: string | null, fallback: string): string {
  if (!value) return fallback;
  try {
    const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const url = new URL(value, base);
    if (typeof window !== "undefined" && url.origin !== window.location.origin) return fallback;
    const path = `${url.pathname}${url.search}${url.hash}`;
    return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
  } catch {
    return fallback;
  }
}
