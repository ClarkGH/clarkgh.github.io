import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { CARD, CARD_ALT, COLORS, TAGLINE, TEXT, over, projectSolid, solidSvg, textInput } from './socialCard';

const FONTS = resolve('src/assets/fonts');

/** Rendered width in px of one line of TEXT, exactly as og.png.ts renders it. */
const widthOf = async (line: { markup: string; font: string }) =>
  (await sharp(textInput(line, FONTS)).toBuffer({ resolveWithObject: true })).info.width;

describe('social card', () => {
  it('uses the dark theme tokens from global.css', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    const dark = css.split(":root[data-theme='dark']")[1]?.split('}')[0] ?? '';
    const token = (name: string) => dark.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, 'i'))?.[1].toLowerCase();
    expect(COLORS).toEqual({ bg: token('bg'), text: token('text'), muted: token('muted'), wire: token('wire') });
  });

  it('describes the tagline it draws in its alt text', () => {
    expect(CARD_ALT).toContain(TAGLINE);
    expect(TEXT.some((t) => t.markup.includes(TAGLINE))).toBe(true);
  });

  // If Pango can't load the font, it quietly uses a fallback. Rendering the same line with a family
  // that can't exist forces that fallback; a real Piazzolla render has to come out a different width.
  it.each(TEXT.map((line, i) => [i, line] as const))('draws line %i in Piazzolla, not a fallback font', async (_, line) => {
    const fallback = { ...line, markup: line.markup.replace('font_desc="Piazzolla', 'font_desc="NoSuchFamily') };
    expect(fallback.markup).not.toBe(line.markup);
    expect(Math.abs((await widthOf(line)) - (await widthOf(fallback)))).toBeGreaterThan(10);
  });

  it('keeps the text clear of the solid, and the solid on the card', async () => {
    const { points } = projectSolid();
    const solidLeft = Math.min(...points.map((p) => p.x)) - 10; // a dot's radius, plus a little air
    for (const line of TEXT) expect(line.left + (await widthOf(line))).toBeLessThan(solidLeft);
    for (const { x, y } of points) {
      expect(x).toBeLessThan(CARD.width);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(CARD.height);
    }
  });

  it('draws 30 edges and 12 dots, back to front', () => {
    const svg = solidSvg();
    expect(svg.match(/<line /g)).toHaveLength(30);
    expect(svg.match(/<circle /g)).toHaveLength(12);
    // Opaque colors, so order is layering: each mark must be no farther back than the one before.
    // Farther marks are darker (closer to the background), so their colors must only get brighter.
    const colors = [...svg.matchAll(/(?:stroke|fill)="(#[0-9a-f]{6})"/g)].map((m) => m[1]).slice(1); // skip the background
    const brightness = colors.map((c) => parseInt(c.slice(1, 3), 16));
    expect(brightness).toEqual([...brightness].sort((a, b) => a - b));
  });

  it('blends a color over the background', () => {
    expect(over(COLORS.wire, 1)).toBe(COLORS.wire);
    expect(over(COLORS.wire, 0)).toBe(COLORS.bg);
  });
});
