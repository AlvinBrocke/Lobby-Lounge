import { Metadata } from "next";
import { LegalPage, Section, Sub, A, Email, Phone, LegalTable, ContactCard, sectionTitle } from "@/components/legal/LegalPage";
import { DoNotSellToggle } from "@/components/legal/DoNotSellToggle";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Lobby & Lounge Music Inc. collects, uses, and shares personal information, and your privacy rights under the CCPA/CPRA.",
};

const sections = [
  { id: "what-we-collect", title: "What information do we collect?" },
  { id: "how-we-process", title: "How do we process your information?" },
  { id: "disclosures", title: "When and with whom do we share your personal information?" },
  { id: "cookies", title: "Do we use cookies and other tracking technologies?" },
  { id: "social-logins", title: "How do we handle work email and social logins?" },
  { id: "retention", title: "Comprehensive data retention schedule" },
  { id: "security", title: "How do we keep your information safe?" },
  { id: "minors", title: "Do we collect information from minors?" },
  { id: "your-rights", title: "What are your privacy rights?" },
  { id: "gpc", title: "Controls for Do-Not-Track and opt-out preference signals" },
  { id: "california", title: "Do California residents have specific privacy rights?" },
  { id: "updates", title: "Do we make updates to this notice?" },
  { id: "requests", title: "How can you review, update, or delete the data we collect?" },
  { id: "contact", title: "How can you contact us about this Privacy Policy?" },
];

// Body for the prefilled "Online Privacy Form" email (§11.C / §13).
const ccpaRequestBody = [
  "Legal name:",
  "Business account name:",
  "Registered email address:",
  "Right I wish to invoke (know/access, delete, correct, opt-out of sale/sharing):",
  "Are you a California resident requesting relief under CCPA/CPRA? (Yes/No):",
  "",
  "Additional details:",
].join("\n");
const ccpaRequestHref = `mailto:privacy@lobbyloungeinc.com?subject=${encodeURIComponent("CCPA Request")}&body=${encodeURIComponent(ccpaRequestBody)}`;
const shineTheLightHref = `mailto:privacy@lobbyloungeinc.com?subject=${encodeURIComponent("Shine the Light Request")}`;

