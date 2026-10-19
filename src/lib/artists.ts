/** Artist names can hold `/`, `&` or `%`, so they're always encoded in URLs. */
export function artistHref(name: string): string {
  return `/artists/${encodeURIComponent(name)}`;
}

/** The artist name from a `/artists/[name]` route param. */
export function artistFromParam(param: string): string {
  return decodeURIComponent(param);
}
