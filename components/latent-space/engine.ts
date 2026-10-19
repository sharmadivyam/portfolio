import { items, skills, worlds, worldIndex, worldPath } from "@/data/portfolio";
import { CONSTELLATIONS, type Constellation } from "./constellations";
import { createScenes, type Fonts, type Frame } from "./scenes";

export type EngineState = {
  active: number | null;
  selectedId: string | null;
  /** The camera is inside a world: show the side panel. */
  inWorld: boolean;
  /** The camera has settled inside a world: show the item pins. */
  pinsVisible: boolean;
};

export type SafeArea = { left: number; top: number; right: number; bottom: number };

export type Press = { kind: "world"; index: number } | { kind: "item"; id: string } | { kind: "skill"; name: string; note: string; home: string } | null;

export type EngineOptions = {
  fonts: Fonts;
  reducedMotion: boolean;
  /** Free space for the overview map, in canvas pixels; null keeps the last measurement. */
  safeArea: () => SafeArea | null;
  /** Tooltip with [data-tip="code"], [data-tip="title"] and [data-tip="text"] children. */
  tooltip: HTMLElement;
  /** Pin buttons with data-id attributes; the engine positions them over their objects. */
  pins: HTMLElement;
  onState: (state: EngineState) => void;
  onPress: (press: Press) => void;
  /** The Big Bang intro has finished forming the worlds. */
  onGenesisDone?: () => void;
};

/** One spark from the Big Bang: it flies out, then settles onto a world, a skill star, or fades as dust. */
type Particle = {
  world: number | null;
  skill: number | null;
  jx: number;
  jy: number;
  angle: number;
  speed: number;
  size: number;
  delay: number;
  color: string;
};

type MapNode = {
  id: string;
  world: number | null;
  object: string | null;
  latent: [number, number];
  color: string;
  name: string;
  kind: string;
  blurb: string;
  /** Skills: which side of their world they sit on (the label reads outward), and that world's name. */
  side?: "left" | "right";
  home?: string;
  neighbours: MapNode[];
  sx: number;
  sy: number;
  alpha: number;
};

type Hover = { node: MapNode; object?: string } | { world: number } | null;
type Camera = { x: number; y: number; z: number };
type Tween = { from: Camera; to: Camera; start: number; dur: number; hop: boolean; k: number; onDone?: () => void };

const ZW = 5.6;                                 // camera zoom when standing inside a world
const CREAM = "#f3e8cc";
const SKILL = "#c9d0e4";
/** The night sky, a radial gradient that is darkest at the edges. The page's CSS repeats it so the first paint matches. */
export const SKY: [stop: number, color: string][] = [[0, "#14275c"], [0.42, "#0c1a40"], [1, "#060d24"]];
const ORBITS = [
  { r: 0.38, dot: 2.2 },
  { r: 0.84, dot: 5.6 },
  { r: 1.3, dot: 0.9, dashed: true },
  { r: 1.8, dot: 3.9, dashed: true },
];

// Big Bang timeline, in seconds after the bang.
const BANG = { flash: 0.35, ring: 1.3, settle: 0.8, settleFor: 1.4, orbits: 1.2, worlds: 1.7, points: 2.4, done: 3.4 };

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function buildNodes(): MapNode[] {
  const nodes: MapNode[] = [
    ...items.map((item) => {
      const index = worldIndex(item.world), w = worlds[index];
      return {
        id: item.id, world: index, object: item.object,
        latent: [w.at[0] + item.offset[0], w.at[1] + item.offset[1]] as [number, number],
        color: w.color, name: item.name, kind: item.kind, blurb: item.blurb,
        neighbours: [], sx: 0, sy: 0, alpha: 0,
      };
    }),
    ...skills.map((skill) => ({
      id: `skill-${skill.name}`, world: null, object: null, latent: skill.at, color: SKILL,
      name: skill.name, kind: "skill", blurb: skill.note, side: skill.side, home: worlds[worldIndex(skill.world)].name,
      neighbours: [], sx: 0, sy: 0, alpha: 0,
    })),
  ];
  // k-nearest neighbours in latent space, drawn as threads on hover.
  for (const n of nodes) {
    n.neighbours = nodes.filter((m) => m !== n)
      .map((m) => [m, Math.hypot(m.latent[0] - n.latent[0], m.latent[1] - n.latent[1])] as const)
      .sort((a, b) => a[1] - b[1]).slice(0, 3).map(([m]) => m);
  }
  return nodes;
}

