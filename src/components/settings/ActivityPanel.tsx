"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { initialsOf } from "@/components/layout/VenueAvatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNow } from "@/hooks/useNow";
import { timeAgo } from "@/lib/utils";

/** The "Activity log" settings tab: who changed what in the venue, newest first. */
export function ActivityPanel() {
  const { isAuthenticated } = useConvexAuth();
  const rows = useQuery(api.activity.listRecent, isAuthenticated ? {} : "skip");
  const now = useNow(60_000).getTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace activity</CardTitle>
        <CardDescription>The last 50 changes made by you and your team.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows === undefined ? (
          <p className="text-xs text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Changes to your schedule, playlists and announcements will show up here.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-foreground/5">
            {rows.map((row) => (
              <li key={row._id} className="flex items-center gap-3 py-2.5">
                <span
                  aria-hidden
                  className="w-7 h-7 shrink-0 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold flex items-center justify-center"
                >
                  {initialsOf(row.actorName)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground truncate">
                    <span className="font-bold">{row.actorName}</span> · {row.summary}
                  </div>
                </div>
                <time
                  dateTime={new Date(row._creationTime).toISOString()}
                  className="text-[10px] text-faint shrink-0"
                >
                  {timeAgo(row._creationTime, now)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
