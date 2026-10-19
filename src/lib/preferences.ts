// The venue's music profile options: picked during onboarding, editable
// later in Settings → Preferences.

// Ids prefix-match Jamendo tags (see CATEGORY_TAGS in convex/lib/energy.ts):
// suggestedPlaylists scores a playlist by `tag.startsWith(genreId)`, so keep
// ids like "jazz", "pop" and "electronic" stable or recommendations go blank.
export const GENRES = [
  { id: "jazz", name: "Jazz & Soul" },
  { id: "lounge", name: "Lounge & Chill" },
  { id: "classical", name: "Classical" },
  { id: "bossa-nova", name: "Bossa Nova" },
  { id: "ambient", name: "Ambient" },
  { id: "pop", name: "Pop & Indie" },
  { id: "electronic", name: "Electronic" },
  { id: "rnb", name: "R&B" },
  { id: "world", name: "World Music" },
  { id: "acoustic", name: "Acoustic" },
  { id: "blues", name: "Blues" },
  { id: "neo-soul", name: "Neo-Soul" },
  { id: "hip-hop", name: "Hip-Hop" },
  { id: "reggae", name: "Reggae" },
  { id: "latin", name: "Latin" },
  { id: "funk", name: "Funk & Groove" },
  { id: "house", name: "House & Techno" },
  { id: "folk", name: "Folk & Country" },
  { id: "orchestral", name: "Orchestral" },
  { id: "afrobeats", name: "Afrobeats" },
];

export const MAX_GENRES = 5;

export const MOODS = [
  { id: "relaxed", name: "Relaxed", emoji: "😌", description: "Calm & unhurried" },
  { id: "upbeat", name: "Upbeat", emoji: "⚡", description: "Energetic & lively" },
  { id: "elegant", name: "Elegant", emoji: "🎻", description: "Refined & polished" },
  { id: "focused", name: "Focused", emoji: "🎯", description: "Productive & clear" },
];

export const BUSINESS_TYPES = [
  "Hotel & Hospitality",
  "Restaurant & Café",
  "Retail & Boutique",
  "Wellness & Spa",
  "Corporate Office",
  "Bar & Nightlife",
  "Coworking & Studio",
  "Fitness & Studio",
  "Events & Venue",
  "Rooftop & Terrace",
  "Museum & Gallery",
  "Beauty & Salon",
  "Grocery & Market",
  "Yacht & Marina",
  "Cinema & Theatre",
];

export const AUDIENCE_GENDERS = [
  { id: "women", name: "Woman" },
  { id: "men", name: "Man" },
  { id: "mixed", name: "Mixed" },
];

export const AGE_GROUPS = [
  { id: "gen-z", name: "Gen Z", years: "18–27", description: "Digital & bold" },
  { id: "millennials", name: "Millennials", years: "28–43", description: "Experiences first" },
  { id: "gen-x", name: "Gen X", years: "44–59", description: "Quality matters" },
  { id: "boomers", name: "Boomers+", years: "60+", description: "Classic & refined" },
];

// Stored in userProfiles.guestDemographics.
export const LIFESTYLES = ["Mainstream", "Trendy", "Alternative", "Relaxed", "Luxury", "Family"];

// Onboarding's Low / Medium / High → sound.defaultVolume (0–100).
export const VOLUME_LEVELS = [
  { id: "low", name: "Low", hint: "Background", value: 30 },
  { id: "mid", name: "Medium", hint: "Fill", value: 50 },
  { id: "high", name: "High", hint: "Room", value: 80 },
];

export const TEMPOS = [
  { id: "low", name: "Slow", hint: "Relaxed" },
  { id: "mid", name: "Medium", hint: "Balanced" },
  { id: "high", name: "Fast", hint: "Energetic" },
];
