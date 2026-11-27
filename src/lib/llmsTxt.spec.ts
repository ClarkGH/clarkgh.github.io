import { describe, expect, it } from 'vitest';
import { type ProjectEntry, buildLlmsTxt } from './llmsTxt';
import { OWNER } from './site';

const site = new URL('https://example.com');
const project = (over: Partial<ProjectEntry>): ProjectEntry => ({
  id: 'demo',
  title: 'Demo',
  summary: 'A demo.',
  repo: 'https://github.com/x/demo',
  status: 'active',
  order: 1,
  ...over,
});

describe('buildLlmsTxt', () => {
  it('opens with one H1 and a blockquote summary, as llmstxt.org and Lighthouse expect', () => {
    const lines = buildLlmsTxt([project({})], site).split('\n');
    expect(lines[0]).toBe(`# ${OWNER.name}`);
    expect(lines.filter((l) => l.startsWith('# '))).toHaveLength(1);
    expect(lines[2]).toMatch(/^> /);
  });

  it('lists projects in display order, each linking to its page with status and repo', () => {
    const text = buildLlmsTxt(
      [project({ id: 'b', title: 'Second', order: 2, status: 'done' }), project({ id: 'a', title: 'First', order: 1 })],
      site,
    );
    expect(text.indexOf('[First]')).toBeLessThan(text.indexOf('[Second]'));
    expect(text).toContain('[Second](https://example.com/projects/b/): A demo. Status: Done. Code: https://github.com/x/demo');
  });

  it('keeps each project on one line, even if its summary wraps', () => {
    const text = buildLlmsTxt([project({ summary: 'Line one\n  line two.' })], site);
    expect(text).toContain('Line one line two.');
  });

  it('links the owner’s email and profiles', () => {
    const text = buildLlmsTxt([], site);
    expect(text).toContain(`(mailto:${OWNER.email})`);
    expect(text).toContain(`(${OWNER.github})`);
    expect(text).toContain(`(${OWNER.linkedin})`);
  });

  it('has a well-formed email address to link to', () => {
    expect(OWNER.email).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i);
  });
});
