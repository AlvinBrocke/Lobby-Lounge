/** Artist names can hold `/`, `&` or `%`, so they're always encoded in URLs. */
export function artistHref(name: string): string {
  return `/artists/${encodeURIComponent(name)}`;
}

/**
 * The artist name from a `/artists/[name]` route param. Falls back to the raw
 * param when it's already decoded, e.g. "100%", which `decodeURIComponent` rejects.
 */
export function artistFromParam(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}
