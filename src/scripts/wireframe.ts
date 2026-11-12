// A wireframe icosahedron on raw WebGL 2
// Idles with a slow spin, turns under drag or the arrow keys
// Redraws in the new accent color on 'themechange'

import {
  type Vec3,
  NUDGE,
  capSpin,
  classifyRelease,
  easeToward,
  isSettled,
  len3,
  nudge,
  tapDirection,
} from './motion';

type Quat = [number, number, number, number];
type Mat4 = Float32Array; // column-major

/** o = a × b. `o` must not be `a` or `b`. Writes into `o` so the render loop allocates nothing. */
const mul = (a: Mat4, b: Mat4, o: Mat4): Mat4 => {
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
};

const perspective = (fovy: number, aspect: number, near: number, far: number): Mat4 => {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
};

const qmul = ([ax, ay, az, aw]: Quat, [bx, by, bz, bw]: Quat): Quat => [
  aw * bx + ax * bw + ay * bz - az * by,
  aw * by - ax * bz + ay * bw + az * bx,
  aw * bz + ax * by - ay * bx + az * bw,
  aw * bw - ax * bx - ay * by - az * bz,
];

const qnorm = (q: Quat): Quat => {
  const l = Math.hypot(...q);
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
};

const qaxis = ([x, y, z]: Vec3, angle: number): Quat => {
  const l = Math.hypot(x, y, z);
  if (l < 1e-9 || angle === 0) return [0, 0, 0, 1];
  const s = Math.sin(angle / 2) / l;
  return [x * s, y * s, z * s, Math.cos(angle / 2)];
};

/** Writes the rotation matrix for `q` into `o`. */
const qmat = ([x, y, z, w]: Quat, o: Mat4): Mat4 => {
  o.set([
    1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
    2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
    2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0,
    0, 0, 0, 1,
  ]);
  return o;
};

