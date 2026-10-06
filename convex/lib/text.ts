const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/**
 * Turns HTML entities back into the characters they stand for:
 * "Dada &amp; the Weathermen" → "Dada & the Weathermen".
 *
 * Jamendo's API returns some names HTML-escaped. React escapes text itself when
 * rendering, so a stored "&amp;" shows up literally on screen — we decode on the
 * way in and keep plain text in the database. One pass only, so a name that
 * genuinely contains "&amp;" after decoding isn't decoded twice.
 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X"
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      // Leave out-of-range numbers as they were rather than throwing.
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED[body.toLowerCase()] ?? match;
  });
}
