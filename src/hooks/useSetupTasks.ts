"use client";

import { useAuth, useOrganization } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAccess } from "./useAccess";
import { setupTasks, type SetupTask } from "@/lib/tasks";

/** The setup checklist for the current venue, worked out from live data. */
export function useSetupTasks(): { tasks: SetupTask[]; remaining: number; loading: boolean } {
  const { isAuthenticated } = useConvexAuth();
  const profile = useAccess()?.profile;
  // Same query as the schedule page, so Convex serves both from one subscription.
  const blocks = useQuery(api.scheduleBlocks.listByUser, isAuthenticated ? {} : "skip");
  const { organization } = useOrganization();
  const isCurator = useAuth().orgRole === "org:member";

  const tasks = setupTasks({
    plan: profile?.plan,
    venueName: profile?.venueName,
    logoStorageId: profile?.logoStorageId,
    genres: profile?.genres,
    tempo: profile?.tempo,
    membersCount: organization?.membersCount,
    scheduleBlockCount: blocks?.length ?? 0,
    isCurator,
  });
  return {
    tasks,
    remaining: tasks.filter((t) => !t.done).length,
    loading: profile === undefined || blocks === undefined,
  };
}