// ---- Geometry: icosahedron from three golden rectangles ----
function icosahedron() {
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

// ---- Shaders ----
const VS = `#version 300 es
in vec3 a_pos;
uniform mat4 u_mvp, u_rot;
uniform float u_size;
out float v_near;
void main() {
  v_near = (u_rot * vec4(a_pos, 1.0)).z * 0.5 + 0.5;
  gl_Position = u_mvp * vec4(a_pos, 1.0);
  gl_PointSize = u_size * mix(0.55, 1.0, v_near);
}`;

const FS = `#version 300 es
precision mediump float;
in float v_near;
uniform vec3 u_color;
uniform float u_alpha, u_point;
out vec4 o;
void main() {
  if (u_point > 0.5) { vec2 c = gl_PointCoord - 0.5; if (dot(c, c) > 0.25) discard; }
  float a = mix(0.2, 1.0, v_near) * u_alpha; // back edges fade: depth without a depth buffer
  o = vec4(u_color * a, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) throw new Error('createShader failed');
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader compile failed');
  return s;
}

type Uniforms = Record<'mvp' | 'rot' | 'size' | 'color' | 'alpha' | 'point', WebGLUniformLocation | null>;

export function mountWireframe(figure: HTMLElement) {
  // Hides the canvas and button (and so the canvas's tab stop) and says why in the caption.
  const showFallback = (message: string) => {
    figure.classList.add('no-gl');
    const caption = figure.querySelector('figcaption');
    if (caption) caption.textContent = message;
  };
  const BROKEN = "The wireframe couldn't start in this browser, so it's hidden.";

  const canvas = figure.querySelector('canvas');
  const gl = canvas?.getContext('webgl2', { antialias: true, premultipliedAlpha: true });
  if (!canvas || !gl) {
    showFallback("This browser doesn't support WebGL 2, so the wireframe can't draw here.");
    return;
  }

  const { verts, edges, count } = icosahedron();
  let U: Uniforms;

  const setColor = () => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--wire').trim();
    gl.uniform3f(U.color, parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);
  };

  // Everything that lives on the GPU. Runs again after a lost context is restored, because every
  // program, buffer and vertex array from before the loss is gone. Throws if the shaders don't build.
  const setupGL = () => {
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'program link failed');
    gl.useProgram(prog);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    U = { mvp: u('u_mvp'), rot: u('u_rot'), size: u('u_size'), color: u('u_color'), alpha: u('u_alpha'), point: u('u_point') };

    gl.bindVertexArray(gl.createVertexArray());
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, canvas.width, canvas.height);
    setColor();
  };

  try {
    setupGL();
  } catch (err) {
    console.warn('Wireframe: WebGL setup failed.', err);
    showFallback(BROKEN);
    return;
  }

  // ---- State ----
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SPIN: Vec3 = [0.1, 0.28, 0.04]; // rad/s
  const STILL: Vec3 = [0, 0, 0];
  // WCAG 2.2.2: motion that starts on its own needs a way to stop it. Off by default under reduced motion.
  let spinning = !reduce;
  let IDLE: Vec3 = spinning ? SPIN : STILL;
  let q = qnorm(qmul(qaxis([1, 0, 0], 0.45), qaxis([0, 1, 0], 0.3)));
  let omega: Vec3 = [...IDLE];
  let dragging = false;
  let last = { x: 0, y: 0, t: 0 };
  let born: number | null = reduce ? -Infinity : null;
  let visible = true;
  let running = false;
  let lost = false; // the GPU context is gone until 'webglcontextrestored'
  let prevT = 0;

  // Scratch matrices, reused every frame. The projection only changes with the canvas's shape.
  const rot = new Float32Array(16);
  const model = new Float32Array(16);
  const mvp = new Float32Array(16);
  const project = () => perspective(0.68, canvas.width / canvas.height, 0.1, 10);
  let proj = project();

  const draw = (t: number) => {
    if (lost) {
      running = false;
      return;
    }
    const dt = Math.min((t - prevT) / 1000, 0.05);
    prevT = t;
    if (born === null) born = t;
    const e = Math.min((t - born) / 1100, 1);
    const ease = 1 - Math.pow(1 - e, 3);

    if (!dragging) {
      omega = easeToward(omega, IDLE, dt); // ease any fling back toward the idle spin
      const speed = len3(omega);
      if (speed > 1e-5) q = qnorm(qmul(qaxis(omega, speed * dt), q));
    }

    // model = translate(z) × rotation × uniform scale: scale the rotation's first three columns,
    // then push the solid back from the camera.
    qmat(q, rot);
    const s = 0.72 + 0.28 * ease;
    for (let i = 0; i < 12; i++) model[i] = rot[i] * s;
    model.set([0, 0, -3.4, 1], 12);
    mul(proj, model, mvp);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(U.mvp, false, mvp);
    gl.uniformMatrix4fv(U.rot, false, rot);
    gl.uniform1f(U.alpha, ease);
    gl.uniform1f(U.point, 0);
    gl.drawElements(gl.LINES, edges.length, gl.UNSIGNED_SHORT, 0);
    gl.uniform1f(U.point, 1);
    gl.uniform1f(U.size, 7 * (canvas.width / canvas.clientWidth));
    gl.drawArrays(gl.POINTS, 0, count);

    if (visible && !isSettled({ entered: e >= 1, dragging, omega, idle: IDLE })) requestAnimationFrame(draw);
    else running = false;
  };

  const kick = () => {
    if (running || !visible || lost) return;
    running = true;
    requestAnimationFrame((t) => {
      prevT = t;
      draw(t);
    });
  };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    proj = project();
    if (!lost) gl.viewport(0, 0, canvas.width, canvas.height);
    kick();
  };

  // ---- Lost GPU context (a mobile browser reclaiming memory, a driver reset) ----
  canvas.addEventListener('webglcontextlost', (ev) => {
    ev.preventDefault(); // tells the browser we want the context back
    lost = true;
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    try {
      setupGL();
    } catch (err) {
      console.warn('Wireframe: WebGL setup failed after the context was restored.', err);
      lost = true;
      showFallback(BROKEN);
      return;
    }
    kick();
  });

  // ---- Input: drag rotates in screen space; release keeps the spin, which eases back to idle ----
  // WCAG 2.5.7: anything done by dragging also needs a single-pointer way. A tap (no drag) nudges the
  // solid toward the side that was tapped, the same nudge the arrow keys give.
  // Only one pointer drives it at a time: a second finger is ignored until the first lifts.
  let activeId: number | null = null;
  let down = { x: 0, y: 0, t: 0, moved: 0 };

  canvas.addEventListener('pointerdown', (ev) => {
    if (activeId !== null) return;
    activeId = ev.pointerId;
    dragging = true;
    last = { x: ev.clientX, y: ev.clientY, t: performance.now() };
    down = { ...last, moved: 0 };
    canvas.setPointerCapture(ev.pointerId);
    kick();
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (ev.pointerId !== activeId) return;
    const now = performance.now();
    const dx = ev.clientX - last.x;
    const dy = ev.clientY - last.y;
    down.moved += Math.hypot(dx, dy);
    const dt = Math.max((now - last.t) / 1000, 1 / 240);
    const axis: Vec3 = [dy, dx, 0];
    const angle = Math.hypot(dx, dy) * (Math.PI / canvas.clientWidth);
    q = qnorm(qmul(qaxis(axis, angle), q));
    const l = Math.hypot(dx, dy) || 1;
    const w = angle / dt / l;
    omega = [omega[0] * 0.5 + axis[0] * w * 0.5, omega[1] * 0.5 + axis[1] * w * 0.5, 0];
    last = { x: ev.clientX, y: ev.clientY, t: now };
  });
  const release = (ev: PointerEvent) => {
    if (ev.pointerId !== activeId) return;
    activeId = null;
    dragging = false;
    const now = performance.now();
    const kind = classifyRelease({
      moved: down.moved,
      heldMs: now - down.t,
      sinceLastMoveMs: now - last.t,
      cancelled: ev.type === 'pointercancel',
    });
    if (kind === 'tap') {
      // Turn toward the tapped side, measured from the center.
      const r = canvas.getBoundingClientRect();
      const dir = tapDirection(down.x - (r.left + r.width / 2), down.y - (r.top + r.height / 2), r.width);
      if (dir) omega = nudge(omega, dir);
    } else if (kind === 'drop') {
      omega = [0, 0, 0];
    } else {
      // 'fling', or 'cancel' (the browser took the swipe to scroll): keep the spin, capped. A scroll
      // usually cancels before any move, so this is just the spin the solid already had.
      omega = capSpin(omega);
    }
    kick();
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  const KEYS: Record<string, Vec3> = { ArrowLeft: [0, -1, 0], ArrowRight: [0, 1, 0], ArrowUp: [-1, 0, 0], ArrowDown: [1, 0, 0] };
  const toggle = figure.querySelector<HTMLButtonElement>('.spin-toggle');
  const setSpinning = (on: boolean) => {
    spinning = on;
    IDLE = on ? SPIN : STILL;
    if (!on) omega = [...STILL]; // stop now, not after the ease-out
    if (toggle) toggle.textContent = on ? 'Stop spinning' : 'Start spinning';
    kick();
  };
  if (toggle) {
    delete toggle.dataset.pending;
    setSpinning(spinning);
    toggle.addEventListener('click', () => setSpinning(!spinning));
  }

  canvas.addEventListener('keydown', (ev) => {
    if (ev.key === ' ') {
      ev.preventDefault();
      setSpinning(!spinning);
      return;
    }
    const dir = KEYS[ev.key];
    if (!dir) return;
    ev.preventDefault();
    omega = nudge(omega, dir, NUDGE);
    kick();
  });

  document.addEventListener('themechange', () => {
    if (!lost) setColor();
    kick();
  });
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) kick();
  }).observe(canvas);
}
