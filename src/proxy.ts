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

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return NextResponse.next();

  // Unauthenticated users → sign-in page
  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated users who haven't completed onboarding → onboarding page
  const hasOnboarded = req.cookies.get("ll-onboarded")?.value === "true";
  if (!hasOnboarded) {
    return NextResponse.redirect(new URL("/signup/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
