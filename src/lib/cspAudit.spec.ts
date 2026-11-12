import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { auditPage } from './cspAudit';

const hash = (text: string) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

/** A minimal built page whose CSP allows exactly the inline scripts and styles given in `allow`. */
const page = (body: string, allow: string[] = []) =>
  `<!doctype html><html lang="en"><head>` +
  `<meta http-equiv="content-security-policy" content="default-src 'self'; script-src 'self' ${allow.map(hash).join(' ')}">` +
  `</head><body>${body}</body></html>`;

describe('auditPage', () => {
  it('passes a page whose inline script is hashed into its policy', () => {
    const js = 'console.log(1)';
    expect(auditPage(page(`<script>${js}</script>`, [js]))).toEqual([]);
  });

  it('flags a page with no CSP meta', () => {
    expect(auditPage('<html><body></body></html>')).toEqual(['no CSP <meta>']);
  });

  it('flags inline scripts and styles missing from the policy', () => {
    const problems = auditPage(page('<script>alert(1)</script><style>p{color:red}</style>'));
    expect(problems).toHaveLength(2);
    expect(problems[0]).toMatch(/inline <script>/);
    expect(problems[1]).toMatch(/inline <style>/);
  });

  it('skips external scripts and JSON-LD, which never run inline', () => {
    expect(auditPage(page('<script src="/a.js"></script><script type="application/ld+json">{"a":1}</script>'))).toEqual([]);
  });

  it('flags style attributes however they are quoted', () => {
    for (const attr of ['style="color:red"', "style='color:red'", 'style=color:red', 'STYLE="x"']) {
      expect(auditPage(page(`<p ${attr}>Hi</p>`)), attr).toEqual(['style attribute (use a class)']);
    }
  });

  it('flags inline event handlers, which a hash-based policy blocks', () => {
    expect(auditPage(page('<img src="/a.png" onload="go()">'))).toEqual(['onload handler attribute (use addEventListener in a script)']);
    expect(auditPage(page('<button ONCLICK="go()">Go</button>'))).toHaveLength(1);
  });

  it('flags javascript: URLs', () => {
    expect(auditPage(page('<a href=" javascript:go()">Go</a>'))).toEqual(['javascript: URL in href']);
  });

  it('ignores the same words in prose, comments, attribute values and script bodies', () => {
    const js = 'el.innerHTML = \'<a onclick="x" style="y">\'';
    const body =
      '<p>Never write style="color: red" or onclick="go()" in markup.</p>' +
      '<!-- <div style="x" onclick="y"> -->' +
      '<img src="/a.png" alt="the onload= trick and a style=&quot;x&quot; attribute">' +
      '<a href="/javascript:-the-good-parts/" data-style="x" data-onboarding="y">Book</a>' +
      `<script>${js}</script>`;
    expect(auditPage(page(body, [js]))).toEqual([]);
  });
});
