import { useOrganization, useUser } from "@clerk/nextjs";

/**
 * Whose venue the signed-in user is running: the active organization's owner,
 * or the user themself on a solo account. Venue data and the plan live under
 * this id (see requireUser in convex/lib/auth.ts).
 */
export function useVenueOwnerId(): string | undefined {
  const { user } = useUser();
  const { organization } = useOrganization();
  return organization?.publicMetadata.venueOwnerId ?? user?.id;
}
