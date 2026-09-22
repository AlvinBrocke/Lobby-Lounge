"use client";

import Link from "next/link";

/**
 * Route-level error boundary. Convex's `useQuery` throws server errors during
 * render — e.g. a malformed id in the URL, or "Not authorized" for someone
 * else's private playlist — and Next.js renders this instead of crashing.
 */
export default function PlaylistError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-lg font-bold text-foreground mb-2">Can&rsquo;t open this playlist</p>
      <p className="text-sm text-muted-foreground mb-6">
        It doesn&rsquo;t exist or you don&rsquo;t have access to it.
      </p>
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
