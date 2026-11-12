// `rel` values for links that leave the site. See docs/security.md.
// Markdown links don't get these: the page-wide referrer policy in Base.astro covers them.

/** No window.opener access, no Referer header. */
export const EXTERNAL_REL = 'noopener noreferrer';

/** Links to Clark's own profiles: `me` lets those sites verify the link back. */
export const PROFILE_REL = `me ${EXTERNAL_REL}`;
