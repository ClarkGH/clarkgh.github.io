# Site Shell

Everything around a page's content: the `<head>`, header, footer, light/dark theme, the learning menu, and the design tokens they share.

## Table of Contents

- [Where it lives](#where-it-lives)
- [Design tokens](#design-tokens)
    - [Units](#units)
- [Theme](#theme)
    - [No flash on load](#no-flash-on-load)
- [Header and footer](#header-and-footer)
- [The learning menu](#the-learning-menu)
- [The typewriter headline](#the-typewriter-headline)
- [Accessibility](#accessibility)
- [Rules it follows](#rules-it-follows)
- [Not built yet](#not-built-yet)
- [Navigation](#navigation)

## Where it lives

| File | Job |
| --- | --- |
| [Base.astro](../src/layouts/Base.astro) | Every page's shell: `<head>` metadata, skip link, header, menu, footer, and the script for the theme toggle and menu |
| [LearnMenu.astro](../src/components/LearnMenu.astro) | The learning menu: the resource list and its styles |
| [global.css](../src/styles/global.css) | Color tokens for both themes, base type, focus ring, shared classes |
| [index.astro](../src/pages/index.astro) | The home page, including the typewriter headline's markup, script and styles |
| [themeInit.ts](../src/lib/themeInit.ts) | The inline script that applies a saved theme before first paint |
| [externalLinks.ts](../src/lib/externalLinks.ts) | `rel` values for links that leave the site |

## Design tokens

All colors are custom properties on `:root`, defined twice in [global.css](../src/styles/global.css): once for dark (the default) and once under `[data-theme='light']`. Components only use the tokens, never raw colors, so a theme switch is just changing one attribute.

| Token | Used for | Dark | Light |
| --- | --- | --- | --- |
| `--bg` | Page background | `#1c1a33` | `#ecebf2` |
| `--well` | Image wells, the menu sheet | `#15132a` | `#e1dfea` |
| `--text` | Body text | `#ece7dd` | `#1f1c36` |
| `--muted` | Secondary text | `#a8a3bc` | `#57536c` |
| `--rule` | Hairlines and borders | `#36325a` | `#cfcbdc` |
| `--wire` | The one accent: links, focus ring, the wireframe | `#e58fa7` | `#b3335d` |
| `--scrim` | The menu's backdrop | 60% ink | 35% ink |

Every text pair passes WCAG AA contrast in both themes (body text is about 13.7:1, muted text at least 5.5:1, links at least 5:1).

Type is one family, Piazzolla, a variable serif with optical sizing. It's self-hosted, see [performance-seo.md](performance-seo.md#fonts).

### Units

The CSS uses px, em and rem together on purpose. Each unit has one job:

| Unit | Used for | Why |
| --- | --- | --- |
| `rem` | Font sizes, spacing, layout widths (`--measure`, `--max`), media queries | It follows the reader's browser font-size setting. Someone who turned up their default text size, which is common on phones, gets a bigger site, and the layout scales with it. Font sizes in px would ignore that setting. |
| `em` | Things that belong to their own text: letter-spacing, underline offset, the typewriter caret, the learning menu's chevron, the home `<h1>`'s `max-width` | They stay in proportion when that text's size changes, for example when a `clamp()` headline grows. The `<h1>`'s `7.82em` replaced `13ch` because `ch` is measured from whichever font is showing, which caused layout shift while the fallback font was up (see [performance-seo.md](performance-seo.md#fonts)). |
| `px` | Borders, outlines, hairlines, small radii, `text-decoration-thickness` | A 1px rule should stay a hairline at any text size. Borders in rem round differently from device to device and get heavy when text is enlarged. |
| `vw`, `vh`, `svh`, `dvh` | Only inside `clamp()` for fluid sizes, and for full-height sheets | `vw` alone never sets a width, because it includes the scrollbar (see [the learning menu](#the-learning-menu)). The menu sheet uses `dvh`, so it fits the screen with the browser's toolbars showing. |

**Media queries use `rem`, too.** Inside a media query, `rem` means the browser's default font size, not the page's. So a breakpoint like `48rem` moves when a reader enlarges their text, and they get the narrow layout sooner instead of a squeezed wide one.

**Mobile first.** The base styles are the phone layout. Wider layouts are added with `min-width` queries. The breakpoints (30, 40, 48 and 56rem) are where each piece of content stops fitting, not device widths, so each one sits next to the component it changes.

## Theme

Dark is the default. The theme button in the header flips `data-theme` on `<html>`, saves the choice to `localStorage`, updates its own label ("Switch to light mode" / "Switch to dark mode"), and dispatches a `themechange` event so the [wireframe](wireframe.md#theme-changes) can redraw in the new accent.

Every `localStorage` call is wrapped in `try`/`catch`, because storage can throw in private windows or when site data is blocked. If it does, the theme still switches; it just isn't remembered.

### No flash on load

If a light-mode visitor's saved choice were applied by a normal (deferred) script, they'd see a dark frame first. So a tiny script runs inline in the `<head>`, before the body paints, and sets `data-theme` from storage. It only accepts `'light'` or `'dark'`, so a tampered value can't inject anything.

That script lives in [themeInit.ts](../src/lib/themeInit.ts) rather than inline in the template, because the Content Security Policy needs its exact hash. See [security.md](security.md#the-inline-theme-script).

## Header and footer

- **Header:** the name (home link), Projects, GitHub, LinkedIn, the theme button and the menu button (a three-line SVG drawn like the theme icon).
- **Narrow screens:** below 40rem, GitHub and LinkedIn are hidden from the header. Below 30rem, so is Projects (the list is right under the hero). This keeps the header on one line down to 320px, which WCAG's reflow rule (1.4.10) needs.
- **Footer:** the copyright line, plus "Find me on GitHub and LinkedIn" on every page, so the profiles are always reachable even when the header hides them.

One gotcha: Astro's HTML compressor drops a line break between a word and a link that starts the next line, so `and\n<a>` renders as "and<a>" with no space. Keep a word and the link after it on the same line.

## The learning menu

The menu is a native `<dialog>` opened with `showModal()`, styled as a sheet that slides in from the right. Using the real element gets a lot for free:

- **Focus is trapped** inside while it's open, and **Esc closes** it.
- **Everything behind it is inert**, so screen readers and Tab can't wander off.
- **The backdrop** is the `::backdrop` pseudo-element.

What's added on top:

- **Clicking the backdrop closes it.** A click on the backdrop lands on the `<dialog>` element itself, so `event.target === menu` means "outside the sheet". The inner wrapper has `min-height: 100%`, so clicks on the sheet's empty lower part don't count as outside.
- **Focus returns to the menu button** on close, and its `aria-expanded` is kept in sync.
- **Width is `min(28rem, 100%)`**, not `100vw`, because `vw` includes the scrollbar and pushed the sheet partly off screen.

Each section (Read, Listen, Watch) is a `<details>`/`<summary>`, so it collapses with no script, and screen readers announce whether it's expanded. They start open. The trade-off: the section titles aren't headings anymore, because some screen readers treat a heading inside `<summary>` as a button and drop the heading. With only three sections, Tab is enough to move between them.

## The typewriter headline

The home page `<h1>` types itself out once, with a caret that blinks three times and then goes. The usual way to do this (emptying the heading, then adding one letter at a time) has two problems with a headline this long, and the markup is built to avoid both:

- **Lines jumping.** A half-typed word that fits on one line can get pushed to the next line once it's finished. Here every letter is in the page from the start, each in its own `<span class="ch">`, and the script only makes them visible. The lines wrap once, exactly as they will at the end, and `text-wrap: balance` still works. Each word is `white-space: nowrap`, so a word can't break between two letter spans.
- **The caret moving text.** The caret is an absolutely positioned `::after` on the last letter shown, so it takes up no space.

What each visitor gets:

| Visitor | Sees |
| --- | --- |
| JavaScript on, motion OK | The letters hidden before first paint, then typed in over about 2.5 seconds |
| Reduced motion | The full headline, no caret |
| JavaScript off | The full headline. `@media (scripting: enabled)` only hides the letters when a script can show them |
| The script fails to load, or arrives late | Every letter appears after 2.5s anyway, from a fallback CSS animation. The script cancels it when it starts, and skips typing if the page is already 2.4s old |
| Opened in a background tab | Typing waits for the tab to become visible (`visibilitychange`). Background tabs slow timers to about one a second, which would crawl through the headline |
| Screen reader | The plain sentence from a `.sr-only` span. The letter spans are `aria-hidden`, so it isn't read one letter at a time |

The caret blinks three times, about 3 seconds, and then is removed. WCAG 2.2.2 requires a way to pause anything that blinks for more than 5 seconds.

## Accessibility

- **Skip link.** "Skip to content" is the first thing Tab reaches. It's off screen until focused, and goes to `<main id="main">`.
- **One `<h1>` per page,** and headings in order.
- **Focus ring.** `:focus-visible` gets a 2px outline in `--wire`, everywhere.
- **Buttons are buttons.** The theme and menu buttons are real `<button>`s with `aria-label`s, and are at least 24px across (WCAG 2.5.8).
- **Thumbnails.** The project thumbnails are duplicate links, so they're `tabindex="-1"` and `aria-hidden`, with `alt=""`. The title link next to them is the real one.
- **Reduced motion.** The menu's slide-in and the chevron's turn are skipped, the headline isn't typed, and the wireframe starts still.

## Rules it follows

- **Tokens only.** No raw colors outside `global.css`.
- **Each unit has one job.** rem for size and space, em for things tied to their own text, px for hairlines. See [Units](#units).
- **Mobile first.** Write the phone layout first, then add `min-width` queries in rem.
- **Serif only.** Piazzolla everywhere, no monospace, no pill-shaped tags.
- **No inline `style=""` attributes.** The CSP would block them, and the [CSP check](security.md#the-csp-check) fails the build if one appears.
- **External links get `rel`** from [externalLinks.ts](../src/lib/externalLinks.ts). See [security.md](security.md#external-links).

## Not built yet

- **A custom 404 page.** GitHub Pages shows its generic one today.
- **The header's two queries are still `max-width`.** They hide the profile links and Projects on narrow screens. They should be flipped to `min-width` so the header follows the mobile-first rule.
- **A type and spacing scale.** Font sizes and spacing are still one-off rem values chosen per component. They should become a small set of tokens in `global.css` that components share.
- **Hover styles on touch screens.** `:hover` stays applied after a tap until you tap elsewhere. Hover-only changes should go inside `@media (hover: hover)`.
- **Remember the learning menu sections' open/closed state** between visits.

## Navigation

- **[Index](INDEX.md)** - Overview and documentation map
- **[Project Structure](project-structure.md)** - Where every file lives and why, plus testing
- **[Wireframe](wireframe.md)** - The hero icosahedron: math, rendering, motion and input
- **[Content](content.md)** - Projects as Markdown, screenshots, alt text, adding a project
- **[Performance and SEO](performance-seo.md)** - Fonts, images, CSS, metadata, sitemap, deploy
- **[Security](security.md)** - CSP, referrer policy, external links, the CSP check
