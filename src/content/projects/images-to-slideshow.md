---
title: Images to Slideshow
summary: A Node API that turns a set of still images into an MP4 slideshow with crossfades and music, built as Shotlify's backend.
repo: https://github.com/ClarkGH/node_images_to_slideshow
stack: [Node.js, Express, FFmpeg, videoshow]
status: paused
image: ../../assets/projects/images-to-slideshow.png
imageAlt: "Terminal output from one run: the server starts, FFmpeg builds slideshow.mp4, and the temporary files are deleted after the response is sent."
order: 5
---

The other half of [Shotlify](/projects/shotlify/). Shotlify captures the frames in the browser, and this service turns them into a video.

## What's in it

- **One endpoint.** `POST /slideshow` takes a JSON list of base64 images and responds with the finished MP4.
- **FFmpeg under the hood.** It runs videoshow on fluent-ffmpeg: five seconds per image, one-second crossfades, H.264 at 640px wide, and a royalty-free music track that fades in and out.
- **Leaves nothing behind.** Uploaded frames go to a temp folder, and both the frames and the rendered video are deleted once the response is sent.
- **Self-contained binaries.** FFmpeg and ffprobe come from npm installer packages, so nothing has to be installed on the host.

The screenshot is a real run: two frames in, one slideshow out, and the cleanup after.

## Status

Paused. The service works on its own. Hooking it up to Shotlify's Create Slideshow button is the missing piece.
