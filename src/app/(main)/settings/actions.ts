"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { describeClerkError } from "@/lib/clerkErrors";
import { getConvexToken, getSession } from "@/lib/session";
import { isStaffRole } from "@/lib/staff";

// One flat shape: with `strict` off, TypeScript won't narrow a `{ ok: true } | { ok: false }` union.
export type StaffResult = { ok: boolean; orgId?: string; error?: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Turns a solo account into a venue team: a Clerk organization whose
 * `publicMetadata.venueOwnerId` is the caller. Venue data stays keyed by the
 * owner's user id, so nothing has to be migrated.
 */
export async function createVenueTeam(): Promise<StaffResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Not signed in" };

  try {
    const client = await clerkClient();
    // One venue per account: staff of another venue can't spin up their own.
    const { totalCount } = await client.users.getOrganizationMembershipList({ userId: session.userId });
    if (totalCount > 0) return { ok: false, error: "You're already part of a venue team." };

    const profile = await fetchQuery(api.userProfiles.get, {}, { token: await getConvexToken() });
    const org = await client.organizations.createOrganization({
      name: profile?.venueName || "My venue",
      createdBy: session.userId, // becomes the org's first admin
      // Only the Backend API can write publicMetadata, so no one can point a venue at someone else's data.
      publicMetadata: { venueOwnerId: session.userId },
    });
    return { ok: true, orgId: org.id };
  } catch (e) {
    console.error("createVenueTeam failed", e);
    return { ok: false, error: "Could not set up your team. Please try again." };
  }
}

/** Emails a Clerk invitation whose link lands on our own /signup page. */
export async function inviteStaff(emailAddress: string, role: string): Promise<StaffResult> {
  // Re-verify here: Server Actions are public endpoints.
  const { userId, orgId, orgRole } = await auth();
  if (!userId || !orgId) return { ok: false, error: "Not signed in" };
  if (orgRole !== "org:admin") return { ok: false, error: "Only admins can invite team members." };
  const email = typeof emailAddress === "string" ? emailAddress.trim() : "";
  if (email.length > 254 || !EMAIL.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (!isStaffRole(role)) return { ok: false, error: "Pick a role." };

  // Next.js rejects Server Action calls whose Origin doesn't match the host, so this is our own origin.
  const origin = (await headers()).get("origin");
  try {
    const client = await clerkClient();
    await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      inviterUserId: userId,
      emailAddress: email,
      role,
      redirectUrl: origin ? `${origin}/signup` : undefined,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: describeClerkError(e) };
  }
}
