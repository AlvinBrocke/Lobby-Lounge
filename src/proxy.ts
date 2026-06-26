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

  // Fast path: cookie already set
  const hasOnboarded = req.cookies.get("ll-onboarded")?.value === "true";
  if (hasOnboarded) return NextResponse.next();

  // Cookie absent — check Supabase in case this is an existing user
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  try {
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?clerk_user_id=eq.${userId}&select=onboarding_completed&limit=1`,
      { headers: { apikey: supabaseKey!, Authorization: `Bearer ${supabaseKey}` } },
    );
    const rows: { onboarding_completed: boolean }[] = await profileRes.json();

    if (rows.length > 0 && rows[0].onboarding_completed === true) {
      // Backfill the cookie so this check only runs once
      const response = NextResponse.next();
      response.cookies.set("ll-onboarded", "true", { path: "/", maxAge: 31536000 });
      return response;
    }
  } catch {
    // Supabase unreachable — fail open so users aren't locked out
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/signup/onboarding", req.url));
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
