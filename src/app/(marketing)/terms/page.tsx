import type { Metadata } from "next";
import { MarketingPage } from "@/components/landing/MarketingPage";

export const metadata: Metadata = { title: "Terms · Lobby & Lounge" };

// DRAFT — replace section bodies with the final reviewed terms.
export default function TermsPage() {
  return (
    <MarketingPage eyebrow="Legal" title="Terms of Service" draft>
      <p><small>Last updated: September 2026</small></p>

      <h2>1. The service</h2>
      <p>Lobby &amp; Lounge gives businesses access to a catalogue of music licensed for commercial background use, played through a web application.</p>

      <h2>2. Your account</h2>
      <p>You must be authorised to act for the business you register. Keep your sign-in details secure; you are responsible for activity under your account.</p>

      <h2>3. Plans and billing</h2>
      <p>Starter is free for your first month and requires no payment details. Premium is billed monthly through Stripe and can be cancelled at any time; access continues to the end of the paid period. Prices are shown in US dollars.</p>

      <h2>4. Permitted use</h2>
      <p>Music may be played as background music in the business premises registered to your account. You may not redistribute, record or resell the audio, or use it in broadcasts or advertising.</p>

      <h2>5. Licensing</h2>
      <p>Our catalogue covers the commercial streaming right. Public performance licences may still be required in your territory — see <a href="/licensing">Licensing</a>.</p>

      <h2>6. Availability and changes</h2>
      <p>We aim for the service to be available at all times but do not guarantee uninterrupted access. We may update features and these terms; material changes will be communicated by email.</p>

      <h2>7. Liability</h2>
      <p>To the extent permitted by law, our liability is limited to the fees you paid in the twelve months before the claim.</p>

      <h2>8. Contact</h2>
      <p>Questions about these terms: <a href="/contact">contact us</a>.</p>
    </MarketingPage>
  );
}
