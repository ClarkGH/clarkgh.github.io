// The icosahedron and its rotation math, free of WebGL and the DOM.
// Shared by the hero (wireframe.ts) and the social card (lib/socialCard.ts), so both draw the same solid.

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];
export type Mat4 = Float32Array; // column-major

/** The hero's camera: vertical field of view (radians) and how far the solid sits from the eye. */
export const CAMERA = { fovy: 0.68, distance: 3.4 } as const;

/** Depth without a depth buffer: the farthest edges and dots fade to `floor` opacity. */
export const DEPTH = { floor: 0.2 } as const;

/** A rotated vertex's z (−1 back … 1 front) as 0 … 1. The hero's shader computes the same `v_near`. */
export const nearness = (z: number) => z * 0.5 + 0.5;

/** Opacity at a given nearness, from DEPTH.floor at the back to 1 at the front. */
export const depthAlpha = (near: number) => DEPTH.floor + (1 - DEPTH.floor) * near;

export const qmul = ([ax, ay, az, aw]: Quat, [bx, by, bz, bw]: Quat): Quat => [
  aw * bx + ax * bw + ay * bz - az * by,
  aw * by - ax * bz + ay * bw + az * bx,
  aw * bz + ax * by - ay * bx + az * bw,
  aw * bw - ax * bx - ay * by - az * bz,
];

export const qnorm = (q: Quat): Quat => {
  const l = Math.hypot(...q);
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
};

export const qaxis = ([x, y, z]: Vec3, angle: number): Quat => {
  const l = Math.hypot(x, y, z);
  if (l < 1e-9 || angle === 0) return [0, 0, 0, 1];
  const s = Math.sin(angle / 2) / l;
  return [x * s, y * s, z * s, Math.cos(angle / 2)];
};

/** Writes the rotation matrix for `q` into `o`. */
export const qmat = ([x, y, z, w]: Quat, o: Mat4): Mat4 => {
  o.set([
    1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
    2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
    2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0,
    0, 0, 0, 1,
  ]);
  return o;
};

/** `m` (column-major) applied to a point. */
export const rotate = (m: Mat4, [x, y, z]: Vec3): Vec3 => [
  m[0] * x + m[4] * y + m[8] * z,
  m[1] * x + m[5] * y + m[9] * z,
  m[2] * x + m[6] * y + m[10] * z,
];

/** Icosahedron from three golden rectangles, scaled to unit radius. Edges are index pairs. */
export function icosahedron() {
  const PHI = (1 + Math.sqrt(5)) / 2;
  const raw: Vec3[] = [];
  for (const a of [-1, 1])
    for (const b of [-PHI, PHI]) raw.push([0, a, b], [a, b, 0], [b, 0, a]);
  // Neighboring vertices are exactly 2 apart.
  const edges: number[] = [];
  for (let i = 0; i < raw.length; i++)
    for (let j = i + 1; j < raw.length; j++) {
      const d: Vec3 = [raw[i][0] - raw[j][0], raw[i][1] - raw[j][1], raw[i][2] - raw[j][2]];
      if (Math.abs(d[0] * d[0] + d[1] * d[1] + d[2] * d[2] - 4) < 1e-6) edges.push(i, j);
    }
  const r = Math.hypot(1, PHI);
  return { verts: new Float32Array(raw.flat().map((v) => v / r)), edges: new Uint16Array(edges), count: raw.length };
}
