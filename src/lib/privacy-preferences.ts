/**
 * Sale/sharing opt-out preference (CCPA/CPRA).
 *
 * The Privacy Policy (§10, §11.B.4) and Cookies Policy (§4) promise two ways to
 * opt out of "sharing" for cross-context behavioral advertising: the
 * "Do Not Sell or Share" footer link, and the browser's Global Privacy Control
 * (GPC) signal. Both resolve to this cookie.
 *
 * There are no third-party ad/analytics scripts in the app today. When one is
 * added (GA, Meta pixel, Google Ads, etc.), it MUST check `getSharingOptOut()`
 * before loading — this cookie is the gate the policy relies on.
 */

export const SHARING_OPT_OUT_COOKIE = "ll_opt_out_sharing";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function getSharingOptOut(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim() === `${SHARING_OPT_OUT_COOKIE}=1`);
}

export function setSharingOptOut(optedOut: boolean): void {
  if (typeof document === "undefined") return;
  const maxAge = optedOut ? ONE_YEAR_SECONDS : 0; // 0 expires it immediately
  document.cookie = `${SHARING_OPT_OUT_COOKIE}=${optedOut ? "1" : ""}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

/** True when the browser is broadcasting a Global Privacy Control signal. */
export function hasGPCSignal(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}
