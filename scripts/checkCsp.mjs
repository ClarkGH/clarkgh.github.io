// Post-build gate: nothing in dist/ may be something its page's CSP would block.
// A miss doesn't break the build on its own, it silently breaks the page in the browser, so we fail here.
// The rules live in src/lib/cspAudit.ts, with specs. Run by `pnpm build`. See docs/security.md.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { auditPage } from '../src/lib/cspAudit.ts';

const pages = readdirSync('dist', { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.html'));
const problems = pages.flatMap((page) => auditPage(readFileSync(join('dist', page), 'utf8')).map((p) => `${page}: ${p}`));

if (problems.length) {
  console.error(`CSP check failed:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`CSP check: ${pages.length} pages, nothing the policy would block.`);
