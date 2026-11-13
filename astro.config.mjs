// @ts-check
import { createHash } from 'node:crypto';
import { defineConfig, fontProviders } from 'astro/config';
import { THEME_INIT } from './src/lib/themeInit.ts';

/** @type {`sha256-${string}`} */
const themeInitHash = `sha256-${createHash('sha256').update(THEME_INIT).digest('base64')}`;

// User site (ClarkGH.github.io repo) on the custom domain in public/CNAME, served from the root, so no `base` is needed.
export default defineConfig({
  site: 'https://clarkhinchcliff.com',
  // Shiki's inline styles break under the CSP, and no write-up has code blocks yet.
  markdown: { syntaxHighlight: false },
  // GitHub Pages can't send headers, so the policy ships as a <meta> tag. Astro hashes every
  // script and style it emits into script-src / style-src. See docs/security.md.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self'",
        "font-src 'self'",
        // 'self', not 'none', so Lighthouse can fetch /robots.txt and /llms.txt from the page. See docs/security.md.
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ],
      // The one inline script Astro doesn't hash for us (src/lib/themeInit.ts).
      scriptDirective: { hashes: [themeInitHash] },
    },
  },
  // All the CSS is ~10 kB: inline it so first paint doesn't wait on a stylesheet request.
  build: { inlineStylesheets: 'always' },
  // Piazzolla is downloaded at build time and served from this site, so there's no third-party
  // request blocking first paint. The fallbacks are size-matched faces from src/styles/global.css,
  // so the swap barely moves the text (CLS). See docs/performance-seo.md#fonts.
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Piazzolla',
      cssVariable: '--font-piazzolla',
      weights: ['300 600'], // the range the site uses (330 headings to 600 brand)
      styles: ['normal', 'italic'],
      subsets: ['latin'],
      // Astro's generated fallback only covers Times New Roman, which Linux and Android don't
      // have, and its size came out about 4% narrow. Ours are measured; see global.css.
      optimizedFallbacks: false,
      fallbacks: ['Piazzolla fallback Times', 'Piazzolla fallback Noto', 'Piazzolla fallback DejaVu', 'serif'],
      options: { experimental: { variableAxis: { opsz: [[8, 30]] } } },
    },
  ],
});
