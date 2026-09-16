import type { Metadata } from "next";
import { MarketingPage } from "@/components/landing/MarketingPage";

export const metadata: Metadata = { title: "About · Lobby & Lounge" };

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About"
      title="Music for the rooms people remember."
      intro="Lobby & Lounge is a licensed background-music service for hospitality — built to run in a browser, in any venue, without hardware or a licensing headache."
    >
      <h2>What we do</h2>
      <p>
        Most venues play music from a personal streaming account and hope for the best. Lobby &amp; Lounge replaces that with a catalogue that is cleared for commercial use, organised into channels for every part of the day, and controlled from a dashboard that works on whatever device is already behind the bar.
      </p>
      <p>
        Pick a channel and press play, build your own playlists from the catalogue, or schedule the whole week so the room changes mood on its own. Everything is refreshed weekly.
      </p>

      <h2>Where we are</h2>
      <p>
        We are an early-stage startup. The product you see today is the first version, built around the essentials: licensed music, simple control, and honest pricing. We&apos;d rather ship something small that works than promise features that don&apos;t exist yet.
      </p>
      <p>
        If you run a café, bar, hotel, gym or shop and want to help shape what comes next, <a href="/contact">we&apos;d like to hear from you</a>.
      </p>
    </MarketingPage>
  );
}
