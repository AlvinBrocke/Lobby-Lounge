/**
 * Clerk's two built-in organization roles, as venue roles. "Owner" isn't a
 * Clerk role: it's the admin whose id is the org's `publicMetadata.venueOwnerId`.
 */
export const STAFF_ROLES = [
  { key: "org:admin", label: "Admin", blurb: "Everything, including billing and the team" },
  { key: "org:member", label: "Curator", blurb: "Music, schedules and announcements" },
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number]["key"];

export const isStaffRole = (role: unknown): role is StaffRole => STAFF_ROLES.some((r) => r.key === role);

export const roleLabel = (role: string) => STAFF_ROLES.find((r) => r.key === role)?.label ?? role;
