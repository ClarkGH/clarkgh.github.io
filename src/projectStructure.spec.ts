// docs/project-structure.md is a gate: its tree and src/ must list the same files.
import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** File paths (relative to src/) from the tree in the "Project directory structure" section. */
function filesInDoc(): string[] {
  const doc = readFileSync('docs/project-structure.md', 'utf8');
  const section = doc.split('## Project directory structure')[1] ?? '';
  const tree = section.split('```')[1] ?? '';
  const dirs: string[] = [];
  const files: string[] = [];
  tree.split('\n').forEach((line) => {
    const m = line.match(/^((?:│   |    )*)(?:├── |└── )([^#]+?)\s*(?:#.*)?$/);
    if (!m) return;
    const depth = m[1].length / 4;
    const name = m[2];
    dirs.length = depth;
    if (name.endsWith('/')) dirs.push(name.slice(0, -1));
    else files.push([...dirs, name].join('/'));
  });
  return files.sort();
}

const filesInSrc = () =>
  readdirSync('src', { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => `${d.parentPath}/${d.name}`.replace(/^src\//, ''))
    .sort();

describe('docs/project-structure.md', () => {
  it('lists every file in src/, and nothing that is not there', () => {
    expect(filesInDoc()).toEqual(filesInSrc());
  });
});
