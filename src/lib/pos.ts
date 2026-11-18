/**
 * Wording for Settings → Integrations. Pure, so it's tested in pos.test.ts.
 */

export interface SquareConnectionView {
  status: "connected" | "revoked";
  locationName: string | null;
  lastOrderAt: number | null;
  needsAttention: boolean;
}

/** "4 minutes ago", "3 hours ago", "2 days ago". */
export function timeAgo(ms: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - ms) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

/** The one-line health check under the Square card, e.g. "Connected to Square · Main Street. Last order received 4 minutes ago." */
export function squareHealthLine(conn: SquareConnectionView, now: number): string {
  if (conn.status === "revoked") return "Square access was removed from your Square Dashboard. Reconnect to keep AutoLobby following your hours.";
  if (conn.needsAttention) return "We couldn't renew access to your Square account. Reconnect to keep it working.";
  if (!conn.locationName) return "Connected to Square. Choose the location whose orders should guide your music.";
  const last = conn.lastOrderAt ? `Last order received ${timeAgo(conn.lastOrderAt, now)}.` : "No orders received yet.";
  return `Connected to Square · ${conn.locationName}. ${last}`;
}

/** The banner after Square sends the browser back (`?square=` from convex/square.ts → oauthCallback). */
export const SQUARE_RETURN_MESSAGES: Record<string, { tone: "ok" | "info" | "error"; text: string }> = {
  connected: { tone: "ok", text: "Square is connected." },
  denied: { tone: "info", text: "Square wasn't connected, because access wasn't allowed. Nothing was changed." },
  expired: { tone: "error", text: "That Square sign-in took too long or was already used. Please try connecting again." },
  error: { tone: "error", text: "We couldn't finish connecting to Square. Please try again." },
};
