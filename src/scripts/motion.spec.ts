import { describe, expect, it } from 'vitest';
import {
  type Vec3,
  DEAD_ZONE,
  HOLD_MS,
  MAX_SPIN,
  TAP_MAX_MOVE,
  TAP_MAX_MS,
  capSpin,
  classifyRelease,
  easeToward,
  isSettled,
  len3,
  nudge,
  tapDirection,
} from './motion';

const SPIN: Vec3 = [0.1, 0.28, 0.04];
const STILL: Vec3 = [0, 0, 0];

describe('isSettled', () => {
  it('keeps running when the spin is started from rest', () => {
    expect(isSettled({ entered: true, dragging: false, omega: STILL, idle: SPIN })).toBe(false);
  });

  it('stops once the solid is still and the spin is off', () => {
    expect(isSettled({ entered: true, dragging: false, omega: STILL, idle: STILL })).toBe(true);
  });

  it('keeps running while a fling is still easing out', () => {
    expect(isSettled({ entered: true, dragging: false, omega: [0, 1.6, 0], idle: STILL })).toBe(false);
  });

  it('keeps running during a drag or the entrance', () => {
    expect(isSettled({ entered: true, dragging: true, omega: STILL, idle: STILL })).toBe(false);
    expect(isSettled({ entered: false, dragging: false, omega: STILL, idle: STILL })).toBe(false);
  });
});

describe('easeToward', () => {
  it('reaches the idle spin from rest over a few seconds of frames', () => {
    let omega: Vec3 = STILL;
    for (let i = 0; i < 300; i++) omega = easeToward(omega, SPIN, 1 / 60);
    expect(len3(omega)).toBeCloseTo(len3(SPIN), 2);
  });

  it('settles a fling down to rest when the spin is off', () => {
    let omega: Vec3 = [0, 6, 0];
    for (let i = 0; i < 1200; i++) omega = easeToward(omega, STILL, 1 / 60);
    expect(len3(omega)).toBeLessThan(1e-4);
  });

  it('does nothing on a zero-length frame', () => {
    expect(easeToward([1, 2, 3], SPIN, 0)).toEqual([1, 2, 3]);
  });
});

describe('classifyRelease', () => {
  const release = (over: Partial<Parameters<typeof classifyRelease>[0]>) =>
    classifyRelease({ moved: 0, heldMs: 100, sinceLastMoveMs: 0, cancelled: false, ...over });

  it('counts a short, quick press as a tap', () => {
    expect(release({ moved: TAP_MAX_MOVE - 1 })).toBe('tap');
  });

  it('counts a press that moved too far as a drag', () => {
    expect(release({ moved: TAP_MAX_MOVE + 1 })).toBe('fling');
  });

  it('counts a press held too long as a drag, even without moving', () => {
    expect(release({ heldMs: TAP_MAX_MS, sinceLastMoveMs: 0 })).toBe('fling');
  });

  it('flings only if the pointer was still moving when it let go', () => {
    expect(release({ moved: 40, sinceLastMoveMs: HOLD_MS - 1 })).toBe('fling');
    expect(release({ moved: 40, sinceLastMoveMs: HOLD_MS + 1 })).toBe('drop');
  });

  it('never treats a cancel as a tap or a fling (the browser took the swipe to scroll)', () => {
    expect(release({ cancelled: true })).toBe('cancel');
    expect(release({ cancelled: true, moved: 40 })).toBe('cancel');
  });
});

describe('tapDirection', () => {
  const width = 400;

  it('ignores taps inside the dead zone, boundary included', () => {
    expect(tapDirection(width * DEAD_ZONE, 0, width)).toBeNull();
    expect(tapDirection(1, 1, width)).toBeNull();
  });

  it('turns toward a tap just outside the dead zone', () => {
    expect(tapDirection(width * DEAD_ZONE + 1, 0, width)).toEqual([0, 1, 0]);
  });

  it('returns a unit vector: right of center turns about y, below center about x', () => {
    const dir = tapDirection(30, 40, width);
    expect(dir).not.toBeNull();
    expect(len3(dir as Vec3)).toBeCloseTo(1);
    expect(dir).toEqual([0.8, 0.6, 0]);
  });
});

describe('capSpin', () => {
  it('scales a fling over the cap down to the cap, keeping its axis', () => {
    const capped = capSpin([0, 30, 40]);
    expect(len3(capped)).toBeCloseTo(MAX_SPIN);
    expect(capped[1] / capped[2]).toBeCloseTo(30 / 40);
  });

  it('leaves a spin under the cap alone', () => {
    expect(capSpin([0, 1, 0])).toEqual([0, 1, 0]);
  });
});

describe('nudge', () => {
  it('adds the nudge on top of the current spin', () => {
    expect(nudge([0.1, 0, 0], [0, 1, 0], 2)).toEqual([0.1, 2, 0]);
  });
});
