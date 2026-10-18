import { create } from "zustand";

export type TourStep = {
  id: string;
  /** Page to open first. Omitted: stay on whatever page is showing. */
  route?: string;
  /** `data-tour` value of the element to spotlight. Omitted: a centred card. */
  target?: string;
  title: string;
  body: string;
  /** Hidden from curators (org:member), who don't see the team or billing. */
  adminOnly?: boolean;
};

/** In the order a new venue would use them. Copy follows TourMap's `stops`. */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Lobby & Lounge",
    body: "A two-minute look around so you can get your venue's music going. You can skip at any time.",
  },
  {
    id: "playlists",
    route: "/playlists",
    target: "nav-playlists",
    title: "Playlists",
    body: "Curated daytime and evening playlists live here. You can build your own mix from the catalogue too.",
  },
  {
    id: "search",
    target: "search",
    title: "Search",
    body: "Type to find a playlist, or tap the empty box to browse.",
  },
  {
    id: "play",
    route: "/playlists",
    target: "playlist-card",
    title: "Play something",
    body: "Tap the play button on any playlist to start the music. The tour moves on once it's playing.",
  },
  {
    id: "player",
    target: "player-bar",
    title: "The player",
    body: "Play, pause, skip and see what's up next. Keep this tab open so the music keeps playing.",
  },
  {
    id: "schedule",
    route: "/schedule",
    target: "nav-schedule",
    title: "Schedule",
    body: "Set a playlist for every hour of the week. It repeats automatically.",
  },
  {
    id: "announcements",
    route: "/announcements",
    target: "nav-announcements",
    title: "Announcements",
    body: "Create short voice messages and choose when they play.",
  },
  {
    id: "settings",
    route: "/settings",
    target: "nav-settings",
    title: "Settings",
    body: "Venue details, your team, and your plan & billing.",
    adminOnly: true,
  },
  {
    id: "help",
    target: "help-button",
    title: "Help is always here",
    body: "Tap ? any time to replay this tour or open the guides and FAQs.",
  },
];

export function visibleSteps(isCurator: boolean): TourStep[] {
  return TOUR_STEPS.filter((s) => !(isCurator && s.adminOnly));
}

type TourState = {
  active: boolean;
  index: number;
  start: () => void;
  next: () => void;
  back: () => void;
  stop: () => void;
};

/** Global so the "?" menu, the auto-start and the overlay share one tour. */
export const useTour = create<TourState>((set) => ({
  active: false,
  index: 0,
  start: () => set({ active: true, index: 0 }),
  // Going past the last step is the overlay's job: it finishes the tour instead.
  next: () => set((s) => ({ index: s.index + 1 })),
  back: () => set((s) => ({ index: Math.max(0, s.index - 1) })),
  stop: () => set({ active: false, index: 0 }),
}));
