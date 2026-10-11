import type { MetadataRoute } from "next";

// Lets staff "Add to Home Screen" on the venue tablet: the app then opens
// full-screen with no browser bars, and the OS is slower to evict it than a tab.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lobby & Lounge",
    short_name: "Lobby & Lounge",
    description: "Music for Business",
    start_url: "/playlists",
    display: "standalone",
    orientation: "any",
    background_color: "#080e1d",
    theme_color: "#0d1628",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