const yes = { value: "YES", tone: "yes" as const };
const no = { value: "NO", tone: "no" as const };

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="September 17, 2026" sections={sections}>
      <p>This Privacy Policy includes important information about your personal data and we encourage you to read it carefully.</p>

      <Sub title="Welcome">
        <p>
          We provide legal, expertly curated music solutions for hospitality businesses (restaurants, hotels, cafés, and retail) designed to set the perfect atmosphere for business owners in their establishments. This Privacy Policy for Lobby &amp; Lounge Music Inc. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;), including when you:
        </p>
        <ul>
          <li><strong>Visit our website</strong> at <A href="https://lobby-lounge.vercel.app/">https://lobby-lounge.vercel.app/</A> or any website of ours that links to this Privacy Policy</li>
          <li><strong>Use Lobby &amp; Lounge Music.</strong> The music streaming web application for hotels, cafés, restaurants and retail. Legal, expertly curated, and designed to set the perfect atmosphere</li>
          <li><strong>Engage</strong> with us in other related ways, including any marketing or events</li>
        </ul>
        <p>
          More importantly, our Privacy Policy contains mandatory disclosures under the California Consumer Privacy Act of 2018 (Cal. Civ. Code § 1798.100 et seq.), as amended by the California Privacy Rights Act of 2020 (effective January 1, 2023, enforceable July 1, 2023). We collect identifiers, customer records, commercial data, internet activity, professional information, inferences, and sensitive login/location data to provide legal commercial background music solutions. We do NOT sell personal data for monetary gain, but we engage in digital ad network &lsquo;sharing&rsquo; (cross-context behavioral advertising) which you may opt out of via Global Privacy Control (GPC) or by using our <A href="#do-not-sell">Do Not Sell/Share links</A>.
        </p>
        <p>
          <strong>Questions or Concerns.</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services.
        </p>
      </Sub>

      <div style={{ height: 32 }} />

      <Section id="what-we-collect" number={1} title={sectionTitle(sections, "what-we-collect")}>
        <p>
          Lobby &amp; Lounge Music Inc. (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides expertly curated, commercially licensed background music solutions tailored for hospitality businesses, including restaurants, hotels, cafés, lounges, and retail establishments. In providing our web applications and music streaming infrastructure (the &quot;Services&quot;), we collect personal information directly from you, automatically through your interactions with our platform, and from authorized third-party business partners.
        </p>
        <Sub title="A. Personal Information You Disclose to Us">
          <p>We collect personal information that you voluntarily provide when registering for an account, expressing an interest in obtaining information about our products, subscribing to streaming zones, or contacting customer support.</p>
          <p>The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:</p>
          <ul>
            <li>names</li>
            <li>phone numbers</li>
            <li>email addresses</li>
            <li>mailing addresses</li>
            <li>job titles</li>
            <li>usernames</li>
            <li>passwords</li>
            <li>billing addresses</li>
            <li>debit/credit card numbers</li>
            <li>contact or authentication data</li>
          </ul>
          <p><strong>Sensitive Information.</strong> We do not process sensitive information.</p>
          <p>
            <strong>Payment Data.</strong> We collect necessary billing records to process your payment if you choose to make purchases; however, all sensitive card numbers, CVVs, and direct payment card processing are handled securely and directly by our PCI-DSS compliant third-party payment processor, Stripe, Inc. (see Stripe&apos;s Privacy Policy at <A href="https://stripe.com/privacy">https://stripe.com/privacy</A>). We do not store raw card numbers on our servers.
          </p>
        </Sub>
        <Sub title="B. Information Automatically Collected">
          <p>When you navigate, stream, or interact with our Services, our systems automatically log technical data through server logs, cookies, and diagnostic monitors:</p>
          <ul>
            <li><strong>System &amp; Device Telemetry.</strong> Internet Protocol (IP) address, proxy server attributes, browser type and version, device hardware specifications, operating system, language configurations, and referring URL paths.</li>
            <li><strong>Log &amp; Usage Records.</strong> Audio playback events, playlist selections, stream duration, zone transitions, search queries, feature interactions, system crash reports, and performance timestamps.</li>
            <li><strong>Geolocation Data.</strong> Imprecise geolocation (such as country, state, and city derived from IP address) and precise device location (where permitted by device permissions) to verify physical venue licensing territories and ensure zone-compliant audio synchronization.</li>
          </ul>
        </Sub>
        <Sub title="C. Sensitive Personal Information (SPI)">
          <p>
            Under California Civil Code § 1798.140(ae), certain data points are categorized as Sensitive Personal Information. We collect account login credentials (username and password) and precise device geolocation (GPS coordinates collected strictly to establish venue streaming zone parameters). We process this data exclusively to perform our contract, secure user accounts, and prevent unlicensed rebroadcasting. We do not use Sensitive Personal Information to infer consumer characteristics or for any non-exempt commercial profiling.
          </p>
        </Sub>
      </Section>

      <Section id="how-we-process" number={2} title={sectionTitle(sections, "how-we-process")}>
        <p>We process your personal information in accordance with applicable legal bases, including contractual performance, legitimate commercial interests, compliance with legal mandates, and your explicit consent where required:</p>
        <ul>
          <li><strong>Service Delivery &amp; Account Management.</strong> Authenticating account holders, maintaining secure streaming sessions, configuring venue zone permissions, and delivering uninterrupted audio playback.</li>
          <li><strong>Transaction &amp; Billing Execution.</strong> Processing monthly/annual subscription fees, calculating venue licensing fees, issuing tax invoices, and preventing fraudulent transactions.</li>
          <li><strong>Customer Support &amp; Diagnostic Resolution.</strong> Troubleshooting hardware/software playback issues, diagnosing streaming packet delivery latency, and resolving customer inquiries.</li>
          <li><strong>Platform Optimization &amp; Research.</strong> Analyzing anonymized listening habits, evaluating venue music engagement trends, refining curation algorithms, and developing platform enhancements.</li>
          <li><strong>Operational Communications.</strong> Transmitting critical service alerts, license renewals, security notifications, terms modifications, and administrative updates.</li>
          <li><strong>Marketing &amp; Advertising.</strong> Delivering targeted commercial updates, promotional offers, and industry newsletters in compliance with your marketing preferences.</li>
          <li><strong>Security &amp; Fraud Defense.</strong> Monitoring network integrity, detecting unauthorized commercial distribution or account sharing, and defending our legal rights.</li>
        </ul>
      </Section>

      <Section id="disclosures" number={3} title={sectionTitle(sections, "disclosures")}>
        <p>We disclose personal data to vetted third-party service providers, authorized vendors, contractors, and corporate affiliates who perform services on our behalf pursuant to strict written data processing agreements:</p>
        <ul>
          <li><strong>Cloud Computing &amp; Hosting Infrastructure.</strong> Cloud infrastructure hosts, content delivery networks (CDNs), and database providers hosting our music streaming pipelines.</li>
          <li><strong>Payment Gateways.</strong> Stripe, Inc., which manages end-to-end tokenized payment execution, recurring billing, and chargeback prevention.</li>
          <li><strong>Identity &amp; Authentication Services.</strong> Third-party identity verification, federated login managers, and single sign-on (SSO) infrastructure.</li>
          <li><strong>Data Analytics &amp; System Monitoring.</strong> Diagnostic tools, real-time error loggers, and performance monitoring software tracking streaming quality.</li>
          <li><strong>Sales, Marketing &amp; CRM Suites.</strong> Customer relationship management (CRM) software, direct email distribution tools, and support ticketing desks.</li>
          <li><strong>Ad Networks &amp; Affiliates.</strong> Advertising and marketing partners assisting in commercial outreach and retargeting campaigns.</li>
        </ul>
        <p>In the event of a merger, corporate restructuring, divestiture, sale of company assets, or bankruptcy, personal data may be transferred to successor entities, subject to the representations set forth in this Privacy Policy.</p>
      </Section>

      <Section id="cookies" number={4} title={sectionTitle(sections, "cookies")}>
        <p>
          We utilize first-party and third-party cookies, tracking pixels, local storage, and web beacons to operate our streaming applications, retain audio volume/zone preferences, analyze traffic trends, and measure promotional campaigns. Under California law, allowing third-party advertising cookies or analytics scripts to collect browsing activity across non-affiliated sites is deemed a &quot;sale&quot; or &quot;sharing&quot; of personal information for cross-context behavioral advertising (targeted advertising). While we do not sell your personal data for money, you have the statutory right to opt out of such tracking technologies as detailed in Sections <A href="#gpc">10</A> and <A href="#california">11</A>. For a full inventory of the cookies we use, see our <A href="/cookies">Cookies Policy</A>.
        </p>
      </Section>

      <Section id="social-logins" number={5} title={sectionTitle(sections, "social-logins")}>
        <p>
          Our Services may enable authentication via third-party providers (such as Google, Facebook, or X). When utilizing single sign-on (SSO), we obtain verified profile data from the provider (including name, business email address, and unique user identifier). We utilize this information exclusively to create and authenticate your account. We encourage you to review the privacy notices of external identity providers before linking accounts.
        </p>
      </Section>

      <Section id="retention" number={6} title={sectionTitle(sections, "retention")}>
        <p>In strict accordance with the CPRA&apos;s data minimization principles (Cal. Civ. Code § 1798.100(a)(3)), we do not retain personal information longer than is reasonably necessary for the operational purposes disclosed in this policy:</p>
        <ul>
          <li><strong>Account Identifiers &amp; Profile Records.</strong> Retained for the active duration of the customer relationship plus up to six (6) months following account deactivation to facilitate account reactivation or audit history.</li>
          <li><strong>Commercial &amp; Transactional Records.</strong> Retained for seven (7) years following transaction completion to satisfy federal, state, and local accounting, tax, and commercial statutory audit requirements.</li>
          <li><strong>Diagnostic &amp; Server Logs.</strong> Diagnostic telemetry, crash logs, and streaming packet logs are retained for twelve (12) months, after which they are systematically purged or aggregated into non-identifiable statistics.</li>
          <li><strong>Geolocation Information.</strong> Real-time GPS coordinates are processed ephemerally during stream handshake verification and are not written to persistent storage; IP-level geographic tags are retained with standard server logs for up to six (6) months.</li>
          <li><strong>Inference &amp; Preference Data.</strong> Internal curation profiles and playlist engagement scores are retained for twenty-four (24) months, or until the user submits a verified deletion request.</li>
        </ul>
      </Section>

      <Section id="security" number={7} title={sectionTitle(sections, "security")}>
        <p>
          We have implemented industry-standard organizational, technical, and administrative controls designed to safeguard personal data against unauthorized access, destruction, loss, or alteration. These measures include TLS/SSL cryptographic encryption in transit, AES-256 encryption for sensitive databases at rest, role-based access control (RBAC), multi-factor authentication for administrative staff, and continuous network vulnerability assessments. However, no internet transmission or electronic storage architecture is 100% immune from security breach, and transmissions are undertaken at your own risk.
        </p>
      </Section>

      <Section id="minors" number={8} title={sectionTitle(sections, "minors")}>
        <p>
          Our Services are designed exclusively for commercial venues, corporate operators, and adult business proprietors. We do not knowingly solicit, collect, process, sell, or share personal data from individuals under eighteen (18) years of age. If we verify that personal data of an individual under 18 has been collected without parental consent, we will promptly terminate the account and purge all related records. Please report minor data concerns to <Email address="alvin@lobbyloungeinc.com" />.
        </p>
      </Section>

      <Section id="your-rights" number={9} title={sectionTitle(sections, "your-rights")}>
        <p>Regardless of your geographic location, you maintain standard controls over your data:</p>
        <ul>
          <li><strong>Consent Withdrawal:</strong> Where processing relies on consent, you may withdraw consent at any time without affecting past lawful processing.</li>
          <li><strong>Marketing Unsubscribe:</strong> You can unsubscribe from marketing communications by clicking the unsubscribe link in promotional emails or updating preferences.</li>
          <li><strong>Account Information:</strong> You may review, modify, or correct your profile data by logging into your <A href="/settings">account settings</A>.</li>
        </ul>
      </Section>

      <Section id="gpc" number={10} title={sectionTitle(sections, "gpc")}>
        <p>
          Most web browsers include a Do-Not-Track (&quot;DNT&quot;) setting. Because no universal technological consensus exists regarding generic DNT headers, our system does not currently alter data handling practices upon encountering generic DNT signals. In compliance with the California Consumer Privacy Act and Title 11 California Code of Regulations § 7025, Lobby &amp; Lounge Music Inc. fully recognizes and honors the Global Privacy Control (GPC) opt-out preference signal. When our web application detects an enabled GPC signal transmitted by your browser or operating system, we automatically process that signal as a valid, friction-free consumer request to opt out of the &lsquo;sale&rsquo; and &lsquo;sharing&rsquo; of personal information (including cross-context behavioral advertising) for that specific browser, application, or connected device.
        </p>
        <DoNotSellToggle />
      </Section>

      <Section id="california" number={11} title={sectionTitle(sections, "california")}>
        <p>This section applies exclusively to California residents pursuant to the California Consumer Privacy Act of 2018, as amended by the California Privacy Rights Act of 2020 (collectively, &quot;CCPA/CPRA&quot;).</p>

        <Sub title="A. Categories of Personal Information Collected, Disclosed, and Shared (Past 12 Months)">
          <p>Below is the statutory disclosure of personal information categories to be collected or disclosed for business operational purposes, and shared for cross-context behavioral advertising over the preceding twelve (12) months:</p>
          <LegalTable
            columns={["Statutory Category", "Examples Collected", "Collected", "Disclosed to Providers", "Sold / Shared"]}
            rows={[
              ["A. Identifiers", "Real name, business email, IP address, username, phone number", yes, "Cloud hosts, CRM, identity providers", no],
              ["B. Cal. Customer Records", "Name, business contact info, payment verification details", yes, "Stripe (payment processor), cloud hosting", no],
              ["C. Protected Characteristics", "Age, race, ethnicity, gender, marital status", no, "None", no],
              ["D. Commercial Information", "Subscription records, streaming tiers, payment history", yes, "Payment gateways, accounting tools", no],
              ["E. Biometric Information", "Voiceprints, fingerprints, facial scans", no, "None", no],
              ["F. Internet / Network Activity", "Log data, browsing history, crash reports, feature telemetry", yes, "Analytics providers, cloud monitors", { value: "YES (Ad Pixels)", tone: "warn" }],
              ["G. Geolocation Data", "IP-derived city/region; device GPS location for streaming zones", yes, "Cloud providers, licensing routing engines", no],
              ["H. Sensory / Audio Data", "Customer service voice recordings, facility footage", no, "None", no],
              ["I. Professional Information", "Job title, company name, establishment role", yes, "CRM systems, email automation platforms", no],
              ["J. Non-Public Education Data", "Student directory data, academic records", no, "None", no],
              ["K. Inferences", "Playlist preference profiles, venue audio profiles", yes, "Internal recommendation engines", no],
              ["L. Sensitive Personal Information", "Account login credentials; precise device GPS coordinates", yes, "Authentication providers, cloud host", no],
            ]}
          />
        </Sub>

        <Sub title="B. Your California Consumer Privacy Rights">
          <p>Under the CCPA, as amended by the CPRA, California residents possess comprehensive rights regarding their personal information:</p>
          <ul>
            <li><strong>1. Right to Know and Access:</strong> You have the right to request that we disclose: (1) the categories of personal information collected, (2) the categories of sources, (3) the commercial or business purposes for collection, (4) the categories of third parties to whom data is disclosed, and (5) the specific pieces of personal information collected about you in the preceding 12 months.</li>
            <li><strong>2. Right to Request Deletion:</strong> You have the right to request deletion of personal information we have collected, subject to statutory exceptions (such as fulfilling commercial contracts, detecting security incidents, debugging code, or complying with legal obligations).</li>
            <li><strong>3. Right to Correct Inaccuracies:</strong> You have the right to request correction of inaccurate personal information maintained in our systems.</li>
            <li><strong>4. Right to Opt-Out of Sale or Sharing:</strong> You have the right to opt out of the &lsquo;sale&rsquo; of your personal information or the &lsquo;sharing&rsquo; of your personal information for cross-context behavioral advertising. You can exercise this via our website footer link (<A href="#do-not-sell">&lsquo;Do Not Sell or Share My Personal Information&rsquo;</A>) or via the Global Privacy Control (GPC).</li>
            <li><strong>5. Right to Limit Sensitive Personal Information:</strong> Under Cal. Civ. Code § 1798.121, businesses using sensitive personal information for inferring characteristics must offer an opt-out. Because we use sensitive personal information (credentials and GPS) strictly for essential operational services and security, we are exempt from providing a &lsquo;Limit Use of Sensitive Personal Information&rsquo; link.</li>
            <li><strong>6. Right to Non-Discrimination:</strong> We will not discriminate against you (by denying services, altering streaming audio bitrates, or assessing penalties) for exercising any statutory privacy rights.</li>
          </ul>
        </Sub>

        <Sub title="C. How to Exercise Your California Rights">
          <p>To submit a verifiable consumer request to know, access, correct, or delete personal information:</p>
          <ul>
            <li><strong>By Email:</strong> Submit an electronic inquiry to <Email address="privacy@lobbyloungeinc.com" /> with &lsquo;CCPA Request&rsquo; in the subject.</li>
            <li><strong>Online Privacy Form:</strong> Use the request button below to open a prefilled request with the details we need.</li>
            <li><strong>By Telephone:</strong> Contact our designated compliance team at <Phone number="+1 (919) 438-3093" />.</li>
          </ul>
          <a
            href={ccpaRequestHref}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 999, background: "var(--ll-accent)", color: "var(--ll-accent-ink)", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: "0 12px 30px -8px rgba(78,205,196,.6)", marginTop: 4 }}
          >
            Submit a privacy request
          </a>
        </Sub>

        <Sub title="D. Request Verification and Authorized Agent Procedures">
          <p>To ensure data security, we verify all consumer requests prior to processing. We require you to match two or more identity points already in our records (such as your account email and recent transaction timestamp). For requests seeking specific pieces of personal data, a signed declaration under penalty of perjury may be required.</p>
          <p><strong>Authorized Agents:</strong> If you submit a request via an authorized agent, the agent must present valid written authorization signed by you. You must also verify your own identity directly with us before personal records are disclosed or deleted.</p>
        </Sub>

        <Sub title="E. Statutory Response Timelines">
          <ul>
            <li><strong>Confirmation of Receipt (10 Days):</strong> We will confirm receipt of your verifiable consumer request within ten (10) business days and provide an explanation of how the request will be investigated and processed.</li>
            <li><strong>Substantive Response (45 Days):</strong> We will provide a substantive response within forty-five (45) calendar days of receipt. If reasonably necessary, an extension of up to forty-five (45) additional days may be utilized, provided written notice explaining the delay is sent within the initial 45-day window.</li>
          </ul>
        </Sub>

        <Sub title="F. Appeals and Regulatory Recourse">
          <p>
            If we decline to take action on your consumer request, you may appeal our determination by emailing <Email address="privacy@lobbyloungeinc.com" /> within thirty (30) days of receiving our denial notice. We will evaluate the appeal and render a written determination within forty-five (45) calendar days. If your appeal is denied, you may file a formal complaint with the California Privacy Protection Agency (CPPA) at <A href="https://cppa.ca.gov/">https://cppa.ca.gov/</A> or the Office of the California Attorney General.
          </p>
        </Sub>

        <Sub title="G. California ‘Shine the Light’ Law">
          <p>
            California Civil Code Section 1798.83 permits California residents who are customers of Lobby &amp; Lounge Music Inc. to request once per calendar year a list of categories of personal information (if any) we disclosed to third parties for direct marketing purposes, alongside third-party contact details. To submit a request, contact <A href={shineTheLightHref}>privacy@lobbyloungeinc.com</A> with the reference line &lsquo;Shine the Light Request.&rsquo;
          </p>
        </Sub>
      </Section>

      <Section id="updates" number={12} title={sectionTitle(sections, "updates")}>
        <p>
          We update this Privacy Policy periodically to reflect evolving platform architecture, legal precedents, and regulatory directives. When changes occur, the updated policy will feature a revised &lsquo;Last Updated&rsquo; date at the top. If material changes are made, we will notify registered account holders via prominent web notifications or direct email correspondence prior to the effective date.
        </p>
      </Section>

      <Section id="requests" number={13} title={sectionTitle(sections, "requests")}>
        <p>
          To exercise your rights to review, update, download, or delete personal data collected by Lobby &amp; Lounge Music Inc., please submit an electronic request through our <A href={ccpaRequestHref}>online privacy portal</A> or email <Email address="privacy@lobbyloungeinc.com" />. Your request must state your legal name, business account name, registered email address, the specific statutory right you wish to invoke, and whether you are a California resident requesting relief under CCPA/CPRA.
        </p>
      </Section>

      <Section id="contact" number={14} title={sectionTitle(sections, "contact")}>
        <p>If you have questions, inquiries, or complaints regarding this Privacy Policy or our data protection practices, please contact our Data Protection Officer (DPO) and compliance department:</p>
        <ContactCard
          heading="Lobby & Lounge Music Inc. – Data Protection Office"
          rows={[
            { label: "Attention", value: "Data Protection Officer (DPO) / Legal Department" },
            { label: "Corporate Entity", value: "Lobby & Lounge Music Inc." },
            { label: "DPO Direct Email", value: <Email address="alvin@lobbyloungeinc.com" /> },
            { label: "Privacy Intake Email", value: <Email address="privacy@lobbyloungeinc.com" /> },
            { label: "Direct Telephone", value: <Phone number="+1 (919) 438-3093" /> },
            { label: "Website", value: <A href="https://lobby-lounge.vercel.app/">https://lobby-lounge.vercel.app/</A> },
            { label: "Mailing Address", value: "Lobby & Lounge Music Inc., Attn: Data Protection Officer, 1000 Main Campus Drive, Suite 200, Raleigh, NC 27606" },
          ]}
        />
      </Section>
    </LegalPage>
  );
}
