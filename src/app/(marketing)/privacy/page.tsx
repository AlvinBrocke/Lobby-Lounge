import type { Metadata } from "next";
import { MarketingPage } from "@/components/landing/MarketingPage";

export const metadata: Metadata = { title: "Privacy · Lobby & Lounge" };

// DRAFT — replace section bodies with the final reviewed policy.
export default function PrivacyPage() {
  return (
    <MarketingPage eyebrow="Legal" title="Privacy Policy" draft>
      <p><small>Last updated: September 2026</small></p>

      <h2>1. Who we are</h2>
      <p>Lobby &amp; Lounge provides licensed background music for businesses. This policy explains what personal data we collect when you use the website and app, and how we use it.</p>

      <h2>2. What we collect</h2>
      <ul>
        <li><b>Account data</b> — your name, email address and sign-in method, handled by our authentication provider (Clerk).</li>
        <li><b>Business details</b> — the business name, location, type and music preferences you give us during onboarding.</li>
        <li><b>Usage data</b> — which channels and features you use, so we can improve the service.</li>
        <li><b>Payment data</b> — handled entirely by Stripe. We never see or store card numbers.</li>
      </ul>

      <h2>3. How we use it</h2>
      <p>To run your account, play music in your venue, personalise channel suggestions, provide support, and bill Premium subscriptions.</p>

      <h2>4. Who we share it with</h2>
      <p>Only the service providers needed to run the product: authentication (Clerk), database hosting (Convex), payments (Stripe) and hosting (Vercel). We do not sell personal data.</p>

      <h2>5. Your rights</h2>
      <p>You can access, correct or delete your data at any time by contacting us. Deleting your account removes your profile and preferences.</p>

      <h2>6. Contact</h2>
      <p>Questions about this policy: <a href="/contact">contact us</a>.</p>
    </MarketingPage>
  );
}
