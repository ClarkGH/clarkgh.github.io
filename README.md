# portfolio

Source for https://clarkgh.github.io, built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Run locally

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm test      # unit tests (Vitest)
pnpm build     # tests + type-check + static build into dist/ + CSP check
pnpm preview   # serve dist/
```

## Docs

How the site works, and why, lives in [docs/](docs/INDEX.md):

- [Adding a project](docs/content.md#adding-a-project)
- [The wireframe](docs/wireframe.md): the hero's WebGL math and animation loop
- [Security](docs/security.md): the Content Security Policy and why it's a meta tag
- [Performance and SEO](docs/performance-seo.md)

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages. A failing test or CSP check stops the deploy.
