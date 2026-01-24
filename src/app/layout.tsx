import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${dmSans.variable} font-sans bg-background text-white`}
      >
        {children}
      </body>
    </html>
  );
}
