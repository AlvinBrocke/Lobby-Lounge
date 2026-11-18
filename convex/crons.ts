import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Backs the "Curated weekly" promise on the landing page: every Monday, pull
// fresh Jamendo tracks into each curated playlist. syncPlaylist dedupes by track name,
// so re-running is safe.
crons.weekly(
  "refresh jamendo catalogue",
  { dayOfWeek: "monday", hourUTC: 4, minuteUTC: 0 },
  internal.jamendo.syncAllCurated,
  { limit: 50 },
);

// Square access tokens last 30 days; renew any within a week of expiring.
crons.daily("refresh square tokens", { hourUTC: 5, minuteUTC: 0 }, internal.square.refreshExpiring, {});

// Order times older than 60 days, and unused "Connect with Square" states.
crons.daily("purge old pos data", { hourUTC: 5, minuteUTC: 30 }, internal.square.purgeOld, {});

// Local weather for venues playing with AutoLobby's "Follow the weather" on.
crons.interval("refresh weather", { minutes: 30 }, internal.weather.refreshAll, {});

export default crons;
