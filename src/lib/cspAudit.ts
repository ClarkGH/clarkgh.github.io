// The rules behind scripts/checkCsp.mjs, kept here so they can be unit-tested.
// Given one built page, list everything its Content Security Policy would silently block.
// See docs/security.md#the-csp-check.
import { createHash } from 'node:crypto';

const sha256 = (text: string) => `sha256-${createHash('sha256').update(text).digest('base64')}`;

const INLINE = /<(script|style)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
const COMMENT = /<!--[\s\S]*?-->/g;
// A start tag, with attribute values matched whole so a quoted ">" or "style=" inside one can't confuse it.
const TAG = /<[a-zA-Z][\w:-]*((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*\/?>/g;
const ATTR = /([^\s"'>/=]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
const URL_ATTRS = new Set(['href', 'src', 'action', 'formaction']);

/** Problems on one page, each a short human-readable line. An empty list means the page is fine. */
export function auditPage(html: string): string[] {
  const problems: string[] = [];

  const csp = html.match(/http-equiv="content-security-policy" content="([^"]*)"/i)?.[1];
  if (!csp) return ['no CSP <meta>'];
  const allowed = new Set([...csp.matchAll(/'(sha256-[^']+)'/g)].map((m) => m[1]));

  // 1. Every inline <script> and <style> must be hashed into the policy.
  for (const [, tag, attrs = '', body] of html.matchAll(INLINE)) {
    if (/\ssrc=/i.test(attrs) || /application\/ld\+json/i.test(attrs)) continue; // external, or data that never runs
    if (!allowed.has(sha256(body))) problems.push(`inline <${tag}> not in CSP: ${body.trim().slice(0, 60)}`);
  }

  // 2. Attributes a hash-based policy blocks outright: style="", on*="" handlers, javascript: URLs.
  // Only real start tags are scanned, so prose, comments and script bodies can't trip it.
  const markup = html.replace(INLINE, (m) => m.slice(0, m.indexOf('>') + 1)).replace(COMMENT, '');
  for (const [, attrs] of markup.matchAll(TAG)) {
    for (const [, rawName, rawValue = ''] of attrs.matchAll(ATTR)) {
      const name = rawName.toLowerCase();
      const value = rawValue.replace(/^["']|["']$/g, '').trim();
      if (name === 'style') problems.push('style attribute (use a class)');
      else if (/^on[a-z]+$/.test(name)) problems.push(`${name} handler attribute (use addEventListener in a script)`);
      else if (URL_ATTRS.has(name) && /^javascript:/i.test(value)) problems.push(`javascript: URL in ${name}`);
    }
  }

  return problems;
}
