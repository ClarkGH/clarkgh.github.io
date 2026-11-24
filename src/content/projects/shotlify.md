---
title: Shotlify
summary: Upload videos, capture still frames in the browser, and gather them for a slideshow.
repo: https://github.com/ClarkGH/shotlify
stack: [Next.js, React, TypeScript, Tailwind CSS]
status: paused
image: ../../assets/projects/shotlify.png
imageAlt: "The landing page: the Shotlify name in a red-to-blue gradient, links to Home, Videos and Images, and a welcome message."
order: 4
---

Drop in one or more videos, pause on the moment you want, and capture it as a still. Your own images can go in alongside the captures. Turning the set into a slideshow is the next step.

It's live at [slideshow-sigma.vercel.app](https://slideshow-sigma.vercel.app/).

## What's in it

- **Frame capture in the browser.** The current video frame is drawn to a canvas and exported as a PNG, with no trip to a server.
- **Multi-file uploads** for videos and images, each with its own input path.
- **Usable down to 320px screens**, including navigation fixes for Android.
- **Tracked in GitHub.** Work went through issues and pull requests, including bug fixes and tech-debt refactors.

## Status

Paused. The slideshow step lives in a separate Node service, [Images to Slideshow](/projects/images-to-slideshow/), which already turns frames into an MP4. Wiring the Create Slideshow button to it is next.
