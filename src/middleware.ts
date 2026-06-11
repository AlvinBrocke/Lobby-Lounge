<<<<<<< HEAD
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: "/integrations/:path*",
};

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-createxyz-project-id",
    "7b837af5-2692-48ee-a8a5-64d795616388",
  );
  requestHeaders.set(
    "x-createxyz-project-group-id",
    "6502ceff-ca4d-420a-9975-28bab8b2483c",
  );

  request.nextUrl.href = `https://www.createanything.com/${request.nextUrl.pathname}`;

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  });
}
=======
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/explore(.*)",
  "/schedule(.*)",
  "/playlist(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(api|trpc)(.*)",
  ],
};
>>>>>>> feature/ui-ux
