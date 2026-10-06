import { redirect } from "next/navigation";

// Billing now lives in a tab on /settings (the design's single "account
// control center"). Kept as a redirect so old links and bookmarks still work.
export default function AccountPage() {
  redirect("/settings?tab=billing");
}
