import type { LucideIcon } from "lucide-react";
import { CalendarClock, CreditCard, Gift, LifeBuoy, MessageSquare, Music, PlayCircle, Receipt, Rocket, Scale, ShieldCheck, Sparkles, Speaker, Store, Users, Wrench } from "lucide-react";

/*
 * Help Centre content, ported verbatim from docs/Help Centre LL Music.docx
 * (the doc's "^" accordion markers are dropped; they're layout notes, not copy).
 * Sections, questions and answers keep the doc's order and wording.
 */

/** A run of text, or a link. */
export type Inline = string | { text: string; href: string };

/** A paragraph, an italic paragraph, or a bulleted / numbered list. */
export type AnswerBlock = Inline[] | { em: Inline[] } | { list: "ul" | "ol"; items: Inline[][] };

export type Faq = { q: string; a: AnswerBlock[] };

export type HelpCategory = {
  id: string;
  title: string;
  icon: LucideIcon;
  /** "Was this information helpful?" / "Submit a request" lines, where the doc has them. */
  footer?: string[];
  faqs: Faq[];
};

export const helpTitle = "Lobby & Lounge Help Center";

export const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket,
    footer: [
      "Was this Information helpful? YES / NO",
      "Have more questions? Submit a request"
    ],
    faqs: [
      {
        q: "How do I play music in my venue for the first time?",
        a: [
          [
            "Getting started with Lobby & Lounge Music requires zero hardware and takes less than two minutes."
          ],
          {
            list: "ol",
            items: [
              [
                "Open a web browser (Chrome, Safari, or Edge) on your smartphone, tablet, or laptop."
              ],
              [
                "Log in to your Lobby & Lounge account via ",
                {
                  text: "https://lobby-lounge.vercel.app",
                  href: "https://lobby-lounge.vercel.app"
                },
                ""
              ],
              [
                "Browse our curated daypart playlists (e.g., Morning Boost, Lounge & Chill)."
              ],
              [
                "Tap Play."
              ],
              [
                "As long as your device is connected to your venue's sound system, the music will begin playing immediately."
              ]
            ]
          }
        ]
      },
      {
        q: "What devices do I need to use Lobby & Lounge?",
        a: [
          [
            "You do not need to purchase any expensive commercial audio receivers or dedicated media boxes. Lobby & Lounge Music is currently a lightweight, browser-based web application. You can use any modern device that connects to the internet and has a web browser, including:"
          ],
          {
            list: "ul",
            items: [
              [
                "Apple iPads and iPhones"
              ],
              [
                "Android tablets and smartphones"
              ],
              [
                "Windows or Mac laptops and desktop computers"
              ]
            ]
          }
        ]
      },
      {
        q: "Can I use my personal Spotify or Apple Music account instead?",
        a: [
          [
            "No. Personal streaming accounts (like Spotify, Apple Music, and Pandora) are legally restricted to private, non-commercial use. Playing them in a business whether it is a cafe, retail store, or salon is considered a \"public performance\" and is a violation of copyright law. Lobby & Lounge Music provides a 100% commercially licensed alternative so you can play great music legally."
          ]
        ]
      }
    ]
  },
  {
    id: "technical-guidelines",
    title: "Technical Guidelines",
    icon: Speaker,
    footer: [
      "Was this Information helpful? YES / NO",
      "Have more questions? Submit a request"
    ],
    faqs: [
      {
        q: "How to connect Lobby & Lounge to your existing speakers",
        a: [
          [
            "Because Lobby & Lounge runs directly from your device's web browser, connecting to your house speakers is as simple as playing a video on your phone. We currently support two primary connection methods:"
          ],
          {
            em: [
              "Method 1: Bluetooth (Recommended for most small venues)"
            ]
          },
          {
            list: "ol",
            items: [
              [
                "Ensure your venue's amplifier or wireless speaker system is in \"Bluetooth Pairing\" mode."
              ],
              [
                "Open the Settings app on your tablet or smartphone and select Bluetooth."
              ],
              [
                "Tap your speaker system's name to connect."
              ],
              [
                "Open the Lobby & Lounge web app and press play."
              ]
            ]
          },
          [
            "Method 2: Apple AirPlay"
          ],
          {
            list: "ol",
            items: [
              [
                "Ensure your Apple device (iPad/iPhone) and your AirPlay-compatible speakers are on the same Wi-Fi network."
              ],
              [
                "Swipe down to open your Apple Control Center."
              ],
              [
                "Tap the AirPlay icon in the audio card and select your venue's speakers."
              ]
            ]
          },
          [
            "Note: While we currently rely on these wireless connections for our minimal-viable-product (MVP) phase, direct integrations with smart platforms like Sonos and dedicated plug-and-play media boxes are on our product roadmap."
          ]
        ]
      },
      {
        q: "Why did the music stop playing?",
        a: [
          [
            "If your music pauses unexpectedly, check the following:"
          ],
          {
            list: "ul",
            items: [
              [
                "Internet Connection: Lobby & Lounge requires a stable Wi-Fi or cellular connection to stream."
              ],
              [
                "Background Refresh: Because we are a browser-based service, your device may pause the audio if the browser is completely closed or if the device goes into a deep sleep mode. We recommend keeping the Lobby & Lounge tab open and active, and keeping your designated tablet plugged into a power source."
              ]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "licensing-legal-compliance",
    title: "Licensing & Legal Compliance",
    icon: ShieldCheck,
    faqs: [
      {
        q: "Is Lobby & Lounge completely legal for my business?",
        a: [
          [
            "Yes. Every single track in the Lobby & Lounge catalog is fully cleared for commercial use. You can play our music in your venue with total peace of mind, knowing you are protected from copyright infringement liabilities."
          ]
        ]
      },
      {
        q: "Do I need a separate PRO license (ASCAP, BMI, SESAC) to use this service?",
        a: [
          [
            "Currently, our entire catalog is built on high-quality music from real independent artists and smaller record labels. Because we license this music directly, you do not need to pay additional blanket licenses to Performance Rights Organizations (PROs) for the music provided within our app. We are actively working on adding American PRO-affiliated music to our catalog in the future to expand our offerings, but our current indie catalog is 100% legally cleared for your immediate use."
          ]
        ]
      },
      {
        q: "Where does your music come from?",
        a: [
          [
            "We have abandoned generic, royalty-free elevator music. Lobby & Lounge partners with real, independent musicians and boutique record labels. When you stream our channels, you are actively helping emerging artists get discovered while giving your business a vibrant, authentic atmosphere."
          ]
        ]
      }
    ]
  },
  {
    id: "account-billing",
    title: "Account & Billing",
    icon: CreditCard,
    faqs: [
      {
        q: "How much does Lobby & Lounge cost?",
        a: [
          [
            "We offer simple, transparent pricing."
          ],
          [
            "Our L&L Basic Plan ($20/month): Includes access to our full licensed catalog of 1,000+ tracks, daypart channels, plus weekly automated scheduling, custom playlist creation, and priority support. There are no hidden fees, and no credit card is required to start your 1 month free trial."
          ]
        ]
      },
      {
        q: "How do I cancel my subscription?",
        a: [
          [
            "We believe in zero hassle. If Lobby & Lounge isn't the right fit for your venue, you can cancel anytime directly from your dashboard. Navigate to Settings > Billing, and click Cancel Subscription. Your service will remain active until the end of your current billing cycle."
          ]
        ]
      }
    ]
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: Wrench,
    faqs: [
      {
        q: "What to do if you can't hear any music",
        a: [
          [
            "If the music appears to be playing on your screen but you cannot hear anything in your venue, walk through this quick 4-step checklist:"
          ],
          {
            list: "ol",
            items: [
              [
                "Check Device Volume: Ensure the physical volume buttons on your iPad, tablet, or laptop are turned all the way up."
              ],
              [
                "Check Browser Tab Muting: If using a laptop, right-click the Lobby & Lounge browser tab at the top of your screen and ensure \"Mute Site\" is not accidentally checked."
              ],
              [
                "Verify Bluetooth/AirPlay Output: Open your device's Bluetooth or AirPlay settings and confirm it says \"Connected\" to your specific house speakers. Sometimes, devices automatically connect to other nearby speakers or headphones."
              ],
              [
                "Check the House Amplifier: Ensure your venue's physical amplifier or receiver is turned on, set to the correct input channel (e.g., \"Bluetooth\" or \"Aux\"), and the master volume dial is turned up."
              ]
            ]
          }
        ]
      },
      {
        q: "How much internet speed do I need?",
        a: [
          [
            "Lobby & Lounge is highly optimized for commercial streaming. A standard broadband or reliable cellular (4G/5G) connection is more than enough. If your music is buffering or skipping, we recommend connecting your streaming device to your venue's private staff Wi-Fi network rather than the public guest network, which can slow down when your business gets crowded."
          ]
        ]
      },
      {
        q: "Can I block explicit songs or filter lyrics?",
        a: [
          [
            "Currently, our curators carefully build our daypart channels to suit general hospitality environments. However, a dedicated Explicit Track Blocking toggle is actively being developed. Soon, you will be able to guarantee a strictly PG, family-friendly atmosphere with a single click."
          ]
        ]
      },
      {
        q: "Can I play different music in different rooms?",
        a: [
          [
            "Multi-zoning is on our immediate product roadmap. In the near future, you will be able to control multiple audio environments from a single dashboard—for example, playing upbeat indie pop in your main dining room while streaming calming acoustics in the restrooms or patio."
          ]
        ]
      },
      {
        q: "Can the music adjust automatically when we get busy?",
        a: [
          [
            "Yes, this is the future of our platform. We are developing an ambient experience engine that will integrate directly with Point of Sale (POS) systems like Toast. Once launched, this feature will poll your real-time transaction volume and automatically shift the music tempo and energy based on how busy your venue gets, helping pace your operations seamlessly."
          ]
        ]
      }
    ]
  },
  {
    id: "best-practice",
    title: "Best Practice",
    icon: Sparkles,
    faqs: [
      {
        q: "How to choose the right channel for the right time",
        a: [
          [
            "The secret to great hospitality audio is called \"dayparting\". This means matching the tempo of the music to the natural flow of your business. Here is how to use our curated channels effectively:"
          ],
          {
            list: "ul",
            items: [
              [
                "Morning Boost: Mid-tempo, optimistic tracks perfect for opening hours, morning coffee rushes, and early retail browsing."
              ],
              [
                "Lounge & Chill: Acoustic, laid-back independent music ideal for the mid-afternoon lull, co-working spaces, or relaxed spa environments."
              ],
              [
                "Evening Rush: Upbeat, energetic tracks designed to keep staff moving and increase table turnover during your busiest dinner or happy hour services."
              ],
              [
                "Late-Night Vibes: Deeper, moodier beats perfect for after-dinner drinks, dimly lit bars, and closing time."
              ]
            ]
          }
        ]
      }
    ]
  },
  {
    id: "managing-staff-multiple-locations",
    title: "Managing Staff & Multiple Locations",
    icon: Users,
    faqs: [
      {
        q: "Can I use one account for multiple business locations?",
        a: [
          [
            "Currently, each Lobby & Lounge subscription is tied to a single physical location to ensure proper legal compliance. If you own three different cafes, you will need to set up three separate venue profiles. We are actively developing a \"Multi-Unit Dashboard\" that will soon allow ownership groups to manage the billing and music schedules for dozens of locations from a single master login."
          ]
        ]
      },
      {
        q: "Should my staff use their own logins?",
        a: [
          [
            "For now, we recommend creating one generic \"house\" login (e.g., music@yourcafe.com) that all your shift managers can use on the venue's dedicated tablet."
          ]
        ]
      }
    ]
  },
  {
    id: "product-feedback-beta-testing",
    title: "Product Feedback & Beta Testing",
    icon: MessageSquare,
    faqs: [
      {
        q: "How can I suggest a new feature or song?",
        a: [
          [
            "We are a music-tech startup, which means we actually listen to our users! If there is a feature you need, or an independent artist you think we should add to our catalog, please reach out to our team at xxxxxxxxxxxxxxxxx. We are actively developing a feature that will allow you and your staff to instantly up-vote or down-vote songs directly in the player to help train your venue's algorithm."
          ]
        ]
      },
      {
        q: "How can I test new features before they launch?",
        a: [
          [
            "Because we are moving fast, we frequently look for forward-thinking venue owners to beta-test our upcoming tools like our smart POS integration that dynamically adjusts music based on your transaction volume. If you want early access to our newest tech, email us with the subject line \"Beta Program\" and we will add you to our priority list."
          ]
        ]
      }
    ]
  },
  {
    id: "getting-started-2",
    title: "Getting Started",
    icon: PlayCircle,
    footer: [
      "Was this information helpful? Yes / No",
      "Have more questions? Submit a request"
    ],
    faqs: [
      {
        q: "What is Lobby & Lounge?",
        a: [
          [
            "It is a licensed background music platform built for hospitality and retail businesses. It gives you curated music plus scheduling tools from one dashboard."
          ]
        ]
      },
      {
        q: "Who is it for?",
        a: [
          [
            "Hotels, restaurants, cafes, bars, retail stores, spas, and gyms. Any business that plays music where customers can hear it."
          ]
        ]
      },
      {
        q: "Do I need special hardware?",
        a: [
          [
            "No. It runs through a browser on any device you already own."
          ]
        ]
      },
      {
        q: "How long does setup take?",
        a: [
          [
            "Most single venues are running within twenty minutes. Multiple locations may take longer depending on complexity."
          ]
        ]
      },
      {
        q: "Is there a free trial?",
        a: [
          [
            "Yes. Your first month is free and no card is required to start."
          ]
        ]
      },
      {
        q: "What happens after my free month?",
        a: [
          [
            "Your music pauses until you add a payment method. Nothing charges automatically."
          ]
        ]
      },
      {
        q: "Can I use my phone or tablet instead of a computer?",
        a: [
          [
            "Yes. Every device syncs to one account, so you can log in from anywhere."
          ]
        ]
      },
      {
        q: "Do I need to tell you what kind of venue I run?",
        a: [
          [
            "Yes. This helps us show you relevant channels and starting points right away."
          ]
        ]
      }
    ]
  },
  {
    id: "catalogue-and-music",
    title: "Catalogue and Music",
    icon: Music,
    footer: [
      "Was this information helpful? Yes / No",
      "Have more questions? Submit a request"
    ],
    faqs: [
      {
        q: "Is your music catalogue licensed?",
        a: [
          [
            "Yes. Every track is cleared directly with independent artists and small labels for commercial use."
          ]
        ]
      },
      {
        q: "How many tracks are in the catalogue?",
        a: [
          [
            "We currently have anywhere between 1,000-10,000 tracks, and the number keeps growing."
          ]
        ]
      },
      {
        q: "Is mainstream or major label music included?",
        a: [
          [
            "Not currently. Our catalogue focuses on independent artists and labels."
          ]
        ]
      },
      {
        q: "What is a channel?",
        a: [
          [
            "A ready made playlist built around a mood or time of day, such as Morning Boost or Late Night Vibes."
          ]
        ]
      },
      {
        q: "Can I build my own playlist?",
        a: [
          [
            "Yes, using tracks from our licensed catalogue."
          ]
        ]
      },
      {
        q: "Can I request a specific artist or genre?",
        a: [
          [
            "Yes. Contact support and we will try to find something similar in our catalogue."
          ]
        ]
      },
      {
        q: "Does the catalogue ever repeat too often?",
        a: [
          [
            "No. Playlists refresh regularly so the same tracks do not loop endlessly during a shift."
          ]
        ]
      },
      {
        q: "What do the Slow, Medium, and Fast tags mean?",
        a: [
          [
            "They indicate tempo, which affects how relaxed or energetic a room feels. Slower tempo tends to encourage guests to linger."
          ]
        ]
      }
    ]
  },
  {
    id: "licensing-and-legal-questions",
    title: "Licensing and Legal Questions",
    icon: Scale,
    footer: [
      "Was this information helpful? Yes / No",
      "Have more questions? Submit a request"
    ],
    faqs: [
      {
        q: "Do I still need my own PRO license?",
        a: [
          [
            "Only if you play music outside our catalogue, such as a personal streaming account or downloaded files. Music played through our catalogue is already covered."
          ]
        ]
      },
      {
        q: "Can I use my personal Spotify or Apple Music account instead?",
        a: [
          [
            "No. Personal streaming accounts are licensed for private use only, not commercial play."
          ]
        ]
      },
      {
        q: "What is a PRO?",
        a: [
          [
            "A Performing Rights Organization. It collects royalties on behalf of songwriters when their music is played publicly."
          ]
        ]
      },
      {
        q: "Why do I need more than one PRO license if I use outside music?",
        a: [
          [
            "Different songwriters are represented by different PROs, so one license rarely covers everything."
          ]
        ]
      },
      {
        q: "Can I get fined for playing unlicensed music?",
        a: [
          [
            "Yes. United States courts can award damages between seven hundred fifty and thirty thousand dollars per song, and up to one hundred fifty thousand for willful cases."
          ]
        ]
      },
      {
        q: "Does playing music quietly reduce my legal risk?",
        a: [
          [
            "No. Volume does not affect whether a license is required."
          ]
        ]
      },
      {
        q: "Is my venue exempt if it is small?",
        a: [
          [
            "Only for broadcast radio or television, and only under strict size and equipment limits. Streaming and curated playlists are never covered by this exemption."
          ]
        ]
      },
      {
        q: "What counts as music piracy?",
        a: [
          [
            "Any unauthorized use of copyrighted music, including ripped files, burned CDs, or personal streaming accounts played publicly."
          ]
        ]
      },
      {
        q: "Will PRO fees ever be included in my subscription?",
        a: [
          [
            "That is our goal. We are working on partnerships with major PROs to bundle this coverage in the future."
          ]
        ]
      },
      {
        q: "Does licensing work the same way outside the United States?",
        a: [
          [
            "The concept is the same, but the organizations differ by country. Our directory lists the relevant body for many countries."
          ]
        ]
      }
    ]
  },
  {
    id: "scheduling-and-zones",
    title: "Scheduling and Zones",
    icon: CalendarClock,
    faqs: [
      {
        q: "Can I schedule different music for different times of day?",
        a: [
          [
            "Yes. Set your weekly schedule once and it runs automatically every week."
          ]
        ]
      },
      {
        q: "Can different areas of my venue play different music?",
        a: [
          [
            "This depends on your plan. Some plans support multiple independent zones."
          ]
        ]
      },
      {
        q: "Can I schedule announcements between songs?",
        a: [
          [
            "Yes, on eligible plans. Messages fade in gently rather than cutting the music off."
          ]
        ]
      },
      {
        q: "Can I target announcements to specific areas only?",
        a: [
          [
            "Yes. You can choose which zones hear a given announcement."
          ]
        ]
      },
      {
        q: "What happens if my internet connection drops?",
        a: [
          [
            "The app keeps a short buffer of upcoming tracks so brief interruptions usually go unnoticed."
          ]
        ]
      },
      {
        q: "Can I override the schedule for a special event?",
        a: [
          [
            "Yes. You can pause the regular schedule and play something specific whenever needed."
          ]
        ]
      }
    ]
  },
  {
    id: "music-plans",
    title: "Music Plans",
    icon: Receipt,
    footer: [
      "Was this information helpful? Yes / No",
      "Have more questions? Submit a request"
    ],
    faqs: [
      {
        q: "What is the difference between plans?",
        a: [
          [
            "Plans vary by number of zones, curation features, and support level. Check our pricing page for current details."
          ]
        ]
      },
      {
        q: "Can I change plans later?",
        a: [
          [
            "Yes. You can upgrade or downgrade at any time from your account settings."
          ]
        ]
      },
      {
        q: "Is there a long term contract?",
        a: [
          [
            "No. Plans are billed monthly and can be cancelled anytime."
          ]
        ]
      },
      {
        q: "Do prices include tax?",
        a: [
          [
            "Listed prices generally exclude tax, which is added at checkout based on your location."
          ]
        ]
      },
      {
        q: "What payment methods do you accept?",
        a: [
          [
            "Major credit and debit cards. Larger accounts can request invoicing."
          ]
        ]
      },
      {
        q: "Can I manage multiple locations from one account?",
        a: [
          [
            "This capability depends on your plan tier. Contact us if you operate several venues."
          ]
        ]
      }
    ]
  },
  {
    id: "brand-and-guest-experience",
    title: "Brand and Guest Experience",
    icon: Store,
    footer: [
      "Was this information helpful? Yes / No",
      "Have more questions? Submit a request"
    ],
    faqs: [
      {
        q: "Why does music choice matter for my business?",
        a: [
          [
            "Research shows tempo and genre influence how long guests stay and how much they spend."
          ]
        ]
      },
      {
        q: "How do I choose music that fits my brand?",
        a: [
          [
            "Start with the mood you want guests to feel, then pick a tempo and genre that support it."
          ]
        ]
      },
      {
        q: "Should morning and evening sound different?",
        a: [
          [
            "Usually yes. Most venues benefit from calmer mornings and more energy in the evening."
          ]
        ]
      },
      {
        q: "Does background music affect my staff too?",
        a: [
          [
            "Yes. Staff hear the same soundtrack for full shifts, so pacing and repetition matter for them as well."
          ]
        ]
      },
      {
        q: "Can I get advice on building a sound identity for my venue?",
        a: [
          [
            "Yes. Our support team and blog articles cover this in detail."
          ]
        ]
      }
    ]
  },
  {
    id: "troubleshooting-and-support",
    title: "Troubleshooting and Support",
    icon: LifeBuoy,
    footer: [
      "Was this information helpful? Yes / No",
      "Have more questions? Submit a request"
    ],
    faqs: [
      {
        q: "What if the music stops unexpectedly?",
        a: [
          [
            "Check your internet connection first, then contact support if the issue continues."
          ]
        ]
      },
      {
        q: "What browsers are supported?",
        a: [
          [
            "Most modern browsers work. We recommend keeping your browser updated for best performance."
          ]
        ]
      },
      {
        q: "Who do I contact for help?",
        a: [
          [
            "Use the ‘Submit a Request’ link in the Help Centre, and our team will respond."
          ]
        ]
      },
      {
        q: "Is support included in every plan?",
        a: [
          [
            "Yes, though response times may vary by plan level."
          ]
        ]
      },
      {
        q: "Can I get help choosing a schedule for my venue type?",
        a: [
          [
            "Yes. Support can help you set an appropriate starting schedule."
          ]
        ]
      }
    ]
  },
  {
    id: "holidays-and-special-cases",
    title: "Holidays and Special Cases",
    icon: Gift,
    faqs: [
      {
        q: "Is holiday music automatically covered by my subscription?",
        a: [
          [
            "Yes, if it comes from our catalogue. Downloaded or outside holiday tracks are not covered."
          ]
        ]
      },
      {
        q: "Are old or classic songs automatically free to play?",
        a: [
          [
            "No. Most classic songs remain under copyright for decades and still require proper licensing."
          ]
        ]
      }
    ]
  }
];
