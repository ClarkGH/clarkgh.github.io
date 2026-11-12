# Claude's Rules for the Portfolio

Clark's portfolio site. Small, but public-facing: accessibility, performance and security are part of "working", not extras.

## Where things live

Read the relevant doc before touching a system. Don't restate docs here or in code comments; link to them.

- [docs/INDEX.md](docs/INDEX.md) - overview and doc map
- [docs/project-structure.md](docs/project-structure.md) - every file in `src/`, and testing. A spec fails if the tree drifts
- [docs/site-shell.md](docs/site-shell.md) - layout, theme, header/footer, learning menu, accessibility
- [docs/wireframe.md](docs/wireframe.md) - the hero: WebGL 2, quaternions, the motion loop, input
- [docs/content.md](docs/content.md) - projects as Markdown, screenshots, alt text
- [docs/performance-seo.md](docs/performance-seo.md) - fonts, images, CSS, metadata, sitemap, deploy
- [docs/security.md](docs/security.md) - CSP, referrer policy, external links, the CSP check

## Hard rules

- **WCAG 2.2 AA** is the floor. Check contrast, keyboard, focus, reflow at 320px and reduced motion for any UI change.
- **CSP:** no `'unsafe-inline'` or `'unsafe-eval'`, no `style=""` attributes, no new inline scripts outside `src/lib/themeInit.ts`, no new origins.
- **External template links** use `EXTERNAL_REL` or `PROFILE_REL` from `src/lib/externalLinks.ts`.
- **Screenshots** need `imageAlt` (the schema enforces it).
- **Serif only** (Piazzolla). No monospace, no pill tags. Colors come from tokens in `global.css`.
- **American English** in code, comments, docs and copy.
- **Copy is Clark's voice:** humble and plain, no boasting.
- **HTML compressor gotcha:** keep a word and the link after it on the same line, or the space disappears.

## Commands

- `pnpm test` - Vitest, specs are colocated `*.spec.ts`
- `pnpm build` - specs, `astro check`, build, then `scripts/checkCsp.mjs`
- `pnpm preview` - serve `dist/`; the CSP only applies here, not in `pnpm dev`

## What "done" means

`pnpm build` is green: specs, type check, build and CSP check. If something is red and can't be fixed in scope, stop and say why. Don't weaken, skip or delete a test or check to get green.

## How we work

- Small diffs. No drive-by refactors, no speculative abstraction (YAGNI).
- Logic that can break silently goes in a module with no WebGL or DOM, with a spec.
- Docs change with the code. Adding, moving or deleting a file means updating the tree in project-structure.md.
- Clark commits. Never commit or offer to.
