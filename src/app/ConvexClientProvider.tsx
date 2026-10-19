"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth, useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { ReactNode, useEffect, useRef } from "react";
import { createVenueTeam } from "@/app/(main)/settings/actions";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;
const posthogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

function PostHogUserIdentification() {
  const { isLoaded, user } = useUser();
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!posthogConfigured || !isLoaded) return;

    if (!user) {
      if (previousUserId.current) {
        posthog.reset();
        previousUserId.current = null;
      }
      return;
    }

    if (previousUserId.current && previousUserId.current !== user.id) {
      posthog.reset();
    }

    if (previousUserId.current !== user.id) {
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName ?? undefined,
      });
      previousUserId.current = user.id;
    }
  }, [isLoaded, user]);

  return null;
}

/**
 * Staff only see their venue's data while its organization is active on the
 * session (that's what puts `venue_owner` in the Convex token), and Clerk
 * doesn't always activate it after an invite is accepted. So pick it up here.
 * Owners with no org yet (accounts from before venue teams) get one created.
 */
function ActivateVenue() {
  const { isSignedIn } = useAuth();
  const { isLoaded, organization } = useOrganization();
  const { isLoaded: listLoaded, setActive, userMemberships } = useOrganizationList({ userMemberships: true });
  const firstOrgId = userMemberships.data?.[0]?.organization.id;
  const tried = useRef(false); // once per page load, so a not-yet-onboarded user doesn't loop

  useEffect(() => {
    if (!isSignedIn || !isLoaded || !listLoaded || organization || userMemberships.isLoading) return;
    // Both are network calls that can be cut off mid-navigation (e.g. right after the
    // OAuth redirect). Best-effort: the next page load retries, so just log.
    const onError = (err: unknown) => console.warn("ActivateVenue:", err);
    if (firstOrgId) {
      setActive({ organization: firstOrgId }).catch(onError);
    } else if (!tried.current) {
      tried.current = true;
      createVenueTeam()
        .then((res) => res.ok && setActive({ organization: res.orgId }))
        .catch(onError);
    }
  }, [isSignedIn, isLoaded, listLoaded, organization, userMemberships.isLoading, firstOrgId, setActive]);

  return null;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const content = (
    <>
      <PostHogUserIdentification />
      <ActivateVenue />
      {children}
    </>
  );

  if (!convex) return content;
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {content}
    </ConvexProviderWithClerk>
  );
}
