import { Metadata } from "next";
import { LegalPage, Section, Sub, Notice, A, Email, Phone, ContactCard, sectionTitle } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Commercial Terms of Service governing public performance background music licensing from Lobby & Lounge Music Inc.",
};

const sections = [
  { id: "acceptance", title: "Acceptance and commercial purpose" },
  { id: "licensing", title: "Public performance & commercial licensing" },
  { id: "accounts", title: "Account management & zone registration" },
  { id: "billing", title: "Billing, Stripe processing & cancellation" },
  { id: "hardware", title: "Hardware & third-party integrations" },
  { id: "disclaimers", title: "Disclaimers & limitation of liability" },
  { id: "indemnification", title: "Indemnification" },
  { id: "arbitration", title: "Mandatory arbitration & class action waiver" },
  { id: "contact", title: "Contact & notices" },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="September 19, 2026" sections={sections}>
      <Notice>
        THIS AGREEMENT GOVERNS COMMERCIAL PUBLIC PERFORMANCE BACKGROUND MUSIC LICENSING. STANDARD CONSUMER SERVICES (SPOTIFY, APPLE MUSIC, ETC.) DO NOT LEGALLY AUTHORIZE BACKGROUND PLAYBACK IN PUBLIC ESTABLISHMENTS. PLEASE REVIEW <A href="#arbitration">SECTION 8</A> REGARDING MANDATORY ARBITRATION IN NORTH CAROLINA AND CLASS ACTION LITIGATION WAIVERS.
      </Notice>

      <Section id="acceptance" number={1} title={sectionTitle(sections, "acceptance")}>
        <p>
          These Commercial Terms of Service (&quot;Terms&quot; or &quot;Agreement&quot;) constitute a legally binding agreement between Lobby &amp; Lounge Music Inc. (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) and the commercial hospitality establishment or business enterprise (&quot;Customer,&quot; &quot;Client,&quot; &quot;you,&quot; or &quot;your&quot;) accessing or subscribing to our music streaming platform and related applications (the &quot;Services&quot;). By creating an account or playing audio through your establishment&apos;s sound systems, you agree to these Terms.
        </p>
      </Section>

      <Section id="licensing" number={2} title={sectionTitle(sections, "licensing")}>
        <Sub title="A. Grant of License">
          <p>
            Subject to active subscription status and timely fee payment, Company grants Customer a limited, non-exclusive, revocable license to publicly perform sound recordings and musical works cleared through our platform solely as background ambient audio within authorized physical venue zones.
          </p>
        </Sub>
        <Sub title="B. Express Restrictions">
          <ul>
            <li><strong>Prohibited Broadcasting.</strong> Customer shall not re-broadcast, syndicate, or stream the audio feed beyond designated physical premises (e.g., in webcasts or video streams).</li>
            <li><strong>Prohibited Recording.</strong> Customer shall not rip, capture, decompile, or permanently record sound recordings.</li>
            <li><strong>Prohibited Applications.</strong> Audio shall not be used for ticketed concerts, nightclub dance amplification, or synchronized stage plays without supplemental clearance.</li>
          </ul>
        </Sub>
      </Section>

      <Section id="accounts" number={3} title={sectionTitle(sections, "accounts")}>
        <p>
          Customer is responsible for safeguarding account credentials. Hospitality venues with multiple physical audio zones or distinct franchise locations must purchase and maintain active licenses for each designated zone.
        </p>
      </Section>

      <Section id="billing" number={4} title={sectionTitle(sections, "billing")}>
        <p>
          Subscription fees are billed automatically on a recurring monthly or annual basis via Stripe, Inc. Fees are non-refundable for partial billing periods. Cancellations must be initiated prior to the renewal date via <A href="/account">account management</A>.
        </p>
      </Section>

      <Section id="hardware" number={5} title={sectionTitle(sections, "hardware")}>
        <p>
          Customer is responsible for local audio hardware, internet bandwidth, and network amplifiers (including Sonos, Bose, or auxiliary streamers). Where dynamic audio pacing connects to Toast POS or venue sensors, Company evaluates anonymized sales velocity metrics solely to optimize playlist tempo.
        </p>
      </Section>

      <Section id="disclaimers" number={6} title={sectionTitle(sections, "disclaimers")}>
        <p style={{ color: "#fff", fontWeight: 600 }}>
          SERVICES ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. IN NO EVENT SHALL COMPANY BE LIABLE FOR INDIRECT, CONSEQUENTIAL, PUNITIVE, OR LOST PROFIT DAMAGES. AGGREGATE LIABILITY IS STRICTLY LIMITED TO THE FEES ACTUALLY PAID BY CUSTOMER IN THE PRECEDING TWELVE (12) MONTHS.
        </p>
      </Section>

      <Section id="indemnification" number={7} title={sectionTitle(sections, "indemnification")}>
        <p>
          Customer agrees to indemnify Company against third-party claims arising from breach of this Agreement or unauthorized stream re-broadcasting. Company agrees to indemnify Customer against direct third-party copyright claims arising from authorized background playback of our cleared catalog within licensed zones.
        </p>
      </Section>

      <Section id="arbitration" number={8} title={sectionTitle(sections, "arbitration")}>
        <p>
          All claims or disputes shall be settled by binding individual arbitration administered by the American Arbitration Association (AAA) in Raleigh, Wake County, North Carolina. Class actions and representative proceedings are waived.
        </p>
      </Section>

      <Section id="contact" number={9} title={sectionTitle(sections, "contact")}>
        <ContactCard
          heading="Corporate Legal Address"
          rows={[
            { label: "Entity", value: "Lobby & Lounge Music Inc." },
            { label: "Attention", value: "Legal Department" },
            { label: "Email", value: <><Email address="legal@lobbyloungeinc.com" /> / <Email address="alvin@lobbyloungeinc.com" /></> },
            { label: "Telephone", value: <Phone number="+1 (919) 438-3093" /> },
          ]}
        />
      </Section>
    </LegalPage>
  );
}
