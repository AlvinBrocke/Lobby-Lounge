/**
 * The setup checklist on /tasks. Each task's `done` is worked out from data the
 * venue already has, so nothing is stored and a task can't be ticked early.
 */

export type SetupTaskKey = "subscribe" | "venue" | "music" | "team" | "schedule";

export interface SetupInput {
  plan?: string;
  venueName?: string;
  logoStorageId?: string;
  genres?: string[];
  tempo?: string;
  /** Clerk `organization.membersCount`; undefined when the venue has no team yet. */
  membersCount?: number;
  scheduleBlockCount: number;
  isCurator: boolean;
}

export interface SetupTask {
  key: SetupTaskKey;
  eyebrow: string;
  title: string;
  description: string;
  button: string;
  href: string;
  done: boolean;
}

export function setupTasks(input: SetupInput): SetupTask[] {
  const tasks: (SetupTask & { adminOnly?: boolean })[] = [
    {
      key: "subscribe",
      adminOnly: true,
      eyebrow: "Billing",
      title: "Choose your plan",
      description: "Subscribe before your free trial ends so the music keeps playing.",
      button: "Go to billing",
      href: "/settings?tab=billing",
      done: input.plan === "basic",
    },
    {
      key: "venue",
      eyebrow: "Complete setup",
      title: "Update your profile",
      description: "Add your venue name and logo so your team and guests see your brand.",
      button: "Edit venue details",
      href: "/settings",
      done: Boolean(input.venueName?.trim() && input.logoStorageId),
    },
    {
      key: "music",
      eyebrow: "Music",
      title: "Set your music preferences",
      description: "Pick genres and a tempo so suggestions fit your space.",
      button: "Open preferences",
      href: "/settings?tab=preferences",
      done: (input.genres?.length ?? 0) > 0 && Boolean(input.tempo),
    },
    {
      key: "team",
      adminOnly: true,
      eyebrow: "Zone & staff",
      title: "Invite your team",
      description: "Invite teammates as Admins or Curators so they can run schedules and playback.",
      button: "Manage team",
      href: "/settings?tab=staff",
      done: (input.membersCount ?? 0) > 1,
    },
    {
      key: "schedule",
      eyebrow: "Schedule",
      title: "Schedule your music",
      description: "Plan playlists for the week ahead — they repeat automatically.",
      button: "Open schedule",
      href: "/schedule",
      done: input.scheduleBlockCount > 0,
    },
  ];
  return tasks
    .filter((t) => !(input.isCurator && t.adminOnly))
    .map(({ adminOnly: _adminOnly, ...task }) => task);
}