export class LatentSpaceEngine {
  private ctx: CanvasRenderingContext2D;
  private scenes: ReturnType<typeof createScenes>;
  private nodes = buildNodes();
  private stars = Array.from({ length: 300 }, () => ({
    x: (Math.random() - 0.5) * 5.5, y: (Math.random() - 0.5) * 4, p: 0.12 + Math.random() * 0.5,
    r: Math.random() * 1.1 + 0.25, a: Math.random() * 0.55 + 0.12, tw: Math.random() * 7,
  }));
  private W = 0;
  private H = 0;
  private M = 0;
  private home: Camera = { x: 0, y: 0, z: 1 };
  /** Big Bang intro: null when off; `bangAt` is null while the star is still gathering. */
  private genesis: { gather: number; bangAt: number | null; done: boolean } | null = null;
  private particles: Particle[] = [];
  /** Constellations placed in the empty sky around the overview (screen pixels, longer side `size`). */
  private sky: { c: Constellation; x: number; y: number; size: number }[] = [];
  /** A world gently pulsing to invite a first-time visitor's first click. */
  private beckon: number | null = null;
  private now = performance.now();
  /** World labels fade in once the Big Bang has formed the worlds. */
  private labelFade = 0;
  private cam: Camera = { x: 0, y: 0, z: 1 };
  private tween: Tween | null = null;
  private active: number | null = null;
  private leaving: number | null = null;
  private selected: MapNode | null = null;
  private hover: Hover = null;
  private matches = new Set<string>();
  private mouse = { x: -999, y: -999 };
  private time = 0;
  private t0 = performance.now();
  private raf = 0;
  private lastState = "";
  private resizeObserver: ResizeObserver;

