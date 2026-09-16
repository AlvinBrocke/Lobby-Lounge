import type { Metadata } from "next";
import { MarketingPage } from "@/components/landing/MarketingPage";

export const metadata: Metadata = { title: "Licensing · Lobby & Lounge" };

export default function LicensingPage() {
  return (
    <MarketingPage
      eyebrow="Licensing"
      title="Why your Spotify account isn't enough."
      intro="Playing music in a business is different from playing it at home. Here's the plain-English version of what the law expects, and how Lobby & Lounge handles it for you."
    >
      <h2>The two fees</h2>
      <p>
        To play music legally in a commercial space you need to think about two separate rights:
      </p>
      <ol>
        <li>
          <b>The right to stream in a commercial setting.</b> A personal subscription (Spotify, Apple Music, YouTube) covers private, non-commercial listening only. Its terms of use exclude playing to the public in a business.
        </li>
        <li>
          <b>The public performance right.</b> Whoever plays music to the public owes the songwriters and publishers a performance royalty, collected through licensing bodies such as PRS/PPL in the UK or ASCAP, BMI and SESAC in the US.
        </li>
      </ol>

      <h2>Most businesses get this wrong</h2>
      <p>
        In a 2021 study of 2,001 US business owners, music decision-makers and staff, <b>56%</b> did not know that using a personal streaming subscription for background music at work is not permitted — and <b>78%</b> of those who subscribe to a music service were using a consumer platform as their primary source at work.
      </p>
      <p>
        <small>Source: MRC Data × Soundtrack Your Brand, B2B Market Research, December 2021.</small>
      </p>

      <h2>How Lobby &amp; Lounge handles it</h2>
      <p>
        Every track in our catalogue is sourced from a provider that clears it for commercial background use, so the streaming right is covered by your subscription. That is the part a personal account can never give you.
      </p>
      <p>
        Public performance obligations vary by country and by the kind of licence you already hold. If you are unsure whether your venue needs a separate performance licence, <a href="/contact">ask us</a> and we&apos;ll point you to the right body for your region.
      </p>

      <hr />
      <p>
        <small>This page is general information, not legal advice. Licensing rules differ by territory — when in doubt, check with your local collecting society.</small>
      </p>
    </MarketingPage>
  );
}
