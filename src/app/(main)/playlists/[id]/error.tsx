"use client";

import Link from "next/link";

/**
 * Route-level error boundary. Convex's `useQuery` throws server errors during
 * render — e.g. a malformed id in the URL, or "Not authorized" for someone
 * else's private playlist — and Next.js renders this instead of crashing.
 */
export default function PlaylistError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-lg font-bold text-foreground mb-2">Something went wrong</p>
      <p className="text-sm text-muted-foreground mb-6">
        This playlist couldn&rsquo;t be loaded. Check the link, or try again.
      </p>
      {/* Surface the real cause while developing; production builds hide it. */}
      {process.env.NODE_ENV === "development" && (
        <pre className="text-[11px] text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-6 max-w-xl whitespace-pre-wrap text-left">
          {error.message}
        </pre>
      )}
      <div className="flex gap-4">
        <button onClick={reset} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          Try again
        </button>
        <Link href="/playlists" className="text-sm font-semibold text-primary hover:underline">
          Back to My Playlists
        </Link>
      </div>
    </div>
  );
}