  constructor(private canvas: HTMLCanvasElement, private opts: EngineOptions) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D is not available");
    this.ctx = ctx;
    this.scenes = createScenes(ctx, opts.fonts);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
    canvas.addEventListener("pointerdown", this.onPointerDown);
  }

  start() {
    this.resize();
    this.cam = { ...this.home };
    this.resizeObserver.observe(this.canvas);
    this.raf = requestAnimationFrame(this.frame);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
  }

  // ----- public controls -----

  enterWorld(index: number, instant = false) {
    if (index === this.active && !this.tween) return;
    this.leaving = this.active !== null && this.active !== index ? this.active : null;
    this.active = index;
    this.selected = null;
    this.flyTo(this.worldCam(index), instant, () => { this.leaving = null; });
  }

  exitToSpace() {
    if (this.active === null) return;
    this.selected = null;
    this.flyTo(this.home, false, () => { this.active = null; });
  }

  hop(dir: 1 | -1) {
    const n = worlds.length;
    this.enterWorld(this.active === null ? 0 : (this.active + dir + n) % n);
  }

  openItem(id: string, instant = false) {
    const node = this.nodes.find((n) => n.id === id);
    if (!node || node.world === null) return;
    const moving = this.active !== node.world || this.tween !== null || this.cam.z < ZW - 0.01;
    if (moving) this.enterWorld(node.world, instant);
    this.selected = node;
    // Phones: pan so the chosen place sits in view above its card.
    if (this.isPhone()) this.flyTo(this.worldCam(node.world, node), instant, () => { this.leaving = null; }, moving ? undefined : 700);
  }

  clearSelection() {
    this.selected = null;
    if (this.isPhone() && this.active !== null) this.flyTo(this.worldCam(this.active), false, () => { this.leaving = null; }, 700);
  }

  setMatches(ids: string[]) {
    this.matches = new Set(ids);
  }

  /** Re-measure the free space for the overview (e.g. after the header changes size). */
  refreshHome() {
    const old = this.home;
    this.computeHome();
    if (this.active === null && !this.tween) this.cam = { ...this.home };
    // A flight already heading back to the overview lands on the re-fitted view instead.
    else if (this.tween && this.tween.to.x === old.x && this.tween.to.y === old.y && this.tween.to.z === old.z) this.tween.to = { ...this.home };
  }

  /** Start (or restart) the Big Bang intro: one star where Origin will form, nothing else yet. */
  setGenesis(on: boolean) {
    this.genesis = on ? { gather: 0, bangAt: null, done: false } : null;
    this.particles = [];
    if (!on) return;
    this.active = null;
    this.leaving = null;
    this.selected = null;
    this.tween = null;
    this.cam = { ...this.home };
  }

  /** Ripple slowly around one world to invite a first click; null stops it. */
  setBeckon(index: number | null) {
    this.beckon = index;
  }

  /** How far the visitor has scrolled towards the bang (0–1). */
  setGather(progress: number) {
    if (this.genesis && this.genesis.bangAt === null) this.genesis.gather = clamp(progress);
  }

  /** Set it off. The worlds form on their own from here. */
  bang() {
    const g = this.genesis;
    if (!g || g.bangAt !== null) return;
    g.gather = 1;
    g.bangAt = performance.now();
    if (this.opts.reducedMotion) {
      g.done = true;
      this.opts.onGenesisDone?.();
      return;
    }
    const few = this.W < 768;
    const spark = (world: number | null, skill: number | null, color: string, dust = false): Particle => ({
      world, skill, color,
      jx: (Math.random() - 0.5) * 9, jy: (Math.random() - 0.5) * 9,
      angle: Math.random() * Math.PI * 2,
      speed: (dust ? 0.45 + Math.random() * 0.7 : 0.18 + Math.random() * 0.4) * Math.min(this.W, this.H),
      size: dust ? 0.8 + Math.random() * 1.2 : 1.2 + Math.random() * 1.6,
      delay: Math.random() * 0.45,
    });
    this.particles = [
      ...worlds.flatMap((w, i) => Array.from({ length: few ? 22 : 42 }, () => spark(i, null, w.color))),
      ...skills.flatMap((_, k) => Array.from({ length: few ? 2 : 3 }, () => spark(null, k, SKILL))),
      ...Array.from({ length: few ? 60 : 130 }, () => spark(null, null, Math.random() < 0.7 ? CREAM : "#ffc926", true)),
    ];
  }

  /** Seconds since the bang: -1 before it, Infinity when the intro is off or finished. */
  private bangTime() {
    const g = this.genesis;
    if (!g || g.done) return Infinity;
    return g.bangAt === null ? -1 : (this.now - g.bangAt) / 1000;
  }

  /** 0 → 1 as part of the scene forms during the bang; always 1 outside the intro. */
  private formed(start: number, duration: number) {
    const t = this.bangTime();
    return t === Infinity ? 1 : t < 0 ? 0 : ease(clamp((t - start) / duration));
  }

  // ----- layout & camera -----

  private resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = this.canvas.getBoundingClientRect();
    this.W = r.width;
    this.H = r.height;
    this.M = Math.min(this.W, this.H * 1.15);
    this.canvas.width = Math.round(this.W * dpr);
    this.canvas.height = Math.round(this.H * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.refreshHome();
    if (this.active !== null && !this.tween) this.cam = this.worldCam(this.active, this.selected);
  }

  /** Phones (and anything narrower than the md breakpoint) get the chip-strip layout. */
  private isPhone() {
    return this.W < 768;
  }

  private base() {
    return this.M * 0.36;
  }

  private depth() {
    return clamp((this.cam.z - 1.6) / (ZW - 1.6));    // 0 = open space, 1 = inside a world
  }

  /** Fit all seven worlds (plus their labels) into the free space around the header and controls. */
  private computeHome() {
    const safe = this.opts.safeArea(), base = this.base();
    if (!safe) return;
    const sw = Math.max(160, safe.right - safe.left), sh = Math.max(160, safe.bottom - safe.top);
    // Worlds span 1.64 latent units side to side; their name labels need a little room around them.
    // On phones the name labels are wider than the islands; elsewhere the islands set the width.
    const narrow = this.W < 600;
    const wide = narrow ? (sw - 96) / (1.64 * base) : (sw - 40) / (1.99 * base);
    const z = clamp(Math.min(wide, (sh - 30) / (1.78 * base)), 0.4, 1.3);
    const s = base * z, sx = (safe.left + safe.right) / 2, sy = (safe.top + safe.bottom) / 2;
    this.home = { x: -(sx - this.W / 2) / s, y: 0.01 - (sy - (narrow ? 14 : 22) - this.H / 2) / s, z };
    this.layoutConstellations(safe);
  }

  /**
   * Hang the constellations in the empty sky around the worlds: in the bands either side of the ring on wide
   * screens, above and below it on tall ones, two to a band, clear of the world names and the corner planet.
   */
  private layoutConstellations(safe: SafeArea) {
    const { W, H } = this, s = this.base() * this.home.z, u = s * 0.0166, narrow = W < 600;
    const label = narrow ? 15 : 21, half = Math.max(10.4 * u, label * 3.6), gap = narrow ? 10 : 24;
    const xs = worlds.map((w) => W / 2 + (w.at[0] - this.home.x) * s), ys = worlds.map((w) => H / 2 + (w.at[1] - this.home.y) * s);
    // Skill columns sit beside the worlds; on wider screens their labels reach further out than the islands.
    const reach = skills.map((k) => {
      const x = W / 2 + (k.at[0] - this.home.x) * s, text = narrow ? 6 : 10 + k.name.length * 6.4;
      return k.side === "left" ? x - text : x + text;
    });
    const ring = {
      left: Math.min(...xs.map((x) => x - half), ...reach) - gap, right: Math.max(...xs.map((x) => x + half), ...reach) + gap,
      top: Math.min(...ys) - 11 * u - gap, bottom: Math.max(...ys) + 10.4 * u + label * 1.4 + gap,
    };
    type Box = { x0: number; y0: number; x1: number; y1: number };
    const sides: Box[] = [{ x0: safe.left, y0: safe.top, x1: ring.left, y1: safe.bottom }, { x0: ring.right, y0: safe.top, x1: safe.right, y1: safe.bottom }];
    const ends: Box[] = [{ x0: safe.left, y0: safe.top, x1: safe.right, y1: ring.top }, { x0: safe.left, y0: ring.bottom, x1: safe.right, y1: safe.bottom }];
    const room = (bands: Box[]) => bands.reduce((sum, b) => sum + Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0), 0);
    const tall = room(sides) >= room(ends);
    const slots = (tall ? sides : ends).flatMap((b): Box[] => tall
      ? [{ ...b, y1: (b.y0 + b.y1) / 2 }, { ...b, y0: (b.y0 + b.y1) / 2 }]
      : [{ ...b, x1: (b.x0 + b.x1) / 2 }, { ...b, x0: (b.x0 + b.x1) / 2 }]);
    const R = Math.min(W, H) * (W < 768 ? 0.15 : 0.2), pcx = W - R * 0.15, pcy = H + R * 0.3, pr = R * 1.35;
    const pool = (tall ? ["Orion", "Cygnus", "Scorpius", "Lyra", "Crux"] : ["Big Dipper", "Cassiopeia", "Leo", "Crux", "Lyra"])
      .map((name) => CONSTELLATIONS.find((c) => c.name === name)).filter((c): c is Constellation => Boolean(c));
    const inset = narrow ? 8 : 18, smallest = narrow ? 44 : 70, largest = narrow ? 104 : 170;
    this.sky = [];
    for (const slot of slots) {
      // Lift a slot's floor above the planet's glow where they would meet.
      const nx = clamp(pcx, slot.x0, slot.x1);
      if (Math.hypot(nx - pcx, clamp(pcy, slot.y0, slot.y1) - pcy) < pr) slot.y1 = Math.min(slot.y1, pcy - Math.sqrt(Math.max(0, pr * pr - (nx - pcx) ** 2)) - 8);
      const w = slot.x1 - slot.x0 - 2 * inset, h = slot.y1 - slot.y0 - 2 * inset;
      if (Math.min(w, h) < smallest) continue;
      // The figure that fills the slot best; the longer side is capped so they stay small and quiet.
      const fit = (c: Constellation) => Math.min(largest, c.aspect >= 1 ? Math.min(w, h * c.aspect) : Math.min(h, w / c.aspect));
      const used = new Set(this.sky.map((p) => p.c));
      const c = pool.filter((p) => !used.has(p)).reduce<Constellation | null>((best, p) => (!best || fit(p) > fit(best) + 0.5 ? p : best), null);
      if (!c) break;
      const size = fit(c), bw = c.aspect >= 1 ? size : size * c.aspect, bh = c.aspect >= 1 ? size / c.aspect : size;
      this.sky.push({ c, size, x: (slot.x0 + slot.x1 - bw) / 2, y: (slot.y0 + slot.y1 - bh) / 2 });
    }
  }

  /** Inside a world, keep the island clear of the panel: left of it on desktop, above it on phones. */
  private worldCam(index: number, focus: MapNode | null = null): Camera {
    const w = worlds[index];
    if (this.isPhone()) return this.phoneWorldCam(index, focus);
    const s = this.base() * ZW;
    return { x: w.at[0] + 200 / s, y: w.at[1] + 10 / s, z: ZW };
  }

  /**
   * Phones: the island fills the width between the top bar and the slim bottom sheet. With a place chosen,
   * the camera pans so that place sits in the space above its (taller) card.
   */
  private phoneWorldCam(index: number, focus: MapNode | null): Camera {
    // Sheet heights: ~250px with chips, up to 58dvh with a card (most cards are shorter, so aim at half the screen).
    const w = worlds[index], top = 70, sheet = 250, card = this.H * 0.5;
    // The island is about 20.8u wide and 18u tall (u = scene units per world tile).
    const u = Math.min((this.W - 24) / 20.8, (this.H - 16 - sheet - top) / 18);
    const z = clamp(u / (this.base() * 0.0166), ZW, 9), s = this.base() * z;
    const anchor = focus?.object ? this.scenes.anchor(w.key, { cx: 0, cy: 0, u: 1, oy: 1.2 }, focus.object, this.time) : null;
    if (!anchor) {
      const centre = (top + this.H - 16 - sheet) / 2;
      return { x: w.at[0], y: w.at[1] - (centre - this.H / 2) / s, z };
    }
    const centre = (top + this.H - 16 - card) / 2;
    return { x: w.at[0] + anchor[0] * 0.0166, y: w.at[1] + anchor[1] * 0.0166 - (centre - this.H / 2) / s, z };
  }

  private flyTo(to: Camera, instant: boolean, onDone?: () => void, duration?: number) {
    if (instant || this.opts.reducedMotion) {
      this.cam = { ...to };
      this.tween = null;
      onDone?.();
      return;
    }
    const from = { ...this.cam };
    // world → world: arc out through space, then back in (small pans within a world stay level)
    const hop = from.z > 2.5 && to.z > 2.5 && Math.hypot(to.x - from.x, to.y - from.y) > 0.4;
    this.tween = { from, to: { ...to }, start: performance.now(), dur: duration ?? (hop ? 2000 : 1500), hop, k: 0, onDone };
  }

  private step(now: number) {
    const tw = this.tween;
    if (!tw) return;
    const k = clamp((now - tw.start) / tw.dur), e = ease(k);
    tw.k = k;
    this.cam.x = lerp(tw.from.x, tw.to.x, e);
    this.cam.y = lerp(tw.from.y, tw.to.y, e);
    const lz = lerp(Math.log(tw.from.z), Math.log(tw.to.z), e);
    this.cam.z = Math.exp(tw.hop ? lz - Math.sin(Math.PI * e) * 1.3 : lz);
    if (k >= 1) {
      this.tween = null;
      tw.onDone?.();
    }
  }

  private toScreen([lx, ly]: [number, number]): [number, number] {
    const s = this.base() * this.cam.z;
    return [this.W / 2 + (lx - this.cam.x) * s, this.H / 2 + (ly - this.cam.y) * s];
  }

  private frameFor(index: number, scale = 1): Frame {
    const [cx, cy] = this.toScreen(worlds[index].at);
    const u = this.base() * this.cam.z * 0.0166 * scale;
    const bob = this.opts.reducedMotion ? 0 : Math.sin(this.time * 0.8 + index * 1.7) * u * 0.25;
    return { cx, cy, u, oy: u * 1.2 - bob };
  }

  // ----- the loop -----

  private frame = (now: number) => {
    this.now = now;
    this.step(now);
    // rAF timestamps can trail the constructor's clock by a frame; scenes index colours by time, so never go negative.
    this.time = this.opts.reducedMotion ? 0 : Math.max(0, (now - this.t0) / 1000);
    const g = this.genesis;
    if (g && !g.done && this.bangTime() >= BANG.done) {
      g.done = true;
      this.particles = [];
      this.opts.onGenesisDone?.();
    }
    const forming = Boolean(g && !g.done);
    const fadeTo = forming ? 0 : 1;
    this.labelFade = this.opts.reducedMotion ? fadeTo : this.labelFade + (fadeTo - this.labelFade) * 0.06;
    this.hover = this.tween || forming ? null : this.pick(this.mouse.x, this.mouse.y);
    this.draw();
    this.canvas.style.cursor = this.hover ? "pointer" : "default";
    this.updateTooltip();
    this.updatePins();
    this.emit();
    this.raf = requestAnimationFrame(this.frame);
  };

  private emit() {
    const d = this.depth();
    const state: EngineState = {
      active: this.active,
      selectedId: this.selected?.id ?? null,
      inWorld: this.active !== null && d > 0.6,
      pinsVisible: this.active !== null && d > 0.92 && !this.tween,
    };
    const key = JSON.stringify(state);
    if (key === this.lastState) return;
    this.lastState = key;
    this.opts.onState(state);
  }

  // ----- drawing -----

  private draw() {
    const { ctx, W, H } = this, d = this.depth(), t = this.time;
    // while hopping, the world we just left fades out instead of vanishing
    const lf = this.tween && this.leaving !== null ? clamp(1 - this.tween.k * 2.2) : 0;

    const sky = ctx.createRadialGradient(W * 0.42, H * 0.55, 0, W * 0.42, H * 0.55, Math.max(W, H) * 0.85);
    for (const [stop, color] of SKY) sky.addColorStop(stop, color);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    this.drawStars();
    this.drawConstellations(d, this.formed(BANG.worlds, 0.9), this.formed(BANG.points - 0.2, 1.2));
    this.drawPlanet(d, this.formed(1.5, 1.5));
    this.drawOrbits(d, this.formed(BANG.orbits, 1.4));

    // a slow ripple on the floor of space around the world a first-time visitor is invited to click
    if (this.beckon !== null && d < 0.3) {
      const X = this.frameFor(this.beckon), k = this.opts.reducedMotion ? 0.35 : (this.time * 0.5) % 1;
      ctx.save();
      ctx.globalAlpha = (1 - k) * 0.55 * (1 - d / 0.3) * this.labelFade;
      ctx.strokeStyle = CREAM;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(X.cx, X.cy + X.oy, X.u * (13 + k * 7), X.u * (7 + k * 3.5), 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // the worlds: tiny islands far away, full scenes up close
    const hot = this.hotObject(), narrow = W < 600;
    const labelScale = clamp((this.base() * this.cam.z) / 340, 0.8, 1.05);
    worlds.forEach((w, i) => {
      const born = this.formed(BANG.worlds + i * 0.08, 0.9);
      const a = (this.active === i ? 1 : i === this.leaving ? Math.max(1 - d, lf) : 1 - d) * born;
      if (a < 0.02) return;
      const X = this.frameFor(i, 0.45 + 0.55 * born);
      if (X.cx < -W || X.cx > 2 * W || X.cy < -H || X.cy > 2 * H) return;
      this.scenes.draw(w.key, X, a, t, this.active === i ? d : 0, w.color, this.active === i ? hot : null);
      const la = (1 - d * 3) * a * this.labelFade;
      if (la > 0.02) {
        const y0 = X.cy + X.u * 10.4;
        ctx.globalAlpha = la;
        ctx.textAlign = "center";
        const size = narrow ? 15 : 21 * labelScale;
        ctx.fillStyle = CREAM;
        ctx.font = `700 ${size}px ${this.opts.fonts.display}`;
        ctx.fillText(w.name.toUpperCase(), X.cx, y0 + size);
        ctx.textAlign = "start";
        ctx.globalAlpha = 1;
      }
    });

    // neighbour threads for the hovered point
    const hn = this.hover && "node" in this.hover ? this.hover.node : null;
    if (hn && d < 0.3) {
      ctx.strokeStyle = "rgba(243,232,204,0.5)";
      ctx.lineWidth = 1;
      for (const m of hn.neighbours) {
        ctx.beginPath(); ctx.moveTo(hn.sx, hn.sy); ctx.lineTo(m.sx, m.sy); ctx.stroke();
      }
    }

    // points: at their latent coordinates in space; on their objects inside a world
    const pointsBorn = this.formed(BANG.points, 0.8);
    for (const n of this.nodes) {
      let [x, y] = this.toScreen(n.latent), a = 1, r = n.world !== null ? 3 : 1.7;
      if (this.active !== null) {
        if (n.world !== null && (n.world === this.active || (n.world === this.leaving && lf > 0))) {
          const own = n.world === this.active;
          const k = own ? ease(clamp((d - 0.1) / 0.9)) : ease(lf);
          const an = n.object ? this.scenes.anchor(worlds[n.world].key, this.frameFor(n.world), n.object, t) : null;
          if (an) { x = lerp(x, an[0], k); y = lerp(y, an[1], k); }
          r = 3 + (own ? d : lf) * 1.5;
          if (!own) a = Math.max(1 - d, lf);
        } else a = 1 - d;
      }
      // Phones: the islands are tiny from out here, so their places stay dark until you step inside a world.
      // Search matches still light up.
      if (this.isPhone() && n.world !== null && !this.matches.has(n.id)) a *= n.world === this.active ? clamp((d - 0.6) / 0.4) : 0;
      a *= pointsBorn;
      n.sx = x; n.sy = y; n.alpha = a;
      if (a < 0.02) continue;
      const dim = this.matches.size && !this.matches.has(n.id) ? 0.25 : 1;
      const lit = n === hn || this.matches.has(n.id);
      // Skill stars stay quiet next to the worlds unless hovered or matched.
      this.glow(x, y, r, n.color, a * dim * (n.world === null && !lit ? (this.isPhone() ? 0.35 : 0.55) : 1), lit);
      // Phones have no text labels on the island, so each place's dot ripples to invite a tap; the chosen one gets a ring.
      if (this.isPhone() && this.active !== null && n.world === this.active && d > 0.9) {
        const chosen = n === this.selected, k = (this.time * 0.55 + n.latent[0] * 7.3) % 1;
        ctx.globalAlpha = chosen ? 0.95 : (1 - k) * 0.55;
        ctx.strokeStyle = chosen ? CREAM : n.color;
        ctx.lineWidth = chosen ? 2 : 1.5;
        ctx.beginPath(); ctx.arc(x, y, chosen ? 11 : 6 + k * 13, 0, 7); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // Skill names: always shown faintly (not on phones, where the map is too small), brighter on hover or a match.
      // They read away from their world, so they never run over its island.
      if (n.world === null && d < 0.3 && (lit || !narrow)) {
        ctx.globalAlpha = (lit ? 0.9 : 0.4 * dim) * (1 - d / 0.3) * this.labelFade;
        ctx.fillStyle = SKILL;
        ctx.font = `400 10px ${this.opts.fonts.mono}`;
        const left = n.side === "left";
        ctx.textAlign = left ? "right" : "left";
        ctx.fillText(n.name, left ? x - 7 : x + 7, y + 3.5);
        ctx.textAlign = "start";
        ctx.globalAlpha = 1;
      }
    }

    if (this.genesis && !this.genesis.done) this.drawGenesis();
  }

  /** The star, the flash, the shockwave and the sparks that become the worlds. */
  private drawGenesis() {
    const { ctx, W, H } = this, g = this.genesis!, t = this.bangTime();
    const [ox, oy] = this.toScreen(worlds[0].at);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // The star: pulses while waiting, swells and trembles as the visitor scrolls, gone the instant it bangs.
    const starA = t < 0 ? 1 : clamp(1 - t / 0.15);
    if (starA > 0) {
      const k = g.gather, pulse = 0.5 + 0.5 * Math.sin(this.now / 420);
      const shake = k > 0.6 ? (k - 0.6) * 6 : 0;
      const sx = ox + (Math.random() - 0.5) * shake, sy = oy + (Math.random() - 0.5) * shake;
      const R = 34 + k * 90 + pulse * 10;
      const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, R);
      halo.addColorStop(0, `rgba(255,236,190,${0.55 * starA})`);
      halo.addColorStop(0.35, `rgba(255,201,38,${(0.18 + k * 0.2) * starA})`);
      halo.addColorStop(1, "rgba(255,201,38,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(sx, sy, R, 0, 7); ctx.fill();
      ctx.globalAlpha = starA;
      ctx.fillStyle = "#fff8ec";
      ctx.beginPath(); ctx.arc(sx, sy, 3.2 + k * 3.5 + pulse * 0.8, 0, 7); ctx.fill();
      ctx.strokeStyle = `rgba(255,248,236,${0.35 + k * 0.4})`;               // four-point glint
      ctx.lineWidth = 1;
      const L = 14 + k * 30;
      ctx.beginPath(); ctx.moveTo(sx - L, sy); ctx.lineTo(sx + L, sy); ctx.moveTo(sx, sy - L); ctx.lineTo(sx, sy + L); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (t >= 0) {
      // Flash
      const flash = clamp(1 - t / BANG.flash);
      if (flash > 0) {
        const f = ctx.createRadialGradient(ox, oy, 0, ox, oy, Math.max(W, H));
        f.addColorStop(0, `rgba(255,248,236,${0.95 * flash})`);
        f.addColorStop(0.4, `rgba(255,220,150,${0.45 * flash})`);
        f.addColorStop(1, "rgba(255,220,150,0)");
        ctx.fillStyle = f;
        ctx.fillRect(0, 0, W, H);
      }
      // Shockwave
      const rk = clamp(t / BANG.ring);
      if (rk < 1) {
        const r = (1 - Math.pow(1 - rk, 3)) * Math.hypot(W, H) * 0.7;
        ctx.strokeStyle = `rgba(255,236,190,${0.55 * (1 - rk)})`;
        ctx.lineWidth = 3 + (1 - rk) * 5;
        ctx.beginPath(); ctx.arc(ox, oy, r, 0, 7); ctx.stroke();
      }
      // Sparks: fly out, then settle onto their worlds and skill stars; dust drifts away and fades.
      for (const p of this.particles) {
        const out = p.speed * (1 - Math.exp(-t * 3.2));
        let x = ox + Math.cos(p.angle) * out, y = oy + Math.sin(p.angle) * out, a = 1;
        if (p.world !== null) {
          const X = this.frameFor(p.world);
          const tx = X.cx + (p.jx - p.jy) * 0.866 * X.u, ty = X.cy + (p.jx + p.jy) * 0.5 * X.u;
          const k = ease(clamp((t - BANG.settle - p.delay) / BANG.settleFor));
          x = lerp(x, tx, k); y = lerp(y, ty, k);
          a = 1 - clamp((t - BANG.worlds - 0.5) / 0.9);
        } else if (p.skill !== null) {
          const [tx, ty] = this.toScreen(skills[p.skill].at);
          const k = ease(clamp((t - BANG.settle - p.delay) / BANG.settleFor));
          x = lerp(x, tx, k); y = lerp(y, ty, k);
          a = 1 - clamp((t - BANG.points) / 0.8);
        } else {
          a = 1 - clamp((t - 0.6) / 1.2);
        }
        if (a <= 0.01) continue;
        ctx.globalAlpha = a * 0.35;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(x, y, p.size * 3, 0, 7); ctx.fill();
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  private drawStars() {
    const { ctx, W, H } = this, base = this.base();
    ctx.fillStyle = CREAM;
    for (const s of this.stars) {
      const sc = base * (1 + (this.cam.z - 1) * s.p * 0.2);
      const x = W / 2 + (s.x - this.cam.x * s.p) * sc, y = H / 2 + (s.y - this.cam.y * s.p) * sc;
      if (x < -4 || y < -4 || x > W + 4 || y > H + 4) continue;
      ctx.globalAlpha = s.a * (0.65 + 0.35 * Math.sin(this.time * 1.2 + s.tw));
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** The constellations: they trace themselves in after the Big Bang, drift a little with the camera, and fade inside a world. */
  private drawConstellations(d: number, born: number, traced: number) {
    const a = (1 - d) * born;
    if (a < 0.02 || !this.sky.length) return;
    const { ctx } = this, dx = (this.home.x - this.cam.x) * 14, dy = (this.home.y - this.cam.y) * 14;
    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(196,212,255,0.11)";
    for (const { c, x, y, size } of this.sky) {
      const pts = c.stars.map((p) => [x + p.x * size + dx, y + p.y * size + dy] as const);
      ctx.globalAlpha = a;
      c.lines.forEach(([i, j], k) => {
        const e = clamp(traced * c.lines.length - k);
        if (e <= 0) return;
        const [x0, y0] = pts[i], [x1, y1] = pts[j];
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, e), lerp(y0, y1, e)); ctx.stroke();
      });
      c.stars.forEach((star, k) => {
        const [sx, sy] = pts[k], r = 0.7 + star.bright * 0.9;
        const shine = a * (0.25 + 0.4 * star.bright) * (0.8 + 0.2 * Math.sin(this.time * 1.4 + k * 2.3 + x));
        const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
        halo.addColorStop(0, star.color);
        halo.addColorStop(1, "rgba(0,0,0,0)");
        ctx.globalAlpha = shine * 0.2;
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(sx, sy, r * 4, 0, 7); ctx.fill();
        ctx.globalAlpha = shine;
        ctx.fillStyle = star.color;
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, 7); ctx.fill();
      });
    }
    ctx.restore();
  }

  /** A sunlit planet in the corner, far away, so it barely moves with the camera. */
  private drawPlanet(d: number, born = 1) {
    if (born < 0.01) return;
    const { ctx, W, H } = this;
    const R = Math.min(W, H) * (W < 768 ? 0.15 : 0.2);
    const cx = W - R * 0.15 - this.cam.x * 12, cy = H + R * 0.3 - this.cam.y * 12;
    ctx.save();
    ctx.globalAlpha = 0.7 * (1 - d * 0.5) * born;
    const glow = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.3);
    glow.addColorStop(0, "rgba(255,201,38,0.16)");
    glow.addColorStop(1, "rgba(255,201,38,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.3, 0, 7); ctx.fill();
    const lx = cx - R * 0.4, ly = cy - R * 0.56;
    const body = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * 1.7);
    body.addColorStop(0, "rgba(255,201,38,0.9)");
    body.addColorStop(0.28, "rgba(249,96,21,0.55)");
    body.addColorStop(0.62, "rgba(43,74,143,0.9)");
    body.addColorStop(1, "#0d1a3d");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = "rgba(255,201,38,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.43, R * 0.23, (-14 * Math.PI) / 180, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  /** Faint orbit rings around the origin; the worlds sit on the second one. */
  private drawOrbits(d: number, drawn = 1) {
    const a = (1 - d) * drawn;
    if (a < 0.02) return;
    const { ctx } = this, [ox, oy] = this.toScreen([0, 0]), s = this.base() * this.cam.z;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineWidth = 1.2;
    for (const o of ORBITS) {
      ctx.strokeStyle = "rgba(243,232,204,0.11)";
      ctx.setLineDash(o.dashed ? [2, 7] : []);
      ctx.beginPath(); ctx.arc(ox, oy, o.r * s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * drawn); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(243,232,204,0.5)";
      ctx.beginPath(); ctx.arc(ox + Math.cos(o.dot) * o.r * s, oy + Math.sin(o.dot) * o.r * s, 2, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  private glow(x: number, y: number, r: number, color: string, a: number, pulse: boolean) {
    const { ctx } = this;
    ctx.globalAlpha = a;
    const R = r * (pulse ? 6.5 : 4.5);
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff8ec";
    ctx.beginPath(); ctx.arc(x, y, r * 0.7, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ----- interaction -----

  private hotObject() {
    if (this.hover && "object" in this.hover && this.hover.object) return this.hover.object;
    if (this.selected && this.selected.world === this.active) return this.selected.object;
    return null;
  }

  private pick(mx: number, my: number): Hover {
    if (mx < 0) return null;
    const d = this.depth();
    if (this.active !== null && d > 0.85) {
      const object = this.scenes.hit(worlds[this.active].key, this.frameFor(this.active), mx, my, this.time);
      const node = object ? this.nodes.find((n) => n.object === object && n.world === this.active) : undefined;
      if (node) return { node, object: object ?? undefined };
    }
    let best: MapNode | null = null, bd = 18;
    for (const n of this.nodes) {
      if (n.alpha < 0.3) continue;
      const dist = Math.hypot(n.sx - mx, n.sy - my);
      if (dist < bd) { bd = dist; best = n; }
    }
    if (best) return { node: best };
    if (d < 0.3) {
      for (let i = 0; i < worlds.length; i++) {
        const X = this.frameFor(i);
        if (Math.abs(mx - X.cx) < X.u * 10.5 && Math.abs(my - X.cy) < X.u * 8) return { world: i };
      }
    }
    return null;
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;           // no hover on touch screens: a tap opens the card instead
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - r.left;
    this.mouse.y = e.clientY - r.top;
  };

  private onPointerLeave = () => {
    this.mouse.x = this.mouse.y = -999;
  };

  private onPointerDown = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    const h = this.tween ? null : this.pick(e.clientX - r.left, e.clientY - r.top);
    if (!h) return this.opts.onPress(null);
    if ("world" in h) {
      this.opts.onPress({ kind: "world", index: h.world });
      this.enterWorld(h.world);
    } else if (h.node.world === null) {
      this.opts.onPress({ kind: "skill", name: h.node.name, note: h.node.blurb, home: h.node.home ?? "" });
    } else {
      this.opts.onPress({ kind: "item", id: h.node.id });
      this.openItem(h.node.id);
    }
  };

  private updateTooltip() {
    const tip = this.opts.tooltip, h = this.hover;
    if (!h) { tip.dataset.show = "false"; return; }
    let code: string, title: string, text: string;
    if ("world" in h) {
      const w = worlds[h.world];
      [code, title, text] = [worldPath(h.world), w.name, `${w.description} Click to step inside.`];
    } else {
      const n = h.node;
      const code0 = n.home ? `skill · used in ${n.home.toLowerCase()}` : `${n.kind}  z = (${n.latent[0].toFixed(2)}, ${n.latent[1].toFixed(2)})`;
      [code, title, text] = [code0, n.name, n.blurb];
    }
    const set = (part: string, value: string) => {
      const el = tip.querySelector<HTMLElement>(`[data-tip="${part}"]`);
      if (el && el.textContent !== value) el.textContent = value;
    };
    set("code", code); set("title", title); set("text", text);
    tip.style.left = `${Math.min(this.mouse.x + 16, this.W - 290)}px`;
    tip.style.top = `${Math.min(this.mouse.y + 16, this.H - 130)}px`;
    tip.dataset.show = "true";
  }

  /** Pins sit above their objects; any pin that would overlap one already placed moves up above it. */
  private updatePins() {
    const layer = this.opts.pins;
    const visible = this.active !== null && this.depth() > 0.92 && !this.tween;
    layer.style.visibility = visible ? "visible" : "hidden";
    if (!visible) return;
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    Array.from(layer.querySelectorAll<HTMLElement>("[data-id]"))
      .map((el) => {
        const n = this.nodes.find((m) => m.id === el.dataset.id);
        return { el, x: n?.sx ?? -999, y: n?.sy ?? -999, w: el.offsetWidth, h: el.offsetHeight };
      })
      .filter((p) => p.w > 0)                          // pins hidden by CSS (phones show only the chosen one)
      .sort((a, b) => b.y - a.y)
      .forEach((p) => {
        for (let tries = 0; tries < 8; tries++) {
          const hit = placed.find((q) => Math.abs(q.x - p.x) < (q.w + p.w) / 2 + 6 && Math.abs(q.y - p.y) < (q.h + p.h) / 2 + 3);
          if (!hit) break;
          p.y = hit.y - (hit.h + p.h) / 2 - 4;
        }
        placed.push(p);
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
      });
  }
}
