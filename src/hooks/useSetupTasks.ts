"use client";

import { useAuth, useOrganization } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAccess } from "./useAccess";
import { requiredTasks, setupTasks, type SetupTask } from "@/lib/tasks";

/** The setup checklist for the current venue, worked out from live data. */
/** `remaining` and progress count required tasks only; optional ones (Custom POS integrations) never nag. */
export function useSetupTasks(): {
  tasks: SetupTask[];
  required: number;
  remaining: number;
  loading: boolean;
} {
  const { isAuthenticated } = useConvexAuth();
  const profile = useAccess()?.profile;
  // Same query as the schedule page, so Convex serves both from one subscription.
  const blocks = useQuery(api.scheduleBlocks.listByUser, isAuthenticated ? {} : "skip");
  const { organization } = useOrganization();
  const isCurator = useAuth().orgRole === "org:member";
  const pos = useQuery(api.square.status, isAuthenticated ? {} : "skip");

  const tasks = setupTasks({
    plan: profile?.plan,
    venueName: profile?.venueName,
    logoStorageId: profile?.logoStorageId,
    genres: profile?.genres,
    tempo: profile?.tempo,
    membersCount: organization?.membersCount,
    scheduleBlockCount: blocks?.length ?? 0,
    isCurator,
    posConnected: pos?.connection?.status === "connected" && !!pos.connection.locationId,
    posOptOut: profile?.posOptOut,
  });
  return {
    tasks,
    required: requiredTasks(tasks).length,
    remaining: requiredTasks(tasks).filter((t) => !t.done).length,
    loading: profile === undefined || blocks === undefined,
  };
}
