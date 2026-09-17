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

// Layer 1 of auth: a shallow, optimistic check that runs on every request.
// It only reads the session JWT — never the database — so it stays cheap.
// The real authorization happens in the Data Access Layer (src/lib/session.ts)
// and in Convex (convex/lib/auth.ts).
export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req) && !isOnboardingRoute(req)) {
    return NextResponse.next();
  }

  const { isAuthenticated, sessionClaims, redirectToSignIn } = await auth();

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
