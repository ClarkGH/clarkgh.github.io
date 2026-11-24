# Project Structure

## Table of Contents

- [Naming conventions](#naming-conventions)
- [Project directory structure](#project-directory-structure)
- [Outside src](#outside-src)
- [Testing](#testing)
- [Navigation](#navigation)

## Naming conventions

- TS files use camel case (`themeInit.ts`). Astro components use Pascal case (`LearnMenu.astro`).
- Pages follow Astro's file-based routing: the file path is the URL.
- Project Markdown files are named for their URL slug (`vector-rag-nuxt.md` → `/projects/vector-rag-nuxt/`).
- Specs sit next to the code they test, named `*.spec.ts`.

## Project directory structure

```
src/
├── assets/
│   ├── fonts/                     # Piazzolla TTFs for the social card; build-only, never shipped
│   │   ├── OFL.txt                # the fonts' license (SIL Open Font License), kept with them
│   │   ├── Piazzolla-Italic-Variable.ttf
│   │   └── Piazzolla-Variable.ttf
│   └── projects/                  # screenshots; Astro resizes them and serves WebP
│       ├── date-picker.png
│       ├── images-to-slideshow.png
│       ├── shotlify.png
│       ├── smackhem.png
│       ├── springvue.png
│       └── vector-rag-nuxt.png
├── components/
│   ├── LearnMenu.astro            # the learning menu: a side sheet of free resources
│   └── Wireframe.astro            # the hero figure: canvas, caption, spin toggle
├── content/
│   └── projects/                  # one Markdown file per project
│       ├── date-picker.md
│       ├── images-to-slideshow.md
│       ├── shotlify.md
│       ├── smackhem.md
│       ├── springvue.md
│       └── vector-rag-nuxt.md
├── layouts/
│   └── Base.astro                 # <head>, header, footer, menu wiring, theme toggle
├── lib/
│   ├── cspAudit.spec.ts
│   ├── cspAudit.ts                # the CSP check's rules, run by scripts/checkCsp.mjs
│   ├── externalLinks.ts           # rel values for links that leave the site
│   ├── socialCard.spec.ts
│   ├── socialCard.ts              # the social card as data: tagline, alt text, colors, the solid as SVG
│   └── themeInit.ts               # the pre-paint theme script, shared with the CSP config
├── pages/
│   ├── index.astro                # home: hero + project index
│   ├── og.png.ts                  # the social card, rendered with sharp at build time
│   ├── projects/
│   │   └── [id].astro             # one page per project
│   └── sitemap.xml.ts             # hand-rolled sitemap
├── scripts/
│   ├── geometry.spec.ts
│   ├── geometry.ts                # the icosahedron, quaternions and camera, shared by the hero and the social card
│   ├── motion.spec.ts
│   ├── motion.ts                  # the wireframe's motion rules, free of WebGL and the DOM
│   └── wireframe.ts               # WebGL 2 setup, render loop, input
├── styles/
│   └── global.css                 # color tokens, base type, shared classes
├── content.config.ts              # the projects collection schema
├── projectStructure.spec.ts       # keeps this tree honest
└── workflowPins.spec.ts           # every Action in .github/workflows/ is pinned to a commit SHA
```

## Outside src

| Path | Job |
| --- | --- |
| `astro.config.mjs` | Site URL, self-hosted font, inlined CSS, CSP directives |
| `scripts/checkCsp.mjs` | Post-build gate: runs `src/lib/cspAudit.ts` over every page in `dist/` |
| `public/` | Copied as-is: `favicon.svg`, `robots.txt`, `CNAME` (custom domain). The social card is built, see [performance-seo.md](performance-seo.md#how-the-default-card-is-built) |
| `.github/workflows/deploy.yml` | Builds and deploys to GitHub Pages on push to `main` |
| `.github/dependabot.yml` | Weekly update PRs for npm packages and GitHub Actions |
| `docs/` | These docs |

## Testing

`pnpm test` runs every spec. `pnpm build` runs them first, so a red test stops a deploy.

- **Test the logic, not the GPU.** Rules that can break silently live in modules with no WebGL or DOM (`motion.ts`), and those get specs. The WebGL calls and event wiring are checked by hand in a browser.
- **The CSP check runs after the build** (`scripts/checkCsp.mjs`), because it reads the built `dist/`. Its rules live in `src/lib/cspAudit.ts` and have specs, so a regex that stops matching can't quietly pass every page. See [security.md](security.md#the-csp-check).
- **This doc is a gate** (`src/projectStructure.spec.ts`): every file in `src/` must appear in the tree above, and every file in the tree must exist. Adding, moving or deleting a file turns `pnpm test` red until the tree matches. It checks names only, so keep the descriptions honest by hand.
- **Workflow actions must be pinned** (`src/workflowPins.spec.ts`): every `uses:` in `.github/workflows/` needs a full commit SHA and an exact `# vX.Y.Z` comment, or `pnpm test` goes red. It tests its own pattern against good and bad lines, and fails if it finds no actions at all, so a broken pattern can't pass silently. See [security.md](security.md#everything-else-we-checked).

## Navigation

- **[Index](INDEX.md)** - Overview and documentation map
- **[Site Shell](site-shell.md)** - The layout: theme, header, footer, learning menu, accessibility
- **[Wireframe](wireframe.md)** - The hero icosahedron: math, rendering, motion and input
- **[Content](content.md)** - Projects as Markdown, screenshots, alt text, adding a project
- **[Performance and SEO](performance-seo.md)** - Fonts, images, CSS, metadata, sitemap, deploy
- **[Security](security.md)** - CSP, referrer policy, external links, the CSP check
