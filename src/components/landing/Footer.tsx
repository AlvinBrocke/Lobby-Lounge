import React from "react";
import Image from "next/image";
import Link from "next/link";

const footerCols = [
  {
    title: "Product",
    links: [
      { label: "Licensing", href: "/home#licensing" },
      { label: "How it works", href: "/home#how-it-works" },
      { label: "Business types", href: "/home#business-types" },
      { label: "Pricing", href: "/home#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Research", href: "/home#results" },
      { label: "Talk to sales", href: "mailto:hello@lobbylounge.com" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "Licensing", href: "/home#licensing" },
    ],
  },
];

// Bottom-row legal links. "Do Not Sell or Share" is required by the Privacy
// Policy (§11.B.4) and Cookies Policy (§4); it deep-links to the opt-out toggle.
const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
  { label: "Do Not Sell or Share My Personal Information", href: "/privacy#do-not-sell" },
];

export const Footer = () => (
  <footer className="border-t border-ll-line bg-ll-paper-2 pt-16 pb-10 text-ll-text">
    <div className="ll-container">
      <div className="grid gap-10 border-b border-ll-line pb-12 sm:grid-cols-2 md:grid-cols-[1.6fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="ll-link inline-block rounded-md">
            <Image src="/images/ll-logo-color.png" alt="Lobby & Lounge" width={71} height={30} className="h-[30px] w-auto" />
          </Link>
          <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-ll-text-2">
            Fully licensed, expertly curated background music for hospitality. Set the perfect atmosphere across every space.
          </p>
        </div>

        {footerCols.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h4 className="text-sm font-medium text-ll-text">{col.title}</h4>
            <ul className="mt-4 grid gap-3">
              {col.links.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="ll-link rounded-sm text-sm text-ll-text-2 hover:text-ll-text">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[13px] text-ll-text-2">
        <span>© 2026 Lobby &amp; Lounge. All rights reserved.</span>
        <span className="flex flex-wrap gap-x-5 gap-y-2">
          {legalLinks.map(({ label, href }) => (
            <Link key={href} href={href} className="ll-link rounded-sm hover:text-ll-text">
              {label}
            </Link>
          ))}
        </span>
      </div>
    </div>
  </footer>
);
