/**
 * Example Server Component using Supabase
 *
 * This demonstrates how to fetch data from Supabase
 * directly in a Server Component for optimal performance.
 */

import { getTracksServer } from "@/lib/supabase-server";

export async function ServerTrackList() {
  const tracks = await getTracksServer(20);

  if (tracks.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>No tracks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
        >
          {track.image && (
            <img
              src={track.image}
              alt={track.name}
              className="w-12 h-12 rounded object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{track.name}</h3>
            {track.artist && (
              <p className="text-sm text-gray-400 truncate">{track.artist}</p>
            )}
          </div>
          {track.category && (
            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
              {track.category}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
