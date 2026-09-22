import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/explore(.*)",
  "/schedule(.*)",
  "/playlists(.*)",
  "/library(.*)",
  "/settings(.*)",
]);

const isOnboardingRoute = createRouteMatcher(["/signup/onboarding(.*)"]);

// Exact paths only — `/signup/onboarding` must stay reachable while signed in.
const isAuthRoute = createRouteMatcher([
  "/signin",
  "/signup",
  "/forgot-password",
]);

// Only same-origin redirect targets are honoured, so `?redirect_url=` can't be
// used to bounce a signed-in user to another site.
function sameOriginRedirect(req: Request, target: string | null, fallback: string) {
  const dest = new URL(fallback, req.url);
  if (!target) return dest;
  try {
    const parsed = new URL(target, req.url);
    if (parsed.origin === dest.origin) return parsed;
  } catch {
    // fall through to the fallback
  }
  return dest;
}

// Layer 1 of auth: a shallow, optimistic check that runs on every request.
// It only reads the session JWT — never the database — so it stays cheap.
// The real authorization happens in the Data Access Layer (src/lib/session.ts)
// and in Convex (convex/lib/auth.ts).
export default clerkMiddleware(async (auth, req) => {
  const isAuth = isAuthRoute(req);
  if (!isAuth && !isProtectedRoute(req) && !isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth();

  // Clerk refuses to start a new sign-in/sign-up while a session is active (it throws
  // `session_exists`), so signed-in users never belong on those pages.
  if (isAuth) {
    if (!isAuthenticated) return NextResponse.next();
    const target = req.nextUrl.searchParams.get("redirect_url");
    return NextResponse.redirect(sameOriginRedirect(req, target, "/dashboard"));
  }

  // Unauthenticated users → sign-in page (Clerk appends redirect_url for us)
  if (!isAuthenticated) return redirectToSignIn({ returnBackUrl: req.url });

  // `metadata` is a custom session-token claim mirroring Clerk publicMetadata,
  // which only the Backend API can write — so it can't be forged client-side.
  const onboarded = sessionClaims?.metadata?.onboardingComplete === true;

  if (isOnboardingRoute(req)) {
    // Already onboarded users have no business on the wizard.
    return onboarded
      ? NextResponse.redirect(new URL("/dashboard", req.url))
      : NextResponse.next();
  }

  // Signed in but not onboarded → finish onboarding first, then come back.
  if (!onboarded) {
    const onboardingUrl = new URL("/signup/onboarding", req.url);
    onboardingUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
