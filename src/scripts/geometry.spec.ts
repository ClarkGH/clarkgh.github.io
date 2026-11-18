import { describe, expect, it } from 'vitest';
import { DEPTH, type Vec3, depthAlpha, icosahedron, nearness, qaxis, qmat, qmul, rotate } from './geometry';

const close = (a: Vec3, b: Vec3) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 6));

describe('icosahedron', () => {
  const { verts, edges, count } = icosahedron();
  const vert = (i: number): Vec3 => [verts[3 * i], verts[3 * i + 1], verts[3 * i + 2]];

  it('has 12 vertices and 30 edges', () => {
    expect(count).toBe(12);
    expect(edges.length / 2).toBe(30);
  });

  it('puts every vertex on the unit sphere', () => {
    for (let i = 0; i < count; i++) expect(Math.hypot(...vert(i))).toBeCloseTo(1, 6);
  });

  it('gives every vertex 5 neighbors, all at the same distance', () => {
    const degree = new Array(count).fill(0);
    const lengths: number[] = [];
    for (let k = 0; k < edges.length; k += 2) {
      degree[edges[k]]++;
      degree[edges[k + 1]]++;
      const [a, b] = [vert(edges[k]), vert(edges[k + 1])];
      lengths.push(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
    }
    expect(degree).toEqual(new Array(count).fill(5));
    lengths.forEach((l) => expect(l).toBeCloseTo(lengths[0], 6));
  });
});

describe('depth', () => {
  it('maps the back of the unit sphere to 0 and the front to 1', () => {
    expect(nearness(-1)).toBe(0);
    expect(nearness(1)).toBe(1);
  });

  it('fades from DEPTH.floor at the back to fully opaque at the front', () => {
    expect(depthAlpha(0)).toBe(DEPTH.floor);
    expect(depthAlpha(1)).toBe(1);
  });
});

describe('rotation', () => {
  const m = (q: ReturnType<typeof qaxis>) => qmat(q, new Float32Array(16));

  it('turns x toward y for a positive quarter turn around z', () => {
    close(rotate(m(qaxis([0, 0, 1], Math.PI / 2)), [1, 0, 0]), [0, 1, 0]);
  });

  it('applies the right-hand quaternion first: qmul(a, b) means b, then a', () => {
    const a = qaxis([0, 1, 0], Math.PI / 2);
    const b = qaxis([1, 0, 0], Math.PI / 2);
    const both = rotate(m(qmul(a, b)), [0, 1, 0]);
    close(both, rotate(m(a), rotate(m(b), [0, 1, 0])));
  });

  it('treats a zero axis or zero angle as no rotation', () => {
    expect(qaxis([0, 0, 0], 1)).toEqual([0, 0, 0, 1]);
    expect(qaxis([1, 0, 0], 0)).toEqual([0, 0, 0, 1]);
  });
});
