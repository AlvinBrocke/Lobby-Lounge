import type { Metadata } from "next";
import { MarketingPage } from "@/components/landing/MarketingPage";

export const metadata: Metadata = { title: "Contact · Lobby & Lounge" };

// TODO: replace with the real support inbox once it exists.
const SUPPORT_EMAIL = "hello@lobbyandlounge.com";

export default function ContactPage() {
  return (
    <MarketingPage
      eyebrow="Contact"
      title="Talk to a person."
      intro="Questions about licensing, pricing, or getting set up in your venue — email us and a real human replies within one business day."
    >
      <div className="ll-card">
        <h3>Email</h3>
        <p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </div>
      <div className="ll-card">
        <h3>Already a customer?</h3>
        <p>
          Include your business name and the email you signed up with so we can find your account quickly. Premium customers get priority support.
        </p>
      </div>
      <p>
        <small>We reply Monday to Friday. For common questions, the <a href="/help">Help centre</a> may be faster.</small>
      </p>
    </MarketingPage>
  );
}
