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

// Exact paths only — `/signup/onboarding` must stay reachable while signed in.
const isAuthRoute = createRouteMatcher(["/signin", "/signup", "/forgot-password"]);

const ONBOARDED_COOKIE = "ll-onboarded";
const ONBOARDING_PATH = "/signup/onboarding";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Clerk refuses to start a new sign-in/sign-up while a session is active (it throws
  // `session_exists`), so signed-in users never belong on those pages.
  if (isAuthRoute(req)) {
    if (!userId) return NextResponse.next();
    const target = req.nextUrl.searchParams.get("redirect_url");
    const dest = new URL("/dashboard", req.url);
    if (target) {
      try {
        const parsed = new URL(target, req.url);
        if (parsed.origin === new URL(req.url).origin) {
          dest.pathname = parsed.pathname;
          dest.search = parsed.search;
        }
      } catch {
        // fall through to /dashboard
      }
    }
    return NextResponse.redirect(dest);
  }

  if (!isProtectedRoute(req)) return NextResponse.next();

  // Unauthenticated users → sign-in page
  if (!userId) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Onboarding gate: the onboarding page sets this cookie once the profile is saved.
  if (!req.cookies.get(ONBOARDED_COOKIE)) {
    return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
