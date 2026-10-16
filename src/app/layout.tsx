import { Geist } from "next/font/google";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Analytics } from "@vercel/analytics/next";

// One family for the whole product — a neutral grotesk close to the wordmark.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lobby & Lounge",
  description: "Music for Business",
  icons: {
    icon: [
      { url: "/favicon-16-white.png", sizes: "16x16" },
      { url: "/favicon-32-white.png", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180" }],
  },
  // Home-screen launch on iPad: full-screen, status bar drawn over the app.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lobby & Lounge",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Draw edge to edge; the app pads itself with env(safe-area-inset-*).
  viewportFit: "cover",
  themeColor: "#0d1628",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geist.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ClerkProvider
          signInUrl="/signin"
          signUpUrl="/signup"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/signup/onboarding"
        >
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
