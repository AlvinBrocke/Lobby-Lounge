import { redirect } from "next/navigation";

// Channels are gone; Playlists is now the home screen. /dashboard stays as a
// redirect because sign-in, onboarding, proxy.ts and the error pages all send
// people here — one redirect keeps every one of those working.
export default function DashboardPage() {
  redirect("/playlists");
}
