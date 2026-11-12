// The wireframe's motion rules, kept free of WebGL and the DOM so they can be unit-tested.

export type Vec3 = [number, number, number];

export const len3 = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);

/** Below this angular speed (rad/s) the solid counts as stopped. */
const REST = 1e-4;

/** Eases the current spin toward the idle spin; `dt` is in seconds. */
export function easeToward(omega: Vec3, idle: Vec3, dt: number): Vec3 {
  const k = 1 - Math.exp(-dt * 1.4);
  return [omega[0] + (idle[0] - omega[0]) * k, omega[1] + (idle[1] - omega[1]) * k, omega[2] + (idle[2] - omega[2]) * k];
}

/**
 * Whether the animation loop can stop: the entrance is done, nobody is dragging, the solid is still,
 * and there's no idle spin to ease back up to. Without that last check, starting the spin from rest
 * stopped the loop on its first frame.
 */
export function isSettled(s: { entered: boolean; dragging: boolean; omega: Vec3; idle: Vec3 }): boolean {
  return s.entered && !s.dragging && len3(s.omega) < REST && len3(s.idle) < REST;
}

// ---- Input rules (see docs/wireframe.md#input) ----

/** A tap moves less than this many CSS pixels... */
export const TAP_MAX_MOVE = 6;
/** ...and lifts within this many milliseconds. */
export const TAP_MAX_MS = 500;
/** Held still longer than this before letting go: no fling. */
export const HOLD_MS = 80;
/** Fastest fling, in rad/s. */
export const MAX_SPIN = 6;
/** Taps this close to the center (as a fraction of the width) have no clear direction. */
export const DEAD_ZONE = 0.08;
/** How much a tap or arrow key adds to the spin, in rad/s. */
export const NUDGE = 1.6;

export type Release = 'tap' | 'fling' | 'drop' | 'cancel';

/**
 * What lifting the pointer means. A cancel (the browser took the gesture, usually to scroll the page)
 * is never a tap or a fling, or a quick swipe past the hero would nudge the solid.
 */
export function classifyRelease(r: { moved: number; heldMs: number; sinceLastMoveMs: number; cancelled: boolean }): Release {
  if (r.cancelled) return 'cancel';
  if (r.moved < TAP_MAX_MOVE && r.heldMs < TAP_MAX_MS) return 'tap';
  return r.sinceLastMoveMs > HOLD_MS ? 'drop' : 'fling';
}

/** The unit direction to turn toward for a tap at an offset from the center, or null in the dead zone. */
export function tapDirection(offsetX: number, offsetY: number, width: number): Vec3 | null {
  const l = Math.hypot(offsetX, offsetY);
  if (l <= width * DEAD_ZONE) return null;
  return [offsetY / l, offsetX / l, 0];
}

/** Scales a spin down to at most `max` rad/s, keeping its axis. */
export function capSpin(omega: Vec3, max = MAX_SPIN): Vec3 {
  const s = len3(omega);
  return s > max ? [(omega[0] / s) * max, (omega[1] / s) * max, (omega[2] / s) * max] : omega;
}

/** Adds `amount` rad/s of spin in direction `dir`. */
export function nudge(omega: Vec3, dir: Vec3, amount = NUDGE): Vec3 {
  return [omega[0] + dir[0] * amount, omega[1] + dir[1] * amount, omega[2] + dir[2] * amount];
}
