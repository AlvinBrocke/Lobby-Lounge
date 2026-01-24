import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    },
  );

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser();

  // Protect routes
  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // const protectedRoutes = [
  //   "/dashboard",
  //   "/account",
  //   "/music",
  //   "/schedule",
  //   "/onboarding",
  //   "/playlist",
  // ];
  // const isProtectedRoute = protectedRoutes.some((route) =>
  //   request.nextUrl.pathname.startsWith(route),
  // );

  // if (isProtectedRoute && !user) {
  //   return NextResponse.redirect(new URL("/signin", request.url));
  // }

  // Redirect authenticated users away from auth pages
  // const authRoutes = ["/signin", "/signup"];
  // const isAuthRoute = authRoutes.some(
  //   (route) => request.nextUrl.pathname === route,
  // );

  // if (isAuthRoute && user) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
