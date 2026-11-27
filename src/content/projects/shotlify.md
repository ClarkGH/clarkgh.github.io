---
title: Shotlify
summary: Pause your videos on the moments you want and turn them into a slideshow. Built with Next.js and React, now being rebuilt with accessibility checks.
repo: https://github.com/ClarkGH/shotlify
stack: [Next.js, React, TypeScript, Tailwind CSS, Vitest, Playwright, axe]
status: active
image: ../../assets/projects/shotlify.png
imageAlt: "The landing page: the Shotlify name in a red-to-blue gradient, links to Home, Videos and Images, and a welcome message."
order: 5
---

Drop in one or more videos, pause on the moment you want, and capture it as a still. Your own photos can go in alongside the captures, and the set becomes a slideshow with music and transitions. Think wedding videos, without paying someone to cut one together.

The live site, [slideshow-sigma.vercel.app](https://slideshow-sigma.vercel.app/), still runs the 2023 version. A rebuild is in progress on a branch.

## What's live

- **Frame capture in the browser.** The current video frame is drawn to a canvas and exported as an image, with no trip to a server.
- **Multi-file uploads** for videos and photos.
- **Usable down to 320px screens,** with accessibility fixes from a WCAG review.

## Status

Active. The goal is the whole loop on the live site: upload a video, capture frames, add photos, reorder them, press Create Slideshow, watch the result and download it. The rendering happens in [Images to Slideshow](/projects/images-to-slideshow/), which is being rebuilt as part of the same work.

## Technical details

- **A current toolchain and a Content Security Policy.** The 2023 app was upgraded to Next.js 16 and pnpm, and it now sends a strict CSP: no inline or third-party scripts.

### What's being rebuilt

- **A new workspace,** with a video list, a viewer and a strip of captured frames. The logic lives in plain modules with no React (a pure reducer for the page state), each with its own spec.
- **Captures are re-encoded,** which drops the photo metadata a camera can embed, like location.
- **Accessibility checked by a script, not just by eye.** `pnpm a11y` runs axe on every page state at desktop and phone widths, walks the whole page by keyboard, and checks focus rings, target sizes, text spacing and screen reader announcements. It's backed up by a pass with a real screen reader (Orca).
- **A smoke test** builds the production app, loads it in headless Chromium, and fails if the CSP is missing or the page doesn't hydrate.
- **Next:** reordering frames, by drag or with move buttons, so dragging is never required. Then a job-based render API, and pressing Create Slideshow on the live site.
