import { Metadata } from "next";
import { LegalPage, Section, A, Email, Phone, LegalTable, ContactCard, sectionTitle } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookies Policy",
  description: "How Lobby & Lounge Music Inc. uses cookies, pixels, and local storage, and how to opt out of sharing under the CCPA/CPRA.",
};

const sections = [
  { id: "definitions", title: "Defined terms" },
  { id: "classifications", title: "Cookie classifications" },
  { id: "audit-table", title: "Platform cookie audit table" },
  { id: "opt-out", title: "Exercising opt-out rights (CCPA/CPRA)" },
  { id: "browser-controls", title: "Browser-level cookie controls" },
  { id: "contact", title: "Contact & inquiries" },
];

const necessary = { value: "Strictly Necessary", tone: "yes" as const };
const targeting = { value: "Targeting / Sharing", tone: "warn" as const };

export default function CookiesPolicyPage() {
  return (
    <LegalPage title="Cookies Policy" lastUpdated="September 19, 2026" sections={sections}>
      <p>
        This Cookies Policy (&quot;Cookie Policy&quot;) outlines how Lobby &amp; Lounge Music Inc. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) utilizes cookies, web beacons, pixels, and browser local storage across our commercial music streaming web application at <A href="https://lobby-lounge.vercel.app/">https://lobby-lounge.vercel.app/</A> (the &quot;Services&quot;). This notice should be read in tandem with our <A href="/privacy">Privacy Policy</A> and <A href="/terms">Terms of Service</A>.
      </p>

      <div style={{ height: 24 }} />

      <Section id="definitions" number={1} title={sectionTitle(sections, "definitions")}>
        <ul>
          <li><strong>Cookies.</strong> Compact text files stored on your browser to recognize sessions, retain streaming settings, and compile analytics (Tracking Technologies).</li>
          <li><strong>Session Cookies.</strong> Temporary files removed automatically upon closing your browser window.</li>
          <li><strong>Persistent Cookies.</strong> Files that persist across browsing sessions until reaching scheduled expiration or being cleared manually.</li>
          <li><strong>Web Beacons &amp; Tracking Pixels.</strong> Miniature graphic tags embedded in pages to track user engagement and ad conversion efficiency.</li>
          <li><strong>HTML5 Local Storage.</strong> Client-side browser storage used to maintain audio playback buffers and venue zone volume states.</li>
        </ul>
      </Section>

      <Section id="classifications" number={2} title={sectionTitle(sections, "classifications")}>
        <p>We organize tracking technologies into four discrete categories:</p>
        <ul>
          <li><strong>Strictly Necessary.</strong> Required to authenticate accounts, safeguard transmissions, and execute payments via Stripe. Cannot be disabled.</li>
          <li><strong>Functional Cookies.</strong> Preserves venue volume presets, playback playlists, zone configurations, and UI themes.</li>
          <li><strong>Performance &amp; Analytics.</strong> Measures network latency, packet loss, crash logs, and streaming stability to improve services.</li>
          <li><strong>Targeting &amp; Advertising (&lsquo;Sharing&rsquo;).</strong> Deployed by marketing networks to evaluate commercial outreach and provide targeted B2B promotions on third-party websites.</li>
        </ul>
      </Section>

      <Section id="audit-table" number={3} title={sectionTitle(sections, "audit-table")}>
        <p>Below is an itemized inventory of cookies active on our commercial streaming application:</p>
        <LegalTable
          columns={["Cookie Identifier", "Category", "Provider / Host", "Operational Purpose", "Retention"]}
          rows={[
            ["ll_session_id", necessary, "Lobby & Lounge", "Authenticates account holders and preserves active audio stream session.", "Session"],
            ["__stripe_mid / __stripe_sid", necessary, "Stripe, Inc.", "Fraud detection, security verification, and checkout execution.", "1 Year / 30 Min"],
            ["ll_zone_config", "Functional", "Lobby & Lounge", "Stores venue audio zone routing, hardware tags, and volume levels.", "6 Months"],
            ["ll_tempo_preset", "Functional", "Lobby & Lounge", "Saves dynamic pacing defaults and POS integration presets.", "1 Year"],
            ["_ga / _ga_*", "Analytics", "Google Analytics", "Collects anonymous telemetry on session length and feature usage.", "2 Years"],
            ["ll_telemetry_crash", "Performance", "Lobby & Lounge", "Records audio latency, streaming dropouts, and browser crash dumps.", "90 Days"],
            ["_fbp", targeting, "Meta Platforms", "Tracks ad conversions and enables retargeting campaigns.", "90 Days"],
            ["_gcl_au", targeting, "Google Ads", "Evaluates commercial ad conversions and B2B campaign efficiency.", "90 Days"],
          ]}
        />
      </Section>

      <Section id="opt-out" number={4} title={sectionTitle(sections, "opt-out")}>
        <p>Allowing third-party advertising scripts to track browsing activity across websites constitutes &lsquo;sharing&rsquo; under the CCPA/CPRA. You may opt out of sharing at any time via two simple options:</p>
        <ul>
          <li><strong>1. Global Privacy Control (GPC).</strong> Broadcast a Global Privacy Control (GPC) signal from your browser, which our web server automatically recognizes as a binding opt-out instruction.</li>
          <li><strong>2. Website Footer Link.</strong> Click the <A href="/privacy#do-not-sell">&lsquo;Do Not Sell or Share My Personal Information&rsquo;</A> link located in our platform footer to toggle tracking preferences.</li>
        </ul>
      </Section>

      <Section id="browser-controls" number={5} title={sectionTitle(sections, "browser-controls")}>
        <p>
          You may clear or block cookies directly in your browser&apos;s settings menu (e.g., Chrome, Safari, Firefox, or Edge). Please note that rejecting strictly necessary cookies will impair your ability to log in and maintain audio stream delivery.
        </p>
      </Section>

      <Section id="contact" number={6} title={sectionTitle(sections, "contact")}>
        <ContactCard
          heading="Direct Inquiries"
          rows={[
            { label: "Entity", value: "Lobby & Lounge Music Inc." },
            { label: "Attention", value: "Data Protection Officer (DPO)" },
            { label: "Email", value: <><Email address="privacy@lobbyloungeinc.com" /> / <Email address="alvin@lobbyloungeinc.com" /></> },
            { label: "Telephone", value: <Phone number="+1 (919) 438-3093" /> },
          ]}
        />
      </Section>
    </LegalPage>
  );
}
