"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth, useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import posthog from "posthog-js";
import { ReactNode, useEffect, useRef } from "react";

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
 */
function ActivateVenue() {
  const { isLoaded, organization } = useOrganization();
  const { isLoaded: listLoaded, setActive, userMemberships } = useOrganizationList({ userMemberships: true });
  const firstOrgId = userMemberships.data?.[0]?.organization.id;

  useEffect(() => {
    if (isLoaded && listLoaded && !organization && firstOrgId) void setActive({ organization: firstOrgId });
  }, [isLoaded, listLoaded, organization, firstOrgId, setActive]);

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
