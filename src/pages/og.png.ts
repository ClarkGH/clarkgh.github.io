// The default social card, built at build time: the solid as SVG, then the text drawn by Pango on top.
// What's on it lives in src/lib/socialCard.ts. See docs/performance-seo.md#social-cards.
import { resolve } from 'node:path';
import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { solidSvg, TEXT, textInput } from '../lib/socialCard';

// Read from the project root: the build bundles this file elsewhere, so paths relative to it would break.
const FONTS = resolve('src/assets/fonts');

export const GET: APIRoute = async () => {
  const layers = await Promise.all(
    TEXT.map(async (line) => ({
      input: await sharp(textInput(line, FONTS)).png().toBuffer(),
      left: line.left,
      top: line.top,
    })),
  );
  // sharp composites last in its pipeline, so drop the alpha channel in a second pass: the card is opaque.
  const card = await sharp(Buffer.from(solidSvg())).composite(layers).png().toBuffer();
  const png = await sharp(card).removeAlpha().png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
