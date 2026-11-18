// Every action in .github/workflows/ is pinned to a full commit SHA with its exact version in a comment.
// Why: docs/security.md#everything-else-we-checked
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const WORKFLOWS = '.github/workflows';

/** Every `uses:` line in a workflow, as `{ line, ref, comment }`. */
function usesLines(yaml: string) {
  return yaml
    .split('\n')
    .map((line) => line.match(/^\s*(?:-\s*)?uses:\s*["']?([^\s"'#]+)["']?\s*(#.*)?$/))
    .filter((m) => m !== null)
    .map((m) => ({ line: m[0].trim(), ref: m[1], comment: m[2] ?? '' }));
}

/** Pinned: `owner/repo[/path]@<40 hex>` plus `# vX.Y.Z`. Local actions (`./…`) run our own code, so they pass. */
function isPinned({ ref, comment }: { ref: string; comment: string }) {
  if (ref.startsWith('./')) return true;
  return /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/.test(ref) && /^#\s*v\d+\.\d+\.\d+\b/.test(comment);
}

describe('isPinned', () => {
  const check = (yaml: string) => usesLines(yaml).map(isPinned);

  it('accepts a full SHA with an exact version comment', () => {
    expect(check('      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1')).toEqual([true]);
    expect(check('        uses: "actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346" # v5.0.1')).toEqual([true]);
    expect(check('      - uses: ./.github/actions/local')).toEqual([true]);
  });

  it('rejects tags, short SHAs and missing or vague version comments', () => {
    expect(check('      - uses: actions/checkout@v7')).toEqual([false]);
    expect(check('      - uses: actions/checkout@3d3c42e # v7.0.1')).toEqual([false]);
    expect(check('      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1')).toEqual([false]);
    expect(check('      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7')).toEqual([false]);
  });
});

describe(WORKFLOWS, () => {
  const files = readdirSync(WORKFLOWS).filter((f) => /\.ya?ml$/.test(f));
  const usesIn = (file: string) => usesLines(readFileSync(`${WORKFLOWS}/${file}`, 'utf8'));

  it('finds actions to check', () => {
    // If the pattern broke and matched nothing, every file below would pass silently.
    expect(files.flatMap(usesIn).length).toBeGreaterThan(0);
  });

  it.each(files)('%s pins every action to a commit SHA', (file) => {
    expect(usesIn(file).filter((u) => !isPinned(u)).map((u) => u.line)).toEqual([]);
  });
});
