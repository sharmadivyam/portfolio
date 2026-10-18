import type { WorldKey } from "@/data/portfolio";

// Tiny isometric dioramas, drawn in code. Each world is a 10×10 island; parts are boxes on it.

export type Frame = { cx: number; cy: number; u: number; oy: number };
export type Fonts = { display: string; mono: string };

type Point = [number, number];

type Part = {
  key?: string;
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  c: string;
  left?: string;
  right?: string;
  top?: string;
  wire?: boolean;
  /** Draw after everything else (rooftop signs). */
  late?: boolean;
  /** The item's pin sits above these parts (defaults to all of the object's parts). */
  anchor?: boolean;
  /** Explicit painter's-order key, for decals (windows, doors) that must draw just after the block they sit on. */
  order?: number;
};

type Scene = {
  ground: string;
  earth: string;
  parts: Part[];
  floor?: (X: Frame) => void;
  over?: (X: Frame) => void;
};

type PaintOptions = {
  color?: string;
  size?: number;
  weight?: number;
  mono?: boolean;
  bg?: string;
  segments?: [string, string][];
};

const C = 0.866;
const S = 0.5;
/** Extra ground around each scene's 10×10 layout grid: islands run from -PAD to 10 + PAD. */
export const PAD = 1;

// What Relay does to each request, cycling on the Junction's routing board.
const ROUTES = ["semantic cache → hit", "simple → cheap model", "complex → premium model",
  "jailbreak → blocked", "pii → redacted", "429 → fallback model"];

export function shade(hex: string, f: number) {
  if (!hex.startsWith("#")) return hex;
  const n = parseInt(hex.slice(1), 16);
  const channels = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f));
  return `rgb(${channels.join(",")})`;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// Painter's order: back to front.
const sortKey = (p: Part) => (p.late ? 100 : 0) + (p.order ?? p.x + p.w / 2 + p.y + p.d / 2 + (p.z ?? 0) * 0.01);

