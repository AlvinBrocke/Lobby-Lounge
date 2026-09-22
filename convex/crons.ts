import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Backs the "Curated weekly" promise on the landing page: every Monday, pull
// fresh Jamendo tracks into each channel. syncChannel dedupes by track name,
// so re-running is safe.
crons.weekly(
  "refresh jamendo catalogue",
  { dayOfWeek: "monday", hourUTC: 4, minuteUTC: 0 },
  internal.jamendo.syncAllChannels,
  { limit: 50 },
);

export default crons;
