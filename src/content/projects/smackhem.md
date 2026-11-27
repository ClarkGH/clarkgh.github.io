---
title: Smackhem
summary: "A 3D game engine for the browser, built to learn how games work under the hood: TypeScript and WebGL 2, day/night lighting, every commit benchmarked."
repo: https://github.com/ClarkGH/smackhem
stack: [TypeScript, WebGL 2.0, Vite, Vitest]
status: active
image: ../../assets/projects/smackhem.png
imageAlt: "The engine running in the browser: flat-shaded towers, cubes, pyramids and spheres on a dark plain, under a purple sunset sky with painted clouds and an orange sun on the horizon."
order: 2
---

A game engine for the browser, inspired by Drakkhen's exploration and CrossCode's use of web technologies. I wrote the renderer and the math myself, because learning how they work is the point. It's my first step toward putting a game I'm proud of in front of other people.

## How I work on it

The design documents drive the project: every system gets a written spec before it gets code, and the spec stays up to date as things change. Tasks are tracked as GitHub issues, and 64 test files cover the engine.

## Technical details

- **Rendering on WebGL 2.0.** Flat-shaded meshes (cubes, pyramids, spheres, prisms) are generated in code and lit by a sun and moon whose colors follow a time-of-day palette. The vector and matrix math is my own.
- **A quaternion camera,** so looking around never runs into gimbal lock.
- **Chunked world streaming.** Maps are split into JSON chunks named by their grid position, and they load as you explore.
- **A portable core.** Camera, collision, the game loop and the world sit behind service interfaces (renderer, input, clock, asset loader), and written portability rules keep platform code out of the core. The browser is one platform. Desktop and consoles are the long-term targets.
- **Audio, battles and scenes.** A day/night ambient bed, music, and a battle system, each specified in a design doc before any code was written.

I also benchmarked all of the project's roughly 300 commits: how big each build is (42.4 KB of JavaScript today, brotli-compressed, 19.4 KB of it at startup), and how long a cold load takes to make its first WebGL draw (about 120 ms, in software rendering and without the game's assets). It's a number for comparing commits, not a promise. The [method, raw numbers and limits](https://github.com/ClarkGH/smackhem/blob/main/docs/performance.md) are in the repo, so you don't have to take my word for it.

After more than five years of studying 3D, I can finally say I've put a pin in quaternions.