export function createScenes(ctx: CanvasRenderingContext2D, fonts: Fonts) {
  const P = (X: Frame, x: number, y: number, z: number): Point =>
    [X.cx + (x - y) * C * X.u, X.cy + (x + y - 10) * S * X.u - z * X.u + X.oy];

  function poly(pts: Point[], fill?: string | null, stroke?: string) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function faces(X: Frame, b: Part) {
    const { x, y, z = 0, w, d, h } = b;
    return {
      top: [P(X, x, y, z + h), P(X, x + w, y, z + h), P(X, x + w, y + d, z + h), P(X, x, y + d, z + h)],
      left: [P(X, x, y + d, z), P(X, x + w, y + d, z), P(X, x + w, y + d, z + h), P(X, x, y + d, z + h)],
      right: [P(X, x + w, y, z), P(X, x + w, y + d, z), P(X, x + w, y + d, z + h), P(X, x + w, y, z + h)],
    };
  }

  function box(X: Frame, b: Part, hot = false) {
    const f = faces(X, b);
    ctx.lineWidth = hot ? 1.5 : 1;
    if (b.wire) {
      ctx.save();
      ctx.setLineDash([3, 3]);
      for (const k of ["left", "right", "top"] as const) poly(f[k], null, hot ? "#fff8ec" : b.c);
      ctx.restore();
      return;
    }
    const edge = hot ? "rgba(255,248,236,0.95)" : "rgba(10,12,20,0.16)";
    poly(f.left, b.left ?? shade(b.c, 0.8), edge);
    poly(f.right, b.right ?? shade(b.c, 0.62), edge);
    poly(f.top, b.top ?? b.c, edge);
  }

  const quad = (X: Frame, x0: number, y0: number, x1: number, y1: number, z: number, c: string) =>
    poly([P(X, x0, y0, z), P(X, x1, y0, z), P(X, x1, y1, z), P(X, x0, y1, z)], c);

  function line(X: Frame, pts: [number, number, number][], c: string, w: number) {
    ctx.strokeStyle = c;
    ctx.lineWidth = Math.max(0.5, w * X.u);
    ctx.beginPath();
    pts.forEach(([x, y, z], k) => {
      const p = P(X, x, y, z);
      if (k) ctx.lineTo(p[0], p[1]);
      else ctx.moveTo(p[0], p[1]);
    });
    ctx.stroke();
  }

  function lamp(X: Frame, x: number, y: number, z: number, r: number, c: string, a: number) {
    const [px, py] = P(X, x, y, z), R = X.u * r * 4, ga = ctx.globalAlpha;
    const g = ctx.createRadialGradient(px, py, 0, px, py, R);
    g.addColorStop(0, c);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = ga * a;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(px, py, R, 0, 7); ctx.fill();
    ctx.fillStyle = "#fff4d6";
    ctx.beginPath(); ctx.arc(px, py, Math.max(0.6, X.u * r * 0.6), 0, 7); ctx.fill();
    ctx.globalAlpha = ga;
  }

  function label(X: Frame, text: string, x: number, y: number, z: number, color: string, size: number, weight = 500) {
    if (X.u < 6) return;
    const [px, py] = P(X, x, y, z);
    ctx.fillStyle = color;
    ctx.font = `${weight} ${X.u * size}px ${fonts.mono}`;
    ctx.textAlign = "center";
    ctx.fillText(text, px, py);
    ctx.textAlign = "start";
  }

  // Paint text onto a box face so signs read as part of the world. "left" faces the viewer's lower-left
  // (a y-plane), "right" the lower-right (an x-plane). (x, y, z) is the face's top-left corner as the viewer
  // sees it; w is the width along the face, h the height.
  function paint(X: Frame, face: "left" | "right", x: number, y: number, z: number, w: number, h: number,
    text: string | string[] | null, o: PaintOptions = {}) {
    if (X.u < 5) return;
    const k = 100;                                  // draw in 1/100 units so small fonts rasterise cleanly
    const [ox, oy] = P(X, x, y, z);
    const ex = face === "left" ? [(C * X.u) / k, (S * X.u) / k] : [(C * X.u) / k, (-S * X.u) / k];
    ctx.save();
    ctx.transform(ex[0], ex[1], 0, X.u / k, ox, oy);
    if (o.bg) { ctx.fillStyle = o.bg; ctx.fillRect(0, 0, w * k, h * k); }
    const size = (o.size ?? h * 0.6) * k;
    ctx.font = `${o.weight ?? 700} ${size}px ${o.mono ? fonts.mono : fonts.display}`;
    ctx.textBaseline = "middle";
    if (o.segments) {
      const widths = o.segments.map(([t]) => ctx.measureText(t).width);
      let cx = (w * k - widths.reduce((a, b) => a + b, 0)) / 2;
      o.segments.forEach(([t, c], i) => { ctx.fillStyle = c; ctx.fillText(t, cx, (h * k) / 2); cx += widths[i]; });
    } else if (text) {
      const lines = Array.isArray(text) ? text : [text], lh = size * 1.2;
      ctx.fillStyle = o.color ?? "#fff";
      ctx.textAlign = "center";
      lines.forEach((t, i) => ctx.fillText(t, (w * k) / 2, (h * k) / 2 + (i - (lines.length - 1) / 2) * lh));
    }
    ctx.restore();
  }

  function rails(X: Frame, [x0, y0]: Point, [x1, y1]: Point) {
    const horiz = y0 === y1, len = horiz ? x1 - x0 : y1 - y0;
    for (let s = 0; s <= len; s += 0.45) {
      const a = horiz ? [x0 + s, y0 - 0.3] : [x0 - 0.3, y0 + s], b = horiz ? [x0 + s, y0 + 0.3] : [x0 + 0.3, y0 + s];
      line(X, [[a[0], a[1], 0.01], [b[0], b[1], 0.01]], "#5a4636", 0.09);
    }
    for (const o of [-0.17, 0.17])
      line(X, horiz ? [[x0, y0 + o, 0.03], [x1, y1 + o, 0.03]] : [[x0 + o, y0, 0.03], [x1 + o, y1, 0.03]], "#d8d2c6", 0.05);
  }

  const scenes: Record<WorldKey, (t: number) => Scene> = {
    origin(t) {
      const glass = "#7aa6c9";
      const lit = "#ffd27a";
      const marble = "#f4efe6";
      const tiers = ["#c8714d", "#d07f59", "#d98f68", "#e2a17b"];
      const front = 4.0;                                 // painter's key of the house's front block: its decals sit just above it
      const parts: Part[] = [
        // Home: a two-storey Mathura house with a front terrace, a water tank and a stair-room on the roof
        { key: "house", x: 0.2, y: 0.2, w: 2.0, d: 2.6, h: 1.4, c: "#e9cfa6" },
        { key: "house", x: 2.2, y: 0.2, w: 0.6, d: 2.6, h: 1.4, c: "#e9cfa6" },
        { key: "house", x: 0.2, y: 0.2, z: 1.4, w: 2.0, d: 2.6, h: 1.2, c: "#f2dcb8", anchor: true },
        { key: "house", x: 2.74, y: 0.2, z: 1.4, w: 0.06, d: 2.6, h: 0.22, c: "#dcc097" },        // terrace parapet
        { key: "house", x: 2.8, y: 1.2, w: 0.04, d: 0.55, h: 0.9, c: "#7a3a22", right: "#7a3a22", order: front + 0.002 }, // front door
        ...[0.4, 2.05].map((y): Part => ({ key: "house", x: 2.8, y, z: 0.45, w: 0.04, d: 0.45, h: 0.5, c: lit, right: lit, order: front + 0.001 })),
        { key: "house", x: 2.2, y: 1.2, z: 1.4, w: 0.03, d: 0.5, h: 0.8, c: lit, right: lit },     // door to the terrace
        { key: "house", x: 2.2, y: 0.45, z: 1.75, w: 0.03, d: 0.4, h: 0.45, c: lit, right: lit },
        ...[0.45, 1.45].flatMap((x) => [0.45, 1.75].map((z): Part => ({ key: "house", x, y: 2.8, z, w: 0.45, d: 0.04, h: 0.5, c: lit, left: lit }))),
        { key: "house", x: 2.12, y: 0.2, z: 2.6, w: 0.08, d: 2.6, h: 0.22, c: "#dcc097", late: true },  // roof parapet
        { key: "house", x: 0.2, y: 2.72, z: 2.6, w: 2.0, d: 0.08, h: 0.22, c: "#dcc097", late: true },
        { key: "house", x: 0.3, y: 1.6, z: 2.6, w: 0.8, d: 0.9, h: 0.8, c: "#e9cfa6", late: true },     // stair-room
        { key: "house", x: 1.1, y: 1.85, z: 2.6, w: 0.03, d: 0.35, h: 0.55, c: "#6b3f2e", right: "#6b3f2e", late: true },
        { key: "house", x: 0.45, y: 0.45, z: 2.6, w: 0.65, d: 0.65, h: 0.12, c: "#9a9a9a", late: true }, // water tank
        { key: "house", x: 0.5, y: 0.5, z: 2.72, w: 0.55, d: 0.55, h: 0.55, c: "#23262f", late: true },
        { key: "house", x: 1.9, y: 0.5, z: 2.6, w: 0.06, d: 0.06, h: 1.0, c: "#3b3b46", late: true },    // TV antenna
        { key: "house", x: 1.6, y: 0.5, z: 3.5, w: 0.65, d: 0.05, h: 0.05, c: "#3b3b46", late: true },
        { key: "house", x: 3.3, y: 0.2, w: 0.1, d: 0.8, h: 0.35, c: "#dcc097" },                       // compound wall and gate
        { key: "house", x: 3.3, y: 2.0, w: 0.1, d: 1.35, h: 0.35, c: "#dcc097" },
        { key: "house", x: 0.2, y: 3.25, w: 3.1, d: 0.1, h: 0.35, c: "#dcc097" },
        ...[0.95, 1.9].map((y): Part => ({ key: "house", x: 3.28, y, w: 0.14, d: 0.14, h: 0.55, c: "#c9a77e" })),
        { key: "house", x: 2.95, y: 2.6, w: 0.25, d: 0.25, h: 0.3, c: "#b8694a" },                     // tulsi
        { key: "house", x: 2.98, y: 2.63, z: 0.3, w: 0.19, d: 0.19, h: 0.25, c: "#4f8a42" },
        { key: "line", x: 1.6, y: 0.35, z: 2.6, w: 0.06, d: 0.06, h: 0.9, c: "#7a5a44", late: true },  // rooftop clothesline
        { key: "line", x: 1.6, y: 2.6, z: 2.6, w: 0.06, d: 0.06, h: 0.9, c: "#7a5a44", late: true },
        ...[0, 1, 2, 3].map((k): Part => ({ key: "line", x: 1.61, y: 0.6 + k * 0.48, z: 2.98 - Math.sin(((k + 0.5) / 4) * Math.PI) * 0.08,
          w: 0.04, d: 0.34, h: 0.42, c: ["#f5efe4", "#f08a6b", "#7fb8ff", "#f6c85f"][k], late: true })),

        // St. Dominic's: a small convent school with a terracotta roof and a bell tower
        { key: "school", x: -0.3, y: 5.4, w: 1.4, d: 3.4, h: 1.5, c: "#efe6d6" },
        { key: "school", x: -0.4, y: 5.3, w: 1.6, d: 3.6, z: 1.5, h: 0.1, c: "#a94f33" },
        { key: "school", x: -0.15, y: 5.35, w: 1.1, d: 3.5, z: 1.6, h: 0.12, c: "#b85a3c" },
        { key: "school", x: 0.1, y: 5.4, w: 0.6, d: 3.4, z: 1.72, h: 0.1, c: "#c46a4a" },
        { key: "school", x: 0.2, y: 6.7, w: 1.1, d: 0.8, h: 2.4, c: "#f4ede0" },                       // tower
        { key: "school", x: 0.15, y: 6.65, w: 1.2, d: 0.9, z: 2.4, h: 0.12, c: "#a94f33" },
        { key: "school", x: 0.6, y: 6.95, w: 0.3, d: 0.3, z: 2.52, h: 0.3, c: "#f4ede0" },
        { key: "school", x: 1.3, y: 6.85, w: 0.04, d: 0.5, h: 0.7, c: "#6b3f2e", right: "#6b3f2e" },   // door
        { key: "school", x: 1.3, y: 6.9, z: 1.15, w: 0.04, d: 0.4, h: 0.45, c: glass, right: glass },
        { key: "school", x: 0.725, y: 7.07, z: 2.82, w: 0.06, d: 0.06, h: 0.45, c: "#f6d27a", late: true, anchor: true }, // cross
        { key: "school", x: 0.725, y: 6.98, z: 3.07, w: 0.06, d: 0.24, h: 0.06, c: "#f6d27a", late: true },
        ...[5.6, 6.1, 7.75, 8.25].flatMap((y) => [0.25, 0.85].map((z): Part => (
          { key: "school", x: 1.1, y, z, w: 0.04, d: 0.3, h: 0.4, c: glass, right: glass, order: 7.86 }))),
        ...[-0.1, 0.5].flatMap((x) => [0.25, 0.85].map((z): Part => ({ key: "school", x, y: 8.8, z, w: 0.3, d: 0.04, h: 0.4, c: glass, left: glass }))),
        { key: "school", x: 1.45, y: 9.0, w: 0.08, d: 0.08, h: 0.45, c: "#6b4a35" },                   // school board
        { key: "school", x: 2.75, y: 9.0, w: 0.08, d: 0.08, h: 0.45, c: "#6b4a35" },
        { key: "school", x: 1.35, y: 9.0, z: 0.45, w: 1.6, d: 0.06, h: 0.45, c: "#f4ede0", left: "#f4ede0" },

        // A small shikhara temple at the head of the ghat, on a red-sandstone plinth, facing the river
        { key: "temple", x: 4.4, y: 1.0, w: 1.8, d: 1.8, h: 0.4, c: "#8f4a33" },
        { key: "temple", x: 4.7, y: 1.3, z: 0.4, w: 1.2, d: 1.2, h: 1.0, c: "#f2dcc2" },
        { key: "temple", x: 5.9, y: 1.65, z: 0.4, w: 0.03, d: 0.5, h: 0.7, c: "#6e2a14", right: "#6e2a14" },
        { key: "temple", x: 5.9, y: 1.35, z: 1.2, w: 0.3, d: 1.1, h: 0.12, c: tiers[0] },
        { key: "temple", x: 6.08, y: 1.4, z: 0.4, w: 0.1, d: 0.1, h: 0.78, c: "#f2dcc2" },
        { key: "temple", x: 6.08, y: 2.3, z: 0.4, w: 0.1, d: 0.1, h: 0.78, c: "#f2dcc2" },
        { key: "temple", x: 6.2, y: 1.55, w: 0.4, d: 0.7, h: 0.2, c: "#8f4a33" },
        ...[1.1, 0.9, 0.7, 0.5].map((s, k): Part => ({ key: "temple", x: 5.3 - s / 2, y: 1.9 - s / 2,
          z: [1.4, 1.9, 2.38, 2.8][k], w: s, d: s, h: [0.5, 0.48, 0.42, 0.36][k], c: tiers[k] })),
        { key: "temple", x: 4.99, y: 1.59, z: 3.16, w: 0.62, d: 0.62, h: 0.12, c: "#f2e3cc" },          // amalaka
        { key: "temple", x: 5.22, y: 1.82, z: 3.28, w: 0.16, d: 0.16, h: 0.22, c: "#f6c85f", left: "#f6c85f", right: "#d9ab43", anchor: true }, // kalash
        { key: "temple", x: 5.28, y: 1.88, z: 3.5, w: 0.04, d: 0.04, h: 0.65, c: "#6b4a35" },

        // Vishram Ghat: steps down to the Yamuna under a white marble arch
        ...[0, 1, 2, 3].map((k): Part => ({ key: "ghat", x: 6.6 + k * 0.35, y: 0.4, w: 0.35, d: 9.8, h: 0.75 - k * 0.18, c: "#b8694a" })),
        { key: "ghat", x: 6.65, y: 6.6, z: 0.75, w: 0.22, d: 0.22, h: 1.25, c: marble },
        { key: "ghat", x: 6.65, y: 8.05, z: 0.75, w: 0.22, d: 0.22, h: 1.25, c: marble },
        { key: "ghat", x: 6.62, y: 6.55, z: 2.0, w: 0.28, d: 1.8, h: 0.42, c: marble, anchor: true },
        { key: "ghat", x: 6.68, y: 6.6, z: 2.42, w: 0.16, d: 0.16, h: 0.16, c: marble },
        { key: "ghat", x: 6.68, y: 8.14, z: 2.42, w: 0.16, d: 0.16, h: 0.16, c: marble },

        { x: 3.65, y: 4.8, w: 0.25, d: 0.25, h: 0.8, c: "#6b4a35" },                                   // neem trees
        { x: 3.25, y: 4.4, z: 0.8, w: 1.05, d: 1.05, h: 0.9, c: "#5f8a4c" },
        { x: 5.35, y: 8.75, w: 0.22, d: 0.22, h: 0.65, c: "#6b4a35" },
        { x: 5.0, y: 8.4, z: 0.65, w: 0.9, d: 0.9, h: 0.8, c: "#6a9452" },
        { x: 4.6, y: 10.4, w: 0.08, d: 0.08, h: 0.45, c: "#6b4a35" },                                   // Mathura sign
        { x: 5.9, y: 10.4, w: 0.08, d: 0.08, h: 0.45, c: "#6b4a35" },
        { x: 4.5, y: 10.4, z: 0.45, w: 1.5, d: 0.06, h: 0.45, c: "#f0e0c0", left: "#f0e0c0" },
      ];
      return {
        ground: "#c99566", earth: "#6b3f2e", parts,
        floor(X) {
          quad(X, 2.8, 0.2, 3.3, 3.25, 0.01, "#d8b98f");                                             // the yard
          quad(X, 3.4, 3.4, 6.6, 3.95, 0.01, "#b98858");                                              // the lane to the ghat
          quad(X, 1.35, 5.3, 2.9, 9.3, 0.01, "#8fae73");                                              // school lawn
          quad(X, 8.0, -1, 11, 11, 0.01, "#2c4a7c");                                                  // the Yamuna
          for (let k = 0; k < 8; k++) {
            const y = (k * 1.6 + t * 0.4) % 12 - 1, x = 8.4 + (k % 3) * 0.8;
            line(X, [[x, y, 0.02], [x + 0.6, y, 0.02]], "rgba(246,200,95,0.4)", 0.06);
          }
        },
        over(X) {
          for (let k = 0; k < 12; k++) {                                                             // aarti diyas on the river
            const y = (k * 1.07 + t * 0.22) % 12 - 1, x = 8.5 + (k % 3) * 0.85 + Math.sin(t + k) * 0.12;
            lamp(X, x, y, 0.05, 0.16, "#ffcf6b", 0.6 + 0.4 * Math.sin(t * 6 + k * 2));
          }
          lamp(X, 6.02, 1.9, 0.55, 0.11, "#ffcf6b", 0.7 + 0.3 * Math.sin(t * 7));                  // diya at the temple door
          const flag = [P(X, 5.3, 1.9, 4.13), P(X, 6.0, 1.9, 4.0 + Math.sin(t * 3) * 0.06), P(X, 5.3, 1.9, 3.84)];
          poly(flag, "#ff8f1f", "rgba(0,0,0,0.15)");                                                // saffron flag
          line(X, [[2.86, 1.15, 0.98], [2.86, 1.47, 0.86], [2.86, 1.8, 0.98]], "#f6a33a", 0.07);    // marigold toran over the door
          line(X, [[1.63, 0.38, 3.48], [1.63, 1.5, 3.38], [1.63, 2.63, 3.48]], "rgba(240,230,215,0.8)", 0.03);
          paint(X, "left", 1.35, 9.06, 0.9, 1.6, 0.45, "ST. DOMINIC'S", { color: "#8a3a22", size: 0.22 });
          paint(X, "right", 6.9, 8.35, 2.42, 1.8, 0.42, "VISHRAM GHAT", { color: "#8a4b32", size: 0.24 });
          paint(X, "left", 4.5, 10.46, 0.9, 1.5, 0.45, "MATHURA", { color: "#6b3f2e", size: 0.26, weight: 700 });
          const kites: [number, number, number, string, [number, number, number]][] = [
            [2.4 + Math.sin(t * 0.9) * 0.3, -0.2, 5.6 + Math.sin(t * 1.3) * 0.2, "#f08a6b", [1.9, 0.5, 3.6]],
            [0.2 + Math.sin(t * 0.7 + 1) * 0.25, 1.6, 6.3 + Math.sin(t * 1.1) * 0.25, "#f6c85f", [0.7, 2.05, 3.4]],
          ];
          for (const [x, y, z, c, tie] of kites) {
            const [px, py] = P(X, x, y, z), [tx, ty] = P(X, ...tie), s = X.u * 0.4;
            ctx.strokeStyle = "rgba(245,241,236,0.45)"; ctx.lineWidth = 0.8; ctx.beginPath();
            ctx.moveTo(px, py + s); ctx.quadraticCurveTo((px + tx) / 2 + s * 2, (py + ty) / 2, tx, ty); ctx.stroke();
            poly([[px, py - s], [px + s * 0.75, py], [px, py + s], [px - s * 0.75, py]], c, "rgba(0,0,0,0.25)");
          }
        },
      };
    },

    campus(t) {
      // Shiv Nadar University. Decals and rooftop parts use `order` so they draw just after the block they sit on.
      const glass = "#9fc4e8";
      const lights = (k: number) => (Math.sin(t * 2.2 + k * 1.9) > 0 ? "#f6c85f" : "#f08a6b");
      const cse = 3.4, eco = 6.8, classroom = 9.5, stage = 15.4;   // painter's keys of the main blocks
      const rally = (Math.sin(t * 1.3) + 1) / 2;                   // volleyball in play
      const crowd = ["#e9e4d8", "#b9a6f2", "#f08a6b", "#6fd3c1", "#f6c85f"];
      const parts: Part[] = [
        // Computer Science: the main building, with a clock tower
        { key: "cse", x: 0, y: 0, w: 4.2, d: 2.6, h: 2.2, c: "#ece3d3" },
        ...[0.3, 1.1, 2.95, 3.65].flatMap((x) => [0.35, 1.2].map((z): Part => (
          { key: "cse", x, y: 2.6, z, w: 0.45, d: 0.04, h: 0.5, c: glass, left: glass, order: cse + 0.001 }))),
        { key: "cse", x: 1.85, y: 2.6, w: 0.6, d: 0.04, h: 0.95, c: "#6b3f2e", left: "#6b3f2e", order: cse + 0.001 },
        ...[0.35, 1.3].flatMap((y) => [0.35, 1.2].map((z): Part => (
          { key: "cse", x: 4.2, y, z, w: 0.04, d: 0.5, h: 0.5, c: glass, right: glass, order: cse + 0.001 }))),
        { key: "cse", x: -0.05, y: -0.05, z: 2.2, w: 4.3, d: 2.7, h: 0.1, c: "#c9b99c", order: cse + 0.01 },
        { key: "cse", x: 1.6, y: 0.7, z: 2.3, w: 1.0, d: 1.0, h: 1.5, c: "#d07a55", order: cse + 0.02, anchor: true },
        { key: "cse", x: 1.85, y: 1.7, z: 2.95, w: 0.5, d: 0.04, h: 0.5, c: "#f5efe4", left: "#f5efe4", order: cse + 0.03 },
        { key: "cse", x: 1.5, y: 0.6, z: 3.8, w: 1.2, d: 1.2, h: 0.18, c: "#8a4b32", order: cse + 0.03 },

        // Economics: a small building beside it, with a rising bar chart on the roof
        { key: "eco", x: 4.8, y: 0.5, w: 1.6, d: 1.6, h: 1.2, c: "#e6d8bf" },
        ...[4.95, 5.85].map((x): Part => ({ key: "eco", x, y: 2.1, z: 0.3, w: 0.4, d: 0.04, h: 0.42, c: glass, left: glass, order: eco + 0.001 })),
        { key: "eco", x: 5.43, y: 2.1, w: 0.34, d: 0.04, h: 0.65, c: "#6b3f2e", left: "#6b3f2e", order: eco + 0.001 },
        { key: "eco", x: 4.75, y: 0.45, z: 1.2, w: 1.7, d: 1.7, h: 0.1, c: "#8a6f5a", order: eco + 0.01 },
        ...[0.4, 0.7, 1.05].map((h, k): Part => (
          { key: "eco", x: 4.95 + k * 0.48, y: 0.95, z: 1.3, w: 0.36, d: 0.36, h, c: ["#9bd67a", "#f6c85f", "#f08a6b"][k], order: eco + 0.02 + k * 0.001, anchor: k === 2 })),

        // Teaching: an open classroom with a blackboard
        { key: "teach", x: 7.2, y: -0.6, w: 3.4, d: 2.4, h: 0.2, c: "#cfc2aa" },
        { key: "teach", x: 7.4, y: -0.6, z: 0.2, w: 3.0, d: 0.12, h: 1.4, c: "#2e4a3c", left: "#2e4a3c", order: classroom + 0.01, anchor: true },
        ...[0, 1, 2].map((k): Part => ({ key: "teach", x: 7.6 + k * 1.0, y: 0.95, z: 0.2, w: 0.7, d: 0.35, h: 0.35, c: "#8a5a3c", order: classroom + 0.02 })),

        // Student Ambassador: the round table, with a standee for the AI roundtable
        { key: "ambassador", x: 4.1, y: 4.1, w: 1.3, d: 1.3, h: 0.55, c: "#7a4b35", anchor: true },
        ...[[4.52, 3.55], [4.52, 5.55], [3.55, 4.52], [5.55, 4.52]].map(([x, y]): Part => (
          { key: "ambassador", x, y, w: 0.45, d: 0.45, h: 0.35, c: "#3b4252" })),
        { key: "ambassador", x: 3.95, y: 6.6, w: 0.08, d: 0.08, h: 0.45, c: "#6b4a35" },
        { key: "ambassador", x: 5.45, y: 6.6, w: 0.08, d: 0.08, h: 0.45, c: "#6b4a35" },
        { key: "ambassador", x: 3.9, y: 6.6, z: 0.45, w: 1.65, d: 0.06, h: 0.42, c: "#b9a6f2", left: "#b9a6f2" },

        // E-Cell: a billboard at the edge of the island, facing the green, and a flyer table
        { key: "ecell", x: -0.6, y: 3.85, w: 0.1, d: 0.1, h: 0.95, c: "#6b4a35" },
        { key: "ecell", x: -0.6, y: 6.05, w: 0.1, d: 0.1, h: 0.95, c: "#6b4a35" },
        { key: "ecell", x: -0.62, y: 3.75, z: 0.95, w: 0.08, d: 2.45, h: 0.9, c: "#f08a6b", right: "#f08a6b", anchor: true },
        { key: "ecell", x: 0.2, y: 4.3, w: 0.6, d: 1.5, h: 0.55, c: "#e9e4d8" },
        ...[0, 1, 2].map((k): Part => ({ key: "ecell", x: 0.32, y: 4.42 + k * 0.45, z: 0.55, w: 0.36, d: 0.3, h: 0.04 + k * 0.03, c: ["#ffffff", "#f6c85f", "#ffffff"][k] })),

        // XCELERATE 3.0: the stage and its crowd
        { key: "xcel", x: 7.0, y: 5.4, w: 3.6, d: 2.4, h: 0.45, c: "#8a6f9e", anchor: true },
        { key: "xcel", x: 7.1, y: 5.4, z: 0.45, w: 3.4, d: 0.14, h: 1.6, c: "#2a3150", left: "#2a3150", order: stage + 0.01 },
        ...[0, 1, 2, 3, 4].map((k): Part => ({ x: 7.4 + (k % 3) * 0.9, y: 8.5 + Math.floor(k / 3) * 0.7, w: 0.3, d: 0.3,
          h: 0.55 + 0.08 * Math.sin(t * 6 + k), c: crowd[k] })),

        // Volleyball: the university team's sand court
        { key: "volley", x: 1.85, y: 7.15, w: 0.1, d: 0.1, h: 1.15, c: "#e9e4d8" },
        { key: "volley", x: 1.85, y: 10.5, w: 0.1, d: 0.1, h: 1.15, c: "#e9e4d8" },
        { key: "volley", x: 1.88, y: 7.25, z: 0.65, w: 0.04, d: 3.25, h: 0.45, c: "#f5f1ec", right: "rgba(245,241,236,0.7)", anchor: true },
        { key: "volley", x: 0.3, y: 8.6 + Math.sin(t * 1.3) * 0.45, w: 0.32, d: 0.32, h: 0.75, c: "#b9a6f2" },
        { key: "volley", x: 3.2, y: 9.0 - Math.sin(t * 1.3) * 0.45, w: 0.32, d: 0.32, h: 0.75, c: "#f6c85f" },
        { x: 0.6 + rally * 2.8, y: 8.85, z: 0.95 + Math.sin(rally * Math.PI) * 1.5, w: 0.16, d: 0.16, h: 0.16, c: "#ffffff" },

        // The campus gate
        { x: 4.75, y: 10.5, w: 0.25, d: 0.25, h: 1.5, c: "#e6d8bf" },
        { x: 7.55, y: 10.5, w: 0.25, d: 0.25, h: 1.5, c: "#e6d8bf" },
        { x: 4.65, y: 10.5, z: 1.5, w: 3.25, d: 0.25, h: 0.45, c: "#f2e8d8" },

        { x: 10.25, y: 3.6, w: 0.25, d: 0.25, h: 0.8, c: "#6b4a35" },                                // trees
        { x: 9.85, y: 3.2, z: 0.8, w: 1.0, d: 1.0, h: 0.9, c: "#5f8a4c" },
        { x: 9.75, y: 9.9, w: 0.22, d: 0.22, h: 0.7, c: "#6b4a35" },
        { x: 9.4, y: 9.55, z: 0.7, w: 0.95, d: 0.95, h: 0.85, c: "#6a9452" },
      ];
      return {
        ground: "#c9bfa6", earth: "#5c4a3a", parts,
        floor(X) {
          quad(X, -0.9, 2.75, 10.9, 3.3, 0.01, "#e2d6bd");                                           // walkway
          quad(X, 3.3, 3.5, 6.7, 7.2, 0.01, "#8fae73");                                               // the green
          quad(X, 7.0, 8.2, 10.6, 10.0, 0.01, "#8fae73");
          quad(X, -0.6, 7.2, 4.4, 10.6, 0.01, "#d9c48f");                                             // volleyball court
          line(X, [[-0.4, 7.4, 0.02], [4.2, 7.4, 0.02], [4.2, 10.4, 0.02], [-0.4, 10.4, 0.02], [-0.4, 7.4, 0.02]], "rgba(245,241,236,0.85)", 0.04);
          quad(X, 4.9, 7.3, 7.6, 10.6, 0.01, "#e2d6bd");                                              // path from the gate
        },
        over(X) {
          paint(X, "left", 0.0, 2.6, 2.15, 4.2, 0.34, "COMPUTER SCIENCE", { color: "#8a4b32", size: 0.24 });
          paint(X, "left", 4.8, 2.1, 1.18, 1.6, 0.3, "ECONOMICS", { color: "#6b3f2e", size: 0.22 });
          paint(X, "left", 7.4, -0.48, 1.55, 3.0, 1.3, ["DSA + OS", "370+ students"], { color: "rgba(245,241,236,0.9)", size: 0.26, mono: true, weight: 500 });
          paint(X, "left", 3.9, 6.66, 0.86, 1.65, 0.42, "AI ROUNDTABLE", { color: "#2a1f4a", size: 0.2 });
          paint(X, "right", -0.54, 6.2, 1.83, 2.45, 0.86, "E-CELL", { color: "#2a1414", size: 0.46 });
          paint(X, "left", 7.1, 5.54, 2.0, 3.4, 1.5, ["XCELERATE 3.0", "250+ submissions"], { color: "#f6c85f", size: 0.3 });
          paint(X, "left", 4.65, 10.75, 1.95, 3.25, 0.45, "SHIV NADAR UNIVERSITY", { color: "#8a4b32", size: 0.24 });
          for (let k = 0; k < 5; k++) lamp(X, 7.4 + k * 0.7, 5.5, 2.15, 0.14, k % 2 ? "#f08a6b" : "#f6c85f", 0.5 + 0.5 * Math.sin(t * 3 + k));
          for (let k = 0; k < 4; k++) lamp(X, 7.2, 5.6 + k * 0.6, 0.5, 0.08, lights(k), 0.7);
        },
      };
    },

    lab(t) {
      const on = (k: number) => (Math.sin(t * 4 + k * 1.3) > -0.2 ? "#f2b66d" : "#5a4a35");
      const spines = ["#f08a6b", "#f6c85f", "#6fd3c1", "#e9e4d8"];
      const parts: Part[] = [
        { x: 2.6, y: 3.0, w: 3.4, d: 1.3, h: 0.9, c: "#7a4b35" },
        { key: "monitor", x: 3.9, y: 3.2, z: 0.9, w: 0.3, d: 0.3, h: 0.25, c: "#2b2f3a" },
        { key: "monitor", x: 3.2, y: 3.25, z: 1.15, w: 1.7, d: 0.12, h: 1.0, c: "#1e2433", left: "#16223a" },
        { key: "chai", x: 5.35, y: 3.75, z: 0.9, w: 0.3, d: 0.3, h: 0.32, c: "#c46a3a" },
        { x: 3.6, y: 4.75, w: 0.8, d: 0.8, h: 0.5, c: "#3b4252" },
        { x: 3.6, y: 4.75, z: 0.5, w: 0.8, d: 0.12, h: 0.85, c: "#3b4252" },
        { key: "board", x: 6.0, y: 0.5, w: 0.12, d: 0.12, h: 0.35, c: "#6b4a35" },
        { key: "board", x: 8.9, y: 0.5, w: 0.12, d: 0.12, h: 0.35, c: "#6b4a35" },
        { key: "board", x: 5.9, y: 0.5, z: 0.35, w: 3.2, d: 0.14, h: 1.9, c: "#2e4a3c", left: "#2e4a3c" },
        { key: "shelf", x: 0.6, y: 5.4, w: 0.75, d: 3.4, h: 2.5, c: "#8a5a3c" },
        ...Array.from({ length: 16 }, (_, k): Part => ({ key: "shelf", x: 1.35, y: 5.55 + (k % 8) * 0.4, z: 0.25 + Math.floor(k / 8) * 1.15,
          w: 0.1, d: 0.3, h: 0.75 + ((k * 7) % 3) * 0.12, c: spines[k % 4] })),
        { key: "gpu", x: 7.3, y: 6.4, w: 1.4, d: 1.4, h: 2.0, c: "#23262f" },
        ...[0, 1, 2, 3, 4].map((k): Part => ({ key: "gpu", x: 7.45, y: 7.8, z: 0.3 + k * 0.33, w: 1.1, d: 0.04, h: 0.07, c: on(k), left: on(k) })),
      ];
      return {
        ground: "#b98c62", earth: "#5a3a2c", parts,
        floor(X) { for (let k = 0; k <= 10; k++) line(X, [[k, -0.9, 0.01], [k, 10.9, 0.01]], "rgba(90,58,44,0.35)", 0.03); },
        over(X) {
          const curve = Array.from({ length: 24 }, (_, k): [number, number, number] => {
            const s = k / 23;
            return [3.35 + s * 1.4, 3.38, 1.3 + 0.7 * Math.exp(-4 * s) + 0.03 * Math.sin(s * 40 + t * 3)];
          });
          line(X, curve, "#f2b66d", 0.05);
          label(X, "SMAPE 41.6", 7.5, 0.64, 1.25, "rgba(245,241,236,0.85)", 0.38);
          paint(X, "left", 3.25, 3.38, 1.34, 0.9, 0.17, "Qwen → Gemma", { color: "#9fe0ff", size: 0.1, mono: true, weight: 500 });
          for (let k = 0; k < 2; k++) {
            const s = (t * 0.5 + k * 0.5) % 1, wob = Math.sin(t * 3 + k) * 0.08;
            line(X, [[5.5, 3.9, 1.25 + s * 0.6], [5.45 + wob, 3.9, 1.45 + s * 0.6], [5.5, 3.9, 1.65 + s * 0.6]],
              `rgba(245,241,236,${(1 - s) * 0.55})`, 0.03);
          }
        },
      };
    },

    junction(t) {
      const pk = (k: number, speed: number) => (t * speed + k * 3) % 11 - 1;
      const vanX = 3.4 + (Math.sin(t * 0.35) + 1) * 2.0;
      const led = (k: number) => (Math.sin(t * 5 + k * 1.7) > 0 ? "#6fd3c1" : "#2f6b63");
      const parts: Part[] = [
        { key: "tower", x: 4.4, y: 4.4, w: 1.3, d: 1.3, h: 3.0, c: "#e8e1d6" },
        { key: "tower", x: 4.05, y: 4.05, z: 3.0, w: 2.0, d: 2.0, h: 0.85, c: "#2a3646", left: "#7fe3d0", right: "#5cc4b2" },
        { key: "tower", x: 3.95, y: 3.95, z: 3.85, w: 2.2, d: 2.2, h: 0.18, c: "#d07a55" },
        { key: "tower", x: 4.9, y: 4.9, z: 4.03, w: 0.3, d: 0.3, h: 0.3, c: "#6fd3c1", left: "#6fd3c1", right: "#6fd3c1", anchor: true },
        { key: "platA", x: 5.2, y: 1.95, w: 3.8, d: 0.9, h: 0.32, c: "#c9c1b3" },
        { key: "platA", x: 5.3, y: 2.6, z: 0.32, w: 0.12, d: 0.12, h: 0.93, c: "#8d8579" },
        { key: "platA", x: 8.8, y: 2.6, z: 0.32, w: 0.12, d: 0.12, h: 0.93, c: "#8d8579" },
        { key: "platA", x: 5.2, y: 1.95, z: 1.25, w: 3.8, d: 0.9, h: 0.12, c: "#d07a55" },
        { x: 1.95, y: 5.2, w: 0.9, d: 3.8, h: 0.32, c: "#c9c1b3" },
        { x: 2.6, y: 5.3, z: 0.32, w: 0.12, d: 0.12, h: 0.93, c: "#8d8579" },
        { x: 2.6, y: 8.8, z: 0.32, w: 0.12, d: 0.12, h: 0.93, c: "#8d8579" },
        { x: 1.95, y: 5.2, z: 1.25, w: 0.9, d: 3.8, h: 0.12, c: "#d07a55" },
        { key: "tower", x: 7.5, y: 4.9, w: 1.0, d: 1.0, h: 1.9, c: "#2b2f3a" },
        ...[0, 1, 2, 3].map((k): Part => ({ key: "tower", x: 7.6, y: 5.9, z: 0.3 + k * 0.4, w: 0.8, d: 0.04, h: 0.08, c: led(k), left: led(k) })),
        { key: "van", x: vanX, y: 8.35, w: 1.5, d: 0.8, h: 0.7, c: "#f2efe8" },
        { key: "van", x: vanX + 1.5, y: 8.35, w: 0.55, d: 0.8, h: 0.55, c: "#6fd3c1" },
        { key: "platA", x: 6.2, y: 2.75, z: 0.85, w: 1.8, d: 0.08, h: 0.4, c: "#1b1f2e", left: "#1b1f2e" },
        { x: 2.75, y: 6.2, z: 0.85, w: 0.08, d: 1.8, h: 0.4, c: "#1b1f2e", right: "#1b1f2e" },
        { x: 5.3, y: 6.92, w: 0.1, d: 0.1, h: 0.35, c: "#3b3b46" },                                  // routing board
        { x: 7.6, y: 6.92, w: 0.1, d: 0.1, h: 0.35, c: "#3b3b46" },
        { x: 5.2, y: 6.9, z: 0.35, w: 2.6, d: 0.12, h: 1.4, c: "#14181f", left: "#14181f" },
        ...[0, 1, 2].map((k): Part => ({ x: 0.4 + pk(k, 1.6), y: 1.25, z: 0.05, w: 0.32, d: 0.32, h: 0.32, c: "#6fd3c1", left: "#6fd3c1", right: "#4fb3a2" })),
        ...[0, 1, 2].map((k): Part => ({ x: 1.25, y: 0.4 + pk(k, 1.3), z: 0.05, w: 0.32, d: 0.32, h: 0.32, c: "#f6c85f", left: "#f6c85f", right: "#d9ab43" })),
      ];
      return {
        ground: "#4d6e74", earth: "#2a3846", parts,
        floor(X) {
          quad(X, 1.6, 8.2, 10.9, 9.3, 0.01, "#2f3640");
          line(X, [[1.8, 8.75, 0.02], [10.7, 8.75, 0.02]], "rgba(245,241,236,0.45)", 0.05);
          rails(X, [-0.8, 1.4], [10.8, 1.4]);
          rails(X, [1.4, -0.8], [1.4, 10.8]);
          line(X, [[1.4, 1.4, 0.03], [4.6, 4.6, 0.03]], "rgba(111,211,193,0.7)", 0.08);
        },
        over(X) {
          lamp(X, 5.05, 5.05, 4.5, 0.18, "#6fd3c1", 0.55 + 0.45 * Math.sin(t * 3));
          paint(X, "left", 4.05, 6.05, 3.85, 2.0, 0.85, "RELAY", { color: "#0f2a2a", size: 0.44 });
          paint(X, "left", 6.2, 2.83, 1.25, 1.8, 0.4, "WHAT IF?", { color: "#f6c85f", size: 0.26 });
          paint(X, "right", 2.83, 8.0, 1.25, 1.8, 0.4, "TO EXPERIENCE", { color: "#f5f1ec", size: 0.2, weight: 600 });
          paint(X, "right", 8.5, 5.9, 1.85, 1.0, 0.3, "CACHE", { color: "#c9cfe6", size: 0.2 });
          paint(X, "left", vanX, 9.15, 0.66, 1.5, 0.5, "GROOMME", { color: "#2a3646", size: 0.26 });
          const tick = Math.floor(t / 1.6);
          const rows = ROUTES.map((_, k) => ROUTES[(tick + k) % ROUTES.length]).slice(0, 3);
          paint(X, "left", 5.2, 7.02, 1.75, 2.6, 0.34, "relay ~ live routing", { color: "#6fd3c1", size: 0.15, mono: true, weight: 600 });
          paint(X, "left", 5.2, 7.02, 1.42, 2.6, 1.02, rows, { color: "#e9e4d8", size: 0.16, mono: true, weight: 500 });
        },
      };
    },

    edge(t) {
      const crates = ["#e9e4d8", "#6fd3c1", "#c46a3a", "#9bd67a"];
      const parts: Part[] = [
        { key: "belt", x: 1.0, y: 3.9, w: 6.2, d: 0.9, h: 0.55, c: "#3a3f47" },
        ...[0, 1, 2, 3].map((k): Part => ({ key: "belt", x: 1.1 + ((t * 0.8 + k * 1.5) % 5.8), y: 4.1, z: 0.55, w: 0.42, d: 0.45, h: 0.3, c: crates[k] })),
        { key: "pi", x: 4.3, y: 3.1, w: 0.18, d: 0.18, h: 2.5, c: "#d9d4c8" },
        { key: "pi", x: 4.0, y: 3.15, z: 2.5, w: 0.75, d: 0.4, h: 0.32, c: "#2b2f3a" },
        { key: "pi", x: 4.7, y: 2.4, w: 0.85, d: 0.6, h: 0.18, c: "#3c8d4f" },
        { x: 4.48, y: 3.18, z: 1.7, w: 1.1, d: 0.06, h: 0.4, c: "#f5f1ec", left: "#f5f1ec" },        // EcoBin sign
        { key: "bins", x: 2.2, y: 6.2, w: 1.1, d: 1.1, h: 1.25, c: "#3f7f4f" },
        { key: "bins", x: 3.7, y: 6.2, w: 1.1, d: 1.1, h: 1.25, c: "#2f6fae" },
        { key: "bins", x: 5.2, y: 6.2, w: 1.1, d: 1.1, h: 1.25, c: "#d4a02a" },
        { x: 8.0, y: 1.3, w: 0.25, d: 0.25, h: 0.9, c: "#6b4a35" },
        { x: 7.6, y: 0.9, z: 0.9, w: 1.05, d: 1.05, h: 1.0, c: "#4f7f42" },
        { x: 8.3, y: 7.4, w: 0.25, d: 0.25, h: 0.7, c: "#6b4a35" },
        { x: 7.95, y: 7.05, z: 0.7, w: 0.95, d: 0.95, h: 0.85, c: "#5a8f4a" },
      ];
      return {
        ground: "#6f9a5b", earth: "#3f4f32", parts,
        floor(X) { quad(X, -0.5, 3.4, 10.5, 5.3, 0.01, "#b7b2a4"); },
        over(X) {
          const a = P(X, 4.4, 3.5, 2.5), b1 = P(X, 3.4, 4.3, 0.56), b2 = P(X, 5.4, 4.6, 0.56);
          ctx.fillStyle = "rgba(155,214,122,0.14)";
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b1[0], b1[1]); ctx.lineTo(b2[0], b2[1]); ctx.closePath(); ctx.fill();
          lamp(X, 4.4, 3.55, 2.62, 0.1, "#ff6b6b", 0.5 + 0.5 * Math.sin(t * 4));
          lamp(X, 5.2, 3.0, 0.2, 0.08, "#9bd67a", 0.5 + 0.5 * Math.sin(t * 7));
          label(X, "97%", 3.0, 7.3, 1.45, "rgba(245,241,236,0.9)", 0.4, 600);
          paint(X, "left", 4.48, 3.24, 2.1, 1.1, 0.4, "ECOBIN", { color: "#3f7f4f", size: 0.26 });
        },
      };
    },

    experience(t) {
      // A market street: the back row faces the lane (Paytm's tower, Savra, Stotio); the front row shows its sides (VVDN, ZS).
      const goods = ["#f6c85f", "#f08a6b", "#9bd67a"];
      const lit = "#ffd27a";
      const teal = "#2f8f7a";
      const led = (k: number) => (Math.sin(t * 5 + k * 1.9) > 0 ? "#6fd3c1" : "#2f6b63");
      const stall = (key: string, x: number, y: number, awning: string, board: string): Part[] => [
        { key, x, y, w: 2.6, d: 1.3, h: 0.9, c: "#ece1cd" },
        { key, x: x + 0.05, y: y + 0.05, z: 0.9, w: 0.1, d: 0.1, h: 1.1, c: "#7a5a44" },
        { key, x: x + 2.45, y: y + 0.05, z: 0.9, w: 0.1, d: 0.1, h: 1.1, c: "#7a5a44" },
        ...[0, 1, 2].map((k): Part => ({ key, x: x + 0.3 + k * 0.75, y: y + 0.4, z: 0.9, w: 0.45, d: 0.45, h: 0.3 + (k % 2) * 0.15, c: goods[k] })),
        { key, x: x - 0.15, y: y - 0.1, z: 2.0, w: 2.9, d: 1.6, h: 0.16, c: awning },
        { key, x: x + 0.15, y: y + 0.55, z: 2.16, w: 2.3, d: 0.1, h: 0.7, c: board, left: board, late: true },
      ];
      const walk = (k: number) => -0.6 + ((t * 0.5 + k * 3.4) % 11.2);
      const people = ["#e9e4d8", "#6fd3c1", "#f08a6b"];
      const parts: Part[] = [
        // Paytm: the tallest building on the street, a blue glass tower on a white lobby
        { key: "paytm", x: -0.7, y: 0.3, w: 3.0, d: 3.4, h: 0.9, c: "#eef2f7" },
        { key: "paytm", x: -0.5, y: 0.5, z: 0.9, w: 2.6, d: 3.0, h: 3.3, c: "#d6e8f7", left: "#3f86d1", right: "#2d67ad" },
        ...[1.45, 2.0, 2.55, 3.1, 3.65].flatMap((z): Part[] => [
          { key: "paytm", x: -0.5, y: 3.5, z, w: 2.6, d: 0.03, h: 0.05, c: "#e8f3fd", left: "#e8f3fd", order: 2.81 },
          { key: "paytm", x: 2.1, y: 0.5, z, w: 0.03, d: 3.0, h: 0.05, c: "#e8f3fd", right: "#d4e6f8", order: 2.81 },
        ]),
        { key: "paytm", x: -0.55, y: 0.45, z: 4.2, w: 2.7, d: 3.1, h: 0.12, c: "#1d4f8f" },
        { key: "paytm", x: 0.4, y: 3.7, w: 0.9, d: 0.04, h: 0.7, c: "#9fd3f5", left: "#9fd3f5" },          // lobby doors
        { key: "paytm", x: 0.3, y: 3.7, z: 0.75, w: 1.1, d: 0.4, h: 0.08, c: "#00baf2" },                   // entrance canopy
        { key: "paytm", x: 0.0, y: 1.9, z: 4.32, w: 2.0, d: 0.14, h: 0.75, c: "#ffffff", left: "#ffffff", late: true, anchor: true },
        ...stall("stall2", 7.5, 3.0, "#e8a33d", "#1b1f2e"),

        // Savra: the biggest building on the street
        { key: "savra", x: 2.9, y: 0.4, w: 3.8, d: 3.2, h: 2.4, c: "#f1e6d2" },
        { key: "savra", x: 2.85, y: 0.35, z: 2.4, w: 3.9, d: 3.3, h: 0.1, c: "#d9c9ad" },
        { key: "savra", x: 3.15, y: 3.6, z: 0.45, w: 1.5, d: 0.04, h: 0.85, c: "#2e4a3c", left: "#2e4a3c" },   // blackboard
        { key: "savra", x: 5.0, y: 3.6, w: 0.6, d: 0.04, h: 1.0, c: "#6b3f2e", left: "#6b3f2e" },              // door
        { key: "savra", x: 5.85, y: 3.6, z: 0.35, w: 0.7, d: 0.04, h: 0.7, c: lit, left: lit },
        ...[3.2, 4.1, 5.0, 5.9].map((x): Part => ({ key: "savra", x, y: 3.6, z: 1.5, w: 0.55, d: 0.04, h: 0.55, c: lit, left: lit })),
        ...[0.8, 1.7, 2.6].flatMap((y) => [0.5, 1.5].map((z): Part => ({ key: "savra", x: 6.7, y, z, w: 0.04, d: 0.5, h: 0.5, c: lit, right: lit }))),
        { key: "savra", x: 4.85, y: 3.6, z: 1.05, w: 0.9, d: 0.45, h: 0.1, c: teal },                          // entrance canopy
        { key: "savra", x: 3.4, y: 1.8, z: 2.5, w: 2.8, d: 0.14, h: 0.95, c: teal, left: teal, late: true, anchor: true }, // rooftop sign
        { key: "savra", x: 5.2, y: 3.9, w: 1.2, d: 0.5, h: 0.55, c: "#8a5a3c" },                               // desk of question papers
        ...[0.12, 0.2, 0.28].map((h, k): Part => ({ key: "savra", x: 5.3 + k * 0.36, y: 3.98, z: 0.55, w: 0.3, d: 0.32, h, c: "#f7f3ea" })),

        // VVDN: a small engineering building with a server room
        { key: "vvdn", x: -0.4, y: 6.5, w: 2.2, d: 2.0, h: 1.5, c: "#dfe3ea" },
        { key: "vvdn", x: -0.45, y: 6.45, z: 1.5, w: 2.3, d: 2.1, h: 0.08, c: "#b9c0cc" },
        { key: "vvdn", x: 0.1, y: 6.8, z: 1.58, w: 0.5, d: 0.4, h: 0.3, c: "#c9cfd8", late: true },           // AC unit
        { key: "vvdn", x: 1.8, y: 6.9, w: 0.04, d: 0.5, h: 0.85, c: "#3b4252", right: "#3b4252" },
        { key: "vvdn", x: -0.15, y: 8.5, z: 0.2, w: 1.0, d: 0.04, h: 1.0, c: "#2b2f3a", left: "#2b2f3a" },
        ...[0, 1, 2, 3].map((k): Part => ({ key: "vvdn", x: -0.05, y: 8.54, z: 0.35 + k * 0.2, w: 0.8, d: 0.03, h: 0.06, c: led(k), left: led(k) })),
        { key: "vvdn", x: 1.0, y: 8.5, z: 0.5, w: 0.6, d: 0.04, h: 0.6, c: "#7aa6c9", left: "#7aa6c9" },

        // ZS Associates: under construction
        { key: "zs", x: 3.4, y: 6.8, w: 3.0, d: 2.4, h: 0.18, c: "#9c8f7c" },
        { key: "zs", x: 3.4, y: 6.8, z: 1.3, w: 3.0, d: 2.4, h: 0.06, c: "#c9a27e" },
        { key: "zs", x: 3.4, y: 6.8, z: 0.18, w: 3.0, d: 2.4, h: 2.4, c: "rgba(245,241,236,0.75)", wire: true },
        { key: "zs", x: 3.6, y: 9.2, z: 1.5, w: 2.6, d: 0.06, h: 0.8, c: "#f5f1ec", left: "#f5f1ec", anchor: true },
        { key: "zs", x: 6.6, y: 8.3, w: 1.2, d: 0.12, h: 0.7, c: "#f6c85f", left: "#f6c85f" },

        // A chai cart and a tree, for the street
        { x: 8.0, y: 7.3, w: 1.4, d: 0.7, h: 0.85, c: "#d9773a" },
        { x: 8.3, y: 7.45, z: 0.85, w: 0.25, d: 0.25, h: 0.25, c: "#b0b6c0" },
        { x: 9.75, y: 9.75, w: 0.22, d: 0.22, h: 0.7, c: "#6b4a35" },
        { x: 9.4, y: 9.4, z: 0.7, w: 0.95, d: 0.95, h: 0.85, c: "#5f8a4c" },
        ...[0, 1, 2].map((k): Part => ({ x: walk(k), y: 4.95 + k * 0.35, w: 0.32, d: 0.32, h: 0.7, c: people[k] })),
      ];
      const bunting = ["#f08a6b", "#f6c85f", "#6fd3c1", "#e9e4d8"];
      return {
        ground: "#c47a52", earth: "#5e3427", parts,
        floor(X) {
          for (let k = -1; k < 11; k++) for (let j = -1; j < 11; j++)
            if ((k + j) % 2) quad(X, k, j, k + 1, j + 1, 0.005, "rgba(94,52,39,0.12)");
          quad(X, -1, 4.7, 11, 5.9, 0.01, "#a86a49");                                                // the lane
        },
        over(X) {
          paint(X, "left", 0.0, 2.04, 5.07, 2.0, 0.75, null, { segments: [["Pay", "#002e6e"], ["tm", "#00baf2"]], size: 0.52 });
          paint(X, "left", 7.65, 3.65, 2.86, 2.3, 0.7, "Stotio", { color: "#e8a33d", size: 0.42 });
          paint(X, "left", 3.4, 1.94, 3.45, 2.8, 0.95, "SAVRA", { color: "#f3e8cc", size: 0.62 });
          paint(X, "left", 3.15, 3.64, 1.3, 1.5, 0.85, ["10× cheaper", "23% → 0%"], { color: "rgba(245,241,236,0.92)", size: 0.24, weight: 600 });
          paint(X, "right", 1.8, 8.4, 1.4, 1.8, 0.45, "VVDN", { color: "#1f4e8c", size: 0.32 });
          paint(X, "left", 3.6, 9.26, 2.3, 2.6, 0.8, ["ZS ASSOCIATES", "OPENING SOON"], { color: "#1b1f2e", size: 0.22 });
          paint(X, "left", 8.0, 8.0, 0.75, 1.4, 0.5, "CHAI", { color: "#fff4e0", size: 0.3 });
          label(X, "SOON", 7.2, 8.43, 0.3, "#3a2a20", 0.32, 600);
          // question papers drifting from Savra's door to the desk
          for (let k = 0; k < 3; k++) {
            const p = (t * 0.35 + k / 3) % 1;
            const x = lerp(5.3, 5.9, p), y = lerp(3.7, 4.12, p), z = 1.0 + Math.sin(p * Math.PI) * 0.55 - p * 0.15;
            ctx.globalAlpha = 1 - p * 0.6;
            quad(X, x - 0.11, y - 0.08, x + 0.11, y + 0.08, z, "#ffffff");
            ctx.globalAlpha = 1;
          }
          // steam from the chai kettle
          for (let k = 0; k < 2; k++) {
            const s = (t * 0.5 + k * 0.5) % 1, wob = Math.sin(t * 3 + k) * 0.08;
            line(X, [[8.42, 7.57, 1.15 + s * 0.6], [8.37 + wob, 7.57, 1.35 + s * 0.6], [8.42, 7.57, 1.55 + s * 0.6]], `rgba(245,241,236,${(1 - s) * 0.55})`, 0.03);
          }
          // bunting in front of the Stotio stall (kept clear of the facades)
          for (const [x0, x1] of [[7.4, 10.3]]) {
            const pts = Array.from({ length: 6 }, (_, k): [number, number, number] => {
              const s = k / 5;
              return [x0 + s * (x1 - x0), 4.55, 2.15 - Math.sin(s * Math.PI) * 0.25];
            });
            line(X, pts, "rgba(245,241,236,0.7)", 0.025);
            pts.slice(0, -1).forEach(([x, y, z], k) => {
              const p = P(X, x + (x1 - x0) / 10, y, z), s = X.u * 0.22;
              poly([[p[0] - s, p[1]], [p[0] + s, p[1]], [p[0], p[1] + s * 1.6]], bunting[k % 4]);
            });
          }
        },
      };
    },

    "off-duty"(t) {
      const s = (Math.sin(t * 1.5) + 1) / 2;                       // badminton rally
      const ball = (t * 0.45) % 1;                                  // cricket delivery
      const tv = ["#7fb8ff", "#b9a6f2", "#f6c85f", "#6fd3c1"][Math.floor(t * 0.7) % 4];
      const jars = ["#d4a02a", "#c4452f", "#6f9a5b"];
      const parts: Part[] = [
        { key: "court", x: 2.45, y: 0.55, w: 0.1, d: 0.1, h: 0.95, c: "#e9e4d8" },
        { key: "court", x: 2.45, y: 3.0, w: 0.1, d: 0.1, h: 0.95, c: "#e9e4d8" },
        { key: "court", x: 2.48, y: 0.65, z: 0.5, w: 0.04, d: 2.35, h: 0.42, c: "#f5f1ec", right: "rgba(245,241,236,0.7)" },
        { key: "court", x: 0.9, y: 1.55 + Math.sin(t * 1.5) * 0.35, w: 0.32, d: 0.32, h: 0.7, c: "#7fb8ff" },
        { key: "court", x: 3.9, y: 1.75 - Math.sin(t * 1.5) * 0.35, w: 0.32, d: 0.32, h: 0.7, c: "#f08a6b" },
        { x: 1.25 + s * 2.6, y: 1.8, z: 0.8 + Math.sin(s * Math.PI) * 1.2, w: 0.12, d: 0.12, h: 0.12, c: "#ffffff" },
        ...[1.45, 1.62, 1.79].flatMap((y): Part[] => [
          { key: "pitch", x: 5.7, y, w: 0.07, d: 0.07, h: 0.7, c: "#f2e3c2" },
          { key: "pitch", x: 8.7, y, w: 0.07, d: 0.07, h: 0.7, c: "#f2e3c2" },
        ]),
        { key: "pitch", x: 5.1, y: 1.5, w: 0.32, d: 0.32, h: 0.75, c: "#9bd67a" },
        { key: "pitch", x: 8.95, y: 1.9, w: 0.32, d: 0.32, h: 0.75, c: "#f5f1ec" },
        { key: "pitch", x: 8.85, y: 2.25, z: 0.15, w: 0.1, d: 0.12, h: 0.7, c: "#d9b27a" },
        { x: 5.9 + ball * 2.7, y: 1.62, z: 0.08 + Math.abs(Math.sin(ball * Math.PI * 1.4)) * 0.55, w: 0.1, d: 0.1, h: 0.1, c: "#d64545" },
        { key: "cinema", x: 0.8, y: 4.7, w: 0.1, d: 0.1, h: 0.4, c: "#3b3b46" },
        { key: "cinema", x: 0.8, y: 7.2, w: 0.1, d: 0.1, h: 0.4, c: "#3b3b46" },
        { key: "cinema", x: 0.75, y: 4.6, z: 0.4, w: 0.12, d: 2.8, h: 1.5, c: "#1e2433", right: tv },
        { key: "cinema", x: 2.4, y: 4.9, w: 0.85, d: 2.2, h: 0.45, c: "#d9773a" },
        { key: "cinema", x: 3.05, y: 4.9, z: 0.45, w: 0.2, d: 2.2, h: 0.5, c: "#c4672f" },
        { key: "cinema", x: 2.4, y: 4.75, w: 0.85, d: 0.15, h: 0.65, c: "#c4672f" },
        { key: "cinema", x: 2.4, y: 7.1, w: 0.85, d: 0.15, h: 0.65, c: "#c4672f" },
        { key: "mic", x: 5.3, y: 5.5, w: 0.08, d: 0.08, h: 1.3, c: "#3b3b46" },
        { key: "mic", x: 5.24, y: 5.44, z: 1.3, w: 0.2, d: 0.2, h: 0.24, c: "#23262f" },
        { key: "mic", x: 6.0, y: 5.7, w: 0.65, d: 0.6, h: 0.95, c: "#23262f" },
        { key: "kitchen", x: 5.0, y: 8.3, w: 3.4, d: 0.95, h: 0.9, c: "#e9dcc6" },
        { key: "kitchen", x: 5.6, y: 8.35, z: 0.9, w: 1.0, d: 0.85, h: 0.06, c: "#2b2f3a" },
        { key: "kitchen", x: 5.85, y: 8.55, z: 0.96, w: 0.45, d: 0.45, h: 0.4, c: "#b0b6c0" },
        ...[0, 1, 2].map((k): Part => ({ key: "kitchen", x: 7.1 + k * 0.32, y: 8.6, z: 0.9, w: 0.2, d: 0.2, h: 0.25, c: jars[k] })),
      ];
      return {
        ground: "#d8c09a", earth: "#6b4e36", parts,
        floor(X) {
          quad(X, 0.5, 0.5, 4.5, 3.1, 0.01, "#3f7a6a");
          line(X, [[0.6, 0.6, 0.02], [4.4, 0.6, 0.02], [4.4, 3.0, 0.02], [0.6, 3.0, 0.02], [0.6, 0.6, 0.02]], "rgba(245,241,236,0.8)", 0.04);
          quad(X, 4.8, 0.3, 9.7, 3.3, 0.01, "#7fa65a");
          quad(X, 5.2, 1.15, 9.3, 2.1, 0.015, "#d9c48f");
          quad(X, 2.0, 4.5, 3.6, 7.6, 0.01, "#b9805a");
        },
        over(X) {
          lamp(X, 6.07, 8.77, 0.93, 0.12, "#ff9a3c", 0.6 + 0.4 * Math.sin(t * 9));
          for (let k = 0; k < 2; k++) {
            const p = (t * 0.5 + k * 0.5) % 1, wob = Math.sin(t * 3 + k) * 0.08;
            line(X, [[6.07, 8.77, 1.4 + p * 0.6], [6.02 + wob, 8.77, 1.6 + p * 0.6], [6.07, 8.77, 1.8 + p * 0.6]],
              `rgba(245,241,236,${(1 - p) * 0.55})`, 0.03);
          }
          for (let k = 0; k < 3; k++) {
            const p = (t * 0.35 + k / 3) % 1;
            label(X, k % 2 ? "♫" : "♪", 5.4 + Math.sin(t + k) * 0.25 + p * 0.4, 5.5, 1.8 + p * 1.4, `rgba(185,166,242,${1 - p})`, 0.6, 600);
          }
        },
      };
    },
  };

  return {
    /** Draw one world island. `depth` is how far the camera has dived into it (0–1). */
    draw(key: WorldKey, X: Frame, alpha: number, t: number, depth: number, color: string, hot: string | null) {
      const sc = scenes[key](t);
      ctx.save();
      ctx.globalAlpha = alpha;
      const [gx, gy] = P(X, 5, 5, -1.5), R = X.u * (11 + PAD * 2);
      const aura = ctx.createRadialGradient(gx, gy, 0, gx, gy, R);
      aura.addColorStop(0, color + "33");
      aura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aura;
      ctx.beginPath(); ctx.arc(gx, gy, R, 0, 7); ctx.fill();
      const size = 10 + PAD * 2, inset = size * 0.12;
      box(X, { x: -PAD + inset, y: -PAD + inset, z: -2.7, w: size - inset * 2, d: size - inset * 2, h: 1.8, c: shade(sc.earth, 0.75) });
      box(X, { x: -PAD, y: -PAD, w: size, d: size, z: -1, h: 1, c: sc.earth, top: sc.ground });
      sc.floor?.(X);
      for (const p of [...sc.parts].sort((a, b) => sortKey(a) - sortKey(b)))
        box(X, p, Boolean(hot && p.key === hot && depth > 0.85));
      sc.over?.(X);
      ctx.restore();
    },

    /** Screen point just above the object an item lives on. */
    anchor(key: WorldKey, X: Frame, object: string, t: number): Point | null {
      const all = scenes[key](t).parts.filter((p) => p.key === object);
      const marked = all.filter((p) => p.anchor);
      const parts = marked.length ? marked : all;
      if (!parts.length) return null;
      const x0 = Math.min(...parts.map((p) => p.x)), x1 = Math.max(...parts.map((p) => p.x + p.w));
      const y0 = Math.min(...parts.map((p) => p.y)), y1 = Math.max(...parts.map((p) => p.y + p.d));
      const top = Math.max(...parts.map((p) => (p.z ?? 0) + p.h));
      return P(X, (x0 + x1) / 2, (y0 + y1) / 2, top + 0.7);
    },

    /** The front-most object under the pointer, if any. */
    hit(key: WorldKey, X: Frame, mx: number, my: number, t: number): string | null {
      let best: Part | null = null, bestK = -Infinity;
      for (const p of scenes[key](t).parts) {
        if (!p.key) continue;
        const f = faces(X, p), pts = [...f.top, ...f.left, ...f.right];
        const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
        if (mx < Math.min(...xs) - 4 || mx > Math.max(...xs) + 4 || my < Math.min(...ys) - 4 || my > Math.max(...ys) + 4) continue;
        if (sortKey(p) > bestK) { bestK = sortKey(p); best = p; }
      }
      return best?.key ?? null;
    },
  };
}
