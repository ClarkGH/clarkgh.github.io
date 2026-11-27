---
title: Shotlify
summary: Pause your videos on the moments you want and turn them into a slideshow. Built with Next.js and React, and redesigned to work for everyone.
repo: https://github.com/ClarkGH/shotlify
stack: [Next.js, React, TypeScript, Tailwind CSS, Vitest, Playwright, axe]
status: active
image: ../../assets/projects/shotlify.png
imageAlt: "The redesigned workspace: a Mars rover video paused on a rocky landscape, a Capture this frame button, a list of uploaded videos with Remove links, and six numbered frames with arrow buttons to reorder them, above a Create slideshow button."
beforeImage: ../../assets/projects/shotlify-2023.png
beforeImageAlt: "The 2023 landing page: the Shotlify name in a red-to-blue gradient, links to Home, Videos and Images, and a welcome message."
beforeCaption: "Before: the 2023 version."
order: 5
---

Drop in one or more videos, pause on the moment you want, and capture it as a still. Your own photos can go in alongside the captures, and the set becomes a slideshow with music and transitions. Think wedding videos, without paying someone to cut one together.

Try it at [slideshow-sigma.vercel.app](https://slideshow-sigma.vercel.app/).

## What's live

- **Capture any moment** from your videos, or add your own photos.
- **Put the frames in order** by dragging them, or with arrow buttons if dragging isn't an option.
- **Works with a keyboard and a screen reader,** and on phone-sized screens.
- **Nothing is stored.** Your videos and frames stay in your browser.

## Status

Active. Capturing and ordering frames work on the live site. Next, the Create slideshow button gets connected to [Images to Slideshow](/projects/images-to-slideshow/), so you can watch and download the result.

## What changed

The 2023 version worked, but it split the job across separate pages for videos and images, so you couldn't see a video and your frames at the same time. The redesign puts everything on one page: the player, your videos, and the frames in the order they'll play, with one button at the end.

## Technical details

- **One page, plain logic.** The workspace (video list, player, frame strip) keeps its state in a pure reducer, and the logic lives in plain modules with no React, each with its own spec.
- **Reordering without a library.** Dragging uses Pointer Events directly, and the move buttons make dragging optional (WCAG 2.5.7).
- **Captures are re-encoded** as JPEGs, which drops the metadata a camera can embed, like location.
- **Accessibility checked by a script, not just by eye.** `pnpm a11y` runs axe on every page state at desktop and phone widths, walks the whole page by keyboard, and checks focus rings, target sizes, text spacing and screen reader announcements. It's backed up by a pass with a real screen reader (Orca).
- **A current toolchain and a Content Security Policy.** The 2023 app was upgraded to Next.js 16 and pnpm, and it sends a strict CSP: no inline or third-party scripts.
- **A smoke test** builds the production app, loads it in headless Chromium, and fails if the CSP is missing or the page doesn't hydrate.
