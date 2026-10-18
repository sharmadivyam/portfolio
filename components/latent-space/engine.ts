import { items, skills, worlds, worldIndex, worldPath } from "@/data/portfolio";
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

export type Press = { kind: "world"; index: number } | { kind: "item"; id: string } | { kind: "skill" } | null;

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
const ORBITS = [
  { r: 0.38, dot: 2.2 },
  { r: 0.84, dot: 5.6 },
  { r: 1.3, dot: 0.9, dashed: true },
  { r: 1.8, dot: 3.9, dashed: true },
];

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
      name: skill.name, kind: "skill", blurb: "A skill that shows up across worlds.",
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
  /** Title screen: the map sits slightly zoomed out behind it, then eases in on enter. */
  private intro = true;
  /** World labels fade in as the title screen leaves. */
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
    this.cam = this.restingCam();
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
    this.intro = false;
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
    if (this.active !== node.world || this.tween || this.cam.z < ZW - 0.01) this.enterWorld(node.world, instant);
    this.selected = node;
  }

  clearSelection() {
    this.selected = null;
  }

  setMatches(ids: string[]) {
    this.matches = new Set(ids);
  }

  /** Re-measure the free space for the overview (e.g. after the header changes size). */
  refreshHome() {
    this.computeHome();
    if (this.active === null && !this.tween) this.cam = this.restingCam();
  }

  /** Show or leave the title screen. Leaving eases the camera in to the overview. */
  setIntro(on: boolean, instant = false) {
    if (this.intro === on) return;
    this.intro = on;
    this.selected = null;
    if (on) {
      this.active = null;
      this.leaving = null;
      this.flyTo(this.restingCam(), instant);
    } else if (this.active === null) {
      this.flyTo(this.home, instant, undefined, 1300);
    }
  }

  private restingCam(): Camera {
    return this.intro ? { ...this.home, z: this.home.z * 0.84 } : { ...this.home };
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
    if (this.active !== null && !this.tween) this.cam = this.worldCam(this.active);
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
  }

  /** Inside a world, keep the island clear of the panel: left of it on desktop, above it on phones. */
  private worldCam(index: number): Camera {
    const w = worlds[index], s = this.base() * ZW;
    // Phones: the island sits in the space between the top bar and the bottom sheet, leaving room for pins above it.
    if (this.W < 768) return { x: w.at[0], y: w.at[1] + (this.H * 0.15) / s, z: ZW };
    return { x: w.at[0] + 200 / s, y: w.at[1] + 10 / s, z: ZW };
  }

  private flyTo(to: Camera, instant: boolean, onDone?: () => void, duration?: number) {
    if (instant || this.opts.reducedMotion) {
      this.cam = { ...to };
      this.tween = null;
      onDone?.();
      return;
    }
    const from = { ...this.cam };
    const hop = from.z > 2.5 && to.z > 2.5;           // world → world: arc out through space, then back in
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

  private frameFor(index: number): Frame {
    const [cx, cy] = this.toScreen(worlds[index].at);
    const u = this.base() * this.cam.z * 0.0166;
    const bob = this.opts.reducedMotion ? 0 : Math.sin(this.time * 0.8 + index * 1.7) * u * 0.25;
    return { cx, cy, u, oy: u * 1.2 - bob };
  }

  // ----- the loop -----

  private frame = (now: number) => {
    this.step(now);
    this.time = this.opts.reducedMotion ? 0 : (now - this.t0) / 1000;
    const fadeTo = this.intro ? 0 : 1;
    this.labelFade = this.opts.reducedMotion ? fadeTo : this.labelFade + (fadeTo - this.labelFade) * 0.06;
    this.hover = this.tween || this.intro ? null : this.pick(this.mouse.x, this.mouse.y);
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
    sky.addColorStop(0, "#1c3270");
    sky.addColorStop(0.42, "#12224f");
    sky.addColorStop(1, "#0a1430");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    this.drawStars();
    this.drawPlanet(d);
    this.drawOrbits(d);

    // the worlds: tiny islands far away, full scenes up close
    const hot = this.hotObject(), narrow = W < 600;
    const labelScale = clamp((this.base() * this.cam.z) / 340, 0.8, 1.05);
    worlds.forEach((w, i) => {
      const a = this.active === i ? 1 : i === this.leaving ? Math.max(1 - d, lf) : 1 - d;
      if (a < 0.02) return;
      const X = this.frameFor(i);
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
      n.sx = x; n.sy = y; n.alpha = a;
      if (a < 0.02) continue;
      const dim = this.matches.size && !this.matches.has(n.id) ? 0.25 : 1;
      this.glow(x, y, r, n.color, a * dim, this.matches.has(n.id) || n === hn);
      // Skill names: always shown faintly (not on phones, where the map is too small), brighter on hover or a match.
      const lit = n === hn || this.matches.has(n.id);
      if (n.world === null && d < 0.3 && (lit || !narrow)) {
        ctx.globalAlpha = (lit ? 0.9 : 0.5 * dim) * (1 - d / 0.3) * this.labelFade;
        ctx.fillStyle = SKILL;
        ctx.font = `400 10px ${this.opts.fonts.mono}`;
        ctx.fillText(n.name, x + 7, y + 3.5);
        ctx.globalAlpha = 1;
      }
    }
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

  /** A sunlit planet in the corner, far away, so it barely moves with the camera. */
  private drawPlanet(d: number) {
    const { ctx, W, H } = this;
    const R = Math.min(W, H) * (W < 768 ? 0.15 : 0.2);
    const cx = W - R * 0.15 - this.cam.x * 12, cy = H + R * 0.3 - this.cam.y * 12;
    ctx.save();
    ctx.globalAlpha = 0.7 * (1 - d * 0.5);
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
  private drawOrbits(d: number) {
    const a = 1 - d;
    if (a < 0.02) return;
    const { ctx } = this, [ox, oy] = this.toScreen([0, 0]), s = this.base() * this.cam.z;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.lineWidth = 1.2;
    for (const o of ORBITS) {
      ctx.strokeStyle = "rgba(243,232,204,0.11)";
      ctx.setLineDash(o.dashed ? [2, 7] : []);
      ctx.beginPath(); ctx.arc(ox, oy, o.r * s, 0, Math.PI * 2); ctx.stroke();
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
      this.opts.onPress({ kind: "skill" });
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
      [code, title, text] = [`${n.kind}  z = (${n.latent[0].toFixed(2)}, ${n.latent[1].toFixed(2)})`, n.name, n.blurb];
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
