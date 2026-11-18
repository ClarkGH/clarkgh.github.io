// The default social card (og:image), as data: the solid as SVG and the two lines of text.
// src/pages/og.png.ts turns this into the PNG at build time. See docs/performance-seo.md#social-cards.

import {
  CAMERA,
  type Vec3,
  depthAlpha,
  icosahedron,
  nearness,
  qaxis,
  qmat,
  qmul,
  rotate,
} from '../scripts/geometry';

export const NAME = 'Clark Hinchcliff';
export const TAGLINE = 'Frontend engineer. Learning by building.';
export const CARD_ALT = `${NAME}, “${TAGLINE}”, beside a rose wireframe icosahedron.`;

export const CARD = { width: 1200, height: 630 } as const;

/** The dark theme's tokens from global.css (a spec keeps them in sync). */
export const COLORS = { bg: '#1c1a33', text: '#ece7dd', muted: '#a8a3bc', wire: '#e58fa7' } as const;

/**
 * The solid, drawn with the hero's geometry, camera and depth fade, posed by turning 0.45 rad
 * around x, then 0.55 rad around y. `half` is the half-height in px of the canvas the camera
 * would fill, which sets the solid's size on the card. Dots are one size, as on the original
 * card, where the hero shrinks back dots.
 */
const SOLID = { center: [965, 315], half: 210.5, line: 2.5, dot: 6.5 } as const;
const POSE = qmul(qaxis([0, 1, 0], 0.55), qaxis([1, 0, 0], 0.45));

/** `hex` laid over the background at opacity `a`, as a solid color, so nearer marks hide farther ones. */
export function over(hex: string, a: number): string {
  const ch = (h: string, i: number) => parseInt(h.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `#${[0, 1, 2]
    .map((i) => Math.round(ch(COLORS.bg, i) + (ch(hex, i) - ch(COLORS.bg, i)) * a).toString(16).padStart(2, '0'))
    .join('')}`;
}

/** Each vertex on the card in px, with `near` from 0 (back) to 1 (front). */
export function projectSolid() {
  const { verts, edges, count } = icosahedron();
  const m = qmat(POSE, new Float32Array(16));
  const focal = SOLID.half / Math.tan(CAMERA.fovy / 2);
  const points = Array.from({ length: count }, (_, i) => {
    const [x, y, z] = rotate(m, [verts[3 * i], verts[3 * i + 1], verts[3 * i + 2]] as Vec3);
    const w = CAMERA.distance - z;
    return { x: SOLID.center[0] + (focal * x) / w, y: SOLID.center[1] - (focal * y) / w, near: nearness(z) };
  });
  return { points, edges: Array.from(edges) };
}

/**
 * The card's background and solid as an SVG string. The text is drawn separately (see TEXT).
 * Colors are opaque, so the last mark drawn wins where two overlap. Edges and dots are drawn
 * together from back to front, so the nearer one is always on top.
 */
export function solidSvg(): string {
  const { points: p, edges } = projectSolid();
  const r = (n: number) => n.toFixed(2);
  const marks: { near: number; svg: string }[] = [];
  for (let k = 0; k < edges.length; k += 2) {
    const [a, b] = [p[edges[k]], p[edges[k + 1]]];
    const near = (a.near + b.near) / 2;
    const color = over(COLORS.wire, depthAlpha(near));
    marks.push({
      near,
      svg: `<line x1="${r(a.x)}" y1="${r(a.y)}" x2="${r(b.x)}" y2="${r(b.y)}" stroke="${color}" stroke-width="${SOLID.line}"/>`,
    });
  }
  for (const v of p) {
    const color = over(COLORS.wire, depthAlpha(v.near));
    marks.push({ near: v.near, svg: `<circle cx="${r(v.x)}" cy="${r(v.y)}" r="${SOLID.dot}" fill="${color}"/>` });
  }
  marks.sort((a, b) => a.near - b.near);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}" height="${CARD.height}">`,
    `<rect width="${CARD.width}" height="${CARD.height}" fill="${COLORS.bg}"/>`,
    ...marks.map((m) => m.svg),
    '</svg>',
  ].join('');
}

const escapeMarkup = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The two lines of text, as Pango markup for sharp's text renderer. Pango, unlike sharp's SVG
 * renderer, honors variable-font axes: weight 330 and optical size 30 match the site's headline.
 * `font` is a file in src/assets/fonts/. `left`/`top` place the rendered text box on the card.
 * Sizes, axes and positions were fit pixel by pixel to the original hand-made card (2026-11-18).
 * If Pango can't find the font, it quietly falls back to another one, so a spec renders each line
 * and checks that it really came out in Piazzolla.
 */
export const TEXT = [
  {
    markup: `<span font_desc="Piazzolla 84 @wght=330,opsz=30" foreground="${COLORS.text}">${escapeMarkup(NAME)}</span>`,
    font: 'Piazzolla-Variable.ttf',
    left: 89,
    top: 280,
  },
  {
    markup: `<span font_desc="Piazzolla Italic 33 @wght=400,opsz=20" foreground="${COLORS.muted}">${escapeMarkup(TAGLINE)}</span>`,
    font: 'Piazzolla-Italic-Variable.ttf',
    left: 86,
    top: 371,
  },
] as const;

/** sharp's input options for one line of TEXT. `fontsDir` is the absolute path to src/assets/fonts. */
export const textInput = ({ markup, font }: { markup: string; font: string }, fontsDir: string) => ({
  text: { text: markup, fontfile: `${fontsDir}/${font}`, rgba: true, dpi: 72 },
});
