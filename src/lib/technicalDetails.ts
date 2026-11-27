// A project's "## Technical details" section becomes a collapsed <details> on its page, so the page
// reads short for everyone and engineers open the depth. See docs/content.md#technical-details.

/** The id Astro gives a "## Technical details" heading. */
export const TECHNICAL_ID = 'technical-details';

const HEADING = new RegExp(`<h2[^>]*\\bid="${TECHNICAL_ID}"[^>]*>[\\s\\S]*?</h2>`);

/**
 * Splits a project's rendered HTML at its "Technical details" heading. `technical` is everything
 * after the heading (the heading itself is dropped: the <summary> replaces it), or null if there is none.
 */
export function splitTechnical(html: string): { main: string; technical: string | null } {
  const match = HEADING.exec(html);
  if (!match) return { main: html, technical: null };
  return { main: html.slice(0, match.index), technical: html.slice(match.index + match[0].length) };
}
