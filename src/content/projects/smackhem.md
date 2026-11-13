---
title: Smackhem
summary: A geometric 3D/2D game engine for the web, written in TypeScript on raw WebGL 2.0.
repo: https://github.com/ClarkGH/smackhem
stack: [TypeScript, WebGL 2.0, Vite, Vitest]
status: active
image: ../../assets/projects/smackhem.png
imageAlt: "The engine running in the browser: flat-shaded towers, cubes, pyramids and spheres on a dark plain, under a purple sunset sky with painted clouds and an orange sun on the horizon."
order: 1
---

A game engine inspired by Drakkhen's exploration and CrossCode's use of web technologies. It's my first step toward putting a game I'm proud of in front of other people.

## What's in it

- **Custom rendering on WebGL 2.0.** There's no engine underneath, and the Vec2/Vec3/Mat4 math doesn't come from a library.
- **Chunked world streaming.** Maps are split into offset-named JSON chunks that load as you explore.
- **Platform-agnostic core.** Camera, collision, game loop and world systems sit behind service interfaces (renderer, input, clock, asset loader), so the web build is just one platform. Desktop and consoles are the long-term targets.
- **Audio, battles and scenes.** There's a day/night ambient bed, music, and a battle system, all specified in design docs before any code was written.

## How I work on it

The design document drives the project: every system gets a written spec before it gets code, and the spec stays up to date as things change. Tasks are tracked as GitHub issues.

After more than five years of studying 3D, I can finally say I've put a pin in quaternions.
