---
title: Images to Slideshow
summary: The service that turns still images into a video slideshow with music and crossfades, for Shotlify. A Node.js API built on FFmpeg.
repo: https://github.com/ClarkGH/node_images_to_slideshow
stack: [Node.js, Express, FFmpeg, videoshow]
status: active
image: ../../assets/projects/images-to-slideshow.png
imageAlt: "Terminal output from one run: the server starts, FFmpeg builds slideshow.mp4, and the temporary files are deleted after the response is sent."
order: 6
---

The other half of [Shotlify](/projects/shotlify/). Shotlify captures the frames in the browser, and this service turns them into a video.

The screenshot is a real run: two frames in, one slideshow out, and the cleanup after.

## Status

It works on its own today, and it's back in active work now that Shotlify's redesign is live. Next, it becomes a TypeScript job API: send the frames, get a job back, and fetch the video when it's ready. That's what connects Shotlify's Create slideshow button. After that, it gets its own FFmpeg pipeline in place of videoshow.

## Technical details

- **One endpoint.** `POST /slideshow` takes a JSON list of base64 images and responds with the finished MP4.
- **FFmpeg under the hood.** It runs videoshow on fluent-ffmpeg: five seconds per image, one-second crossfades, H.264 at 640px wide, and a royalty-free music track that fades in and out.
- **Leaves nothing behind.** Uploaded frames go to a temp folder, and both the frames and the rendered video are deleted once the response is sent.
- **Self-contained binaries.** FFmpeg and ffprobe come from npm installer packages, so nothing has to be installed on the host.
