import type { Metadata } from "next";
import { MarketingPage } from "@/components/landing/MarketingPage";

export const metadata: Metadata = { title: "Help centre · Lobby & Lounge" };

// Keep these honest: every answer describes something the app does today.
const faqs = [
  {
    q: "How do I get started?",
    a: "Create an account with your email (or Google / Apple), confirm the 6-digit code we send you, and tell us a little about your business. You'll land on the dashboard with channels ready to play. The first month is free and no card is needed.",
  },
  {
    q: "How do I play music?",
    a: "On the dashboard, tap any channel tile — Lounge & Chill, Dinner Jazz, Morning Boost and so on. Playback starts in the browser. Use the player bar at the bottom to pause, skip and adjust volume.",
  },
  {
    q: "Is the music really licensed for my business?",
    a: "Yes. Every track in the catalogue is cleared for commercial background use. A personal Spotify or Apple Music subscription is not — see our Licensing page for the plain-English version.",
  },
  {
    q: "What device do I need?",
    a: "Anything with a modern browser: the laptop behind the bar, a tablet at reception, or a phone plugged into your speakers. There is nothing to install.",
  },
  {
    q: "Can I schedule different music for different times of day?",
    a: "Weekly scheduling is part of the Premium plan. You assign a channel to any hour of any day of the week — breakfast calm, lunch energy, evening wind-down — and it repeats every week.",
  },
  {
    q: "Can I make my own playlists?",
    a: "Premium accounts can build playlists from the licensed catalogue for the moments that matter to your venue.",
  },
  {
    q: "How do I change my business name or preferences?",
    a: "Open Settings from the sidebar. Your venue name is editable there; genre and mood preferences from onboarding can be updated in the same place.",
  },
  {
    q: "How do I cancel?",
    a: "Starter is free and needs no cancellation. Premium is billed monthly through Stripe and can be cancelled at any time from the receipt email or by contacting us — you keep access until the end of the paid month.",
  },
];

export default function HelpPage() {
  return (
    <MarketingPage
      eyebrow="Help centre"
      title="Answers, not tickets."
      intro="Short answers to the questions we hear most. If yours isn't here, contact us and we'll add it."
    >
      {faqs.map(({ q, a }) => (
        <div className="ll-card" key={q}>
          <h3>{q}</h3>
          <p>{a}</p>
        </div>
      ))}
      <p style={{ marginTop: 28 }}>
        Still stuck? <a href="/contact">Get in touch</a>.
      </p>
    </MarketingPage>
  );
}
