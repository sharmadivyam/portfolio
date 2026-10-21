"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getItem, itemsIn, profile, shortName, worldPath, worlds, type Item } from "@/data/portfolio";
import { onFirstPage, PLACE_KEY } from "@/components/back-to-map";
import { LatentSpaceEngine, SKY, type EngineState, type SafeArea } from "./engine";
import { search as searchMap, type Hit } from "./search";

const TOUR_MS = 8000;
const INITIAL: EngineState = { active: null, selectedId: null, inWorld: false, pinsVisible: false };
// The canvas's sky as CSS, so the page is already the right blue before the first frame is drawn.
const SKY_CSS = `radial-gradient(circle 85vmax at 42% 55%, ${SKY.map(([stop, color]) => `${color} ${stop * 100}%`).join(", ")})`;

const press = "transition duration-150 ease-out hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5";
const shadow = "shadow-[3px_3px_0_#050b1c] hover:shadow-[4px_4px_0_#050b1c] active:shadow-[1px_1px_0_#050b1c]";
const barButton = `inline-flex items-center rounded-[10px] border-2 border-cream px-2.5 pb-[7px] pt-2 font-display text-[13px] font-bold uppercase leading-none tracking-[0.05em] md:px-3.5 md:text-[14px] ${shadow} ${press}`;
const textLink = "font-display text-base font-semibold text-cream underline decoration-carrot decoration-[3px] underline-offset-[5px] transition hover:text-sunshine";
const smallButton = "rounded-[10px] border-2 border-cream/30 px-3 py-2 font-display text-[14px] font-semibold text-cream transition hover:border-cream";
const tourButton = "rounded-full border-2 border-night/20 px-3 py-1.5 font-display text-[14px] font-semibold transition hover:border-night";
const keycap = "rounded-[5px] border border-cream/30 px-1.5 py-px font-terminal text-[11px] text-cream";
const hintPill = "flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full border border-cream/20 bg-night-card/85 px-4 py-2 text-center font-terminal text-[12px] text-cream-muted shadow-[2px_2px_0_#050b1c] backdrop-blur-sm motion-safe:animate-hint-in";
const hintLink = "text-cream underline decoration-carrot decoration-2 underline-offset-4 transition hover:text-sunshine";

// First-visit hints, one quiet line at a time: step into a world, then open a story. Remembered per browser.
type HintStep = "world" | "place" | "done";
const HINT_KEY = "latent-space:hints";

function readHint(): HintStep {
  try {
    const step = localStorage.getItem(HINT_KEY);
    return step === "place" || step === "done" ? step : "world";
  } catch {
    return "world";
  }
}

// Set once the map has been shown in this tab. Coming back to it later, or arriving from another page of the site
// (Back, or a link home), restores the place in the address instead of replaying the landing; a reload starts over.
let mapShown = false;

const nextHint = (step: HintStep, s: EngineState): HintStep =>
  step !== "done" && s.selectedId ? "done" : step === "world" && s.active !== null ? "place" : step;

function Dot({ color }: { color: string }) {
  return <span aria-hidden className="size-[9px] shrink-0 rounded-full border-[1.5px] border-night" style={{ background: color }} />;
}

function Meta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-wrap gap-x-5 gap-y-1 font-terminal text-[12.5px] leading-[1.7] text-cream-muted ${className}`}>{children}</div>;
}

function ItemCard({ item, onBack, worldName }: { item: Item; onBack: () => void; worldName: string }) {
  return (
    <>
      <button type="button" onClick={onBack} className="mb-3 font-terminal text-xs text-cream-faint transition hover:text-cream">
        ← everything in {worldName.toLowerCase()}
      </button>
      <h2 className="font-display text-[23px] font-bold leading-[1.06] text-cream md:text-[27px]">{item.title ?? item.name}</h2>
      {item.context ? <p className="mt-1.5 font-display text-[15px] text-cream-muted">{item.context}</p> : null}
      <div className="mt-2.5">
        <Meta>
          <span>type <b className="font-semibold text-cream">{item.kind}</b></span>
          {item.when ? <span>when <b className="font-semibold text-cream">{item.when}</b></span> : null}
          {item.status ? <span>status <b className="font-semibold text-cream">{item.status}</b></span> : null}
        </Meta>
      </div>
      {item.bullets ? (
        <ul className="mt-4 list-disc space-y-2 pl-[18px] font-display text-base leading-[1.5] text-cream marker:text-cream-faint">
          {item.bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>
      ) : (
        <p className="mt-4 font-display text-base leading-[1.5] text-cream">{item.blurb}</p>
      )}
      {item.stack ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.stack.map((s) => (
            <span key={s} className="rounded-full border-[1.5px] border-cream/30 px-2.5 py-[5px] font-terminal text-xs lowercase text-cream">{s}</span>
          ))}
        </div>
      ) : null}
      {item.links || item.story ? (
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
          {item.links?.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className={textLink}>{l.label}</a>)}
          {item.story ? <Link href={`/projects/${item.story}`} className={textLink}>Full story →</Link> : null}
        </div>
      ) : null}
    </>
  );
}

/**
 * The home page. It opens on one star in an empty sky under your name; scrolling gathers the star into a Big Bang
 * that forms the seven worlds, and the map opens once they have settled.
 */
export function LatentSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chipRowRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LatentSpaceEngine | null>(null);
  const stateRef = useRef<EngineState>(INITIAL);
  const readyRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [state, setState] = useState<EngineState>(INITIAL);
  const [fresh] = useState(() => !mapShown && onFirstPage());
  const [intro, setIntro] = useState(fresh);
  const introRef = useRef(intro);
  // When the visitor last asked to move (a click, a key, a card): those moves become steps in the browser's history.
  const navAt = useRef(0);
  const intend = () => { navAt.current = performance.now(); };
  const [gather, setGather] = useState(0);          // Big Bang: scroll progress towards the bang
  const [banged, setBanged] = useState(false);
  const gatherRef = useRef(0);
  const [query, setQuery] = useState("");
  const [tour, setTour] = useState<{ step: number; paused: boolean } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  // "world" on the server and the client alike, so their markup matches; the stored step is read once the engine starts.
  const [hint, setHint] = useState<HintStep>("world");
  const hintRef = useRef<HintStep>("world");
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef<HTMLDivElement>(null);
  const guideButtonRef = useRef<HTMLButtonElement>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const closeGuide = useCallback(() => {
    setGuideOpen(false);
    guideButtonRef.current?.focus();
  }, []);

  // Set off the Big Bang. The UI appears when the worlds have formed (onGenesisDone).
  const enterMap = useCallback(() => {
    setBanged(true);
    engineRef.current?.bang();
  }, []);

  // A click, a tap or Enter plays the same build-up a scroll would (the star swells and trembles, the name drifts
  // away), then sets off the bang. Visitors who prefer less motion go straight to it.
  const playing = useRef(0);
  const playBang = useCallback(() => {
    if (playing.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return enterMap();
    const from = gatherRef.current, start = performance.now(), duration = 300 + 1000 * (1 - from);
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration), g = from + (1 - from) * k * k;
      gatherRef.current = g;
      engineRef.current?.setGather(g);
      setGather(g);
      if (k < 1) playing.current = requestAnimationFrame(step);
      else { playing.current = 0; enterMap(); }
    };
    playing.current = requestAnimationFrame(step);
  }, [enterMap]);

  // Never leave a build-up running behind an unmounted page.
  useEffect(() => () => cancelAnimationFrame(playing.current), []);

  const backToStart = () => {
    delete document.documentElement.dataset.deeplink;   // set by the page for shared links; it hides the landing
    setTour(null);
    setQuery("");
    setGuideOpen(false);
    setIntro(true);
    cancelAnimationFrame(playing.current);
    playing.current = 0;
    gatherRef.current = 0;
    setGather(0);
    setBanged(false);
    engineRef.current?.setGenesis(true);
  };

  // The canvas engine: created once, driven through refs so nothing re-renders per frame.
  useEffect(() => {
    const canvas = canvasRef.current, tooltip = tooltipRef.current, pins = pinsRef.current;
    if (!canvas || !tooltip || !pins) return;
    hintRef.current = readHint();
    const css = getComputedStyle(document.documentElement);
    const fonts = {
      display: css.getPropertyValue("--font-afacad").trim() || "Afacad, sans-serif",
      mono: css.getPropertyValue("--font-martian-mono").trim() || "ui-monospace, monospace",
    };
    // Free space for the overview: everything between the top bar and the controls at the bottom.
    const safeArea = (): SafeArea | null => {
      const bar = barRef.current, bottom = bottomRef.current;
      if (!bar || !bottom || stateRef.current.inWorld) return null;
      const c = canvas.getBoundingClientRect(), t = bar.getBoundingClientRect(), b = bottom.getBoundingClientRect();
      const pad = c.width < 768 ? 8 : 32;
      return { left: pad, top: t.bottom - c.top + 10, right: c.width - pad, bottom: b.top - c.top - 10 };
    };
    const engine = new LatentSpaceEngine(canvas, {
      fonts,
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      safeArea,
      tooltip,
      pins,
      onState: (s) => {
        stateRef.current = s;
        readyRef.current = true;
        setState(s);
        const next = nextHint(hintRef.current, s);
        if (next !== hintRef.current) {
          hintRef.current = next;
          setHint(next);
          try { localStorage.setItem(HINT_KEY, next); } catch { /* storage blocked: the hints simply show again next visit */ }
        }
      },
      // Any press on the map pauses a running tour.
      onPress: (p) => {
        setTour((t) => (t ? { ...t, paused: true } : t));
        if (p && p.kind !== "skill") intend();
      },
      onGenesisDone: () => setIntro(false),
    });
    engineRef.current = engine;
    engine.start();

    // A fresh visit or a reload starts with the Big Bang, except a shared link (#world=junction, #item=gateway,
    // #tour, #map), which opens straight onto the map; the page's inline script makes the same call before first
    // paint. Coming back within the tab skips the landing and restores the place in the address.
    const restoring = !fresh || "deeplink" in document.documentElement.dataset;
    mapShown = true;
    if (!restoring && window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    const params = new URLSearchParams(restoring ? window.location.hash.slice(1) : "");
    const item = params.get("item"), world = worlds.findIndex((w) => w.key === params.get("world"));
    if (item && getItem(item)) engine.openItem(item, true);
    else if (world >= 0) engine.enterWorld(world, true);
    else if (!restoring) engine.setGenesis(true);
    const frame = requestAnimationFrame(() => {
      try { sessionStorage.setItem(PLACE_KEY, window.location.hash || "#map"); } catch { /* storage blocked: "Back to the map" opens the overview */ }
      setHint(hintRef.current);
      if (restoring) setIntro(false);
      if (params.has("tour")) setTour({ step: 0, paused: false });
    });

    return () => {
      cancelAnimationFrame(frame);
      engine.destroy();
      engineRef.current = null;
    };
  }, [fresh]);

  // On the landing, scrolling (or swiping up) gathers the star; past the end it bangs and plays out on its own.
  // Enter, Space, a click or the "begin" button set it off straight away.
  useEffect(() => {
    if (!intro || banged) return;
    let touchY: number | null = null;
    const advance = (delta: number) => {
      if (playing.current) return;          // a click already set the build-up going
      gatherRef.current = Math.max(0, Math.min(1, gatherRef.current + delta));
      engineRef.current?.setGather(gatherRef.current);
      setGather(gatherRef.current);
      if (gatherRef.current >= 1) enterMap();
    };
    const onWheel = (e: WheelEvent) => advance(e.deltaY / 420);
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (touchY === null || y === undefined) return;
      advance((touchY - y) / 220);
      touchY = y;
    };
    const onKey = (e: KeyboardEvent) => {
      const onPage = e.target === document.body || e.target === document.documentElement;
      if (onPage && ["Enter", " ", "ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); playBang(); }
    };
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? null; };
    const onTouchEnd = () => { touchY = null; };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [intro, banged, enterMap, playBang]);

  // Keep the address in sync, so any world or card can be linked to. A move the visitor asked for is a new step in
  // the browser's history, so Back retraces it (a card back to its world, a world back to wherever they were);
  // moves made by the tour, by Back itself, or along the way (closing a card on the way out) replace instead.
  useEffect(() => {
    if (!readyRef.current) return;
    const key = state.active !== null ? worlds[state.active].key : null;
    const hash = key ? `#world=${key}${state.selectedId ? `&item=${state.selectedId}` : ""}` : "#map";
    if (window.location.hash !== hash && !(hash === "#map" && !window.location.hash)) {
      const asked = performance.now() - navAt.current < 2500 && !tour;
      navAt.current = 0;
      if (asked) window.history.pushState(null, "", hash);
      else window.history.replaceState(null, "", hash);
    }
    // Remembered for "Back to the map" on the other pages.
    try { sessionStorage.setItem(PLACE_KEY, hash); } catch { /* storage blocked: "Back to the map" opens the overview */ }
  }, [state.active, state.selectedId, tour]);

  // Back and Forward: take the map to the place in the address.
  useEffect(() => {
    introRef.current = intro;
  }, [intro]);
  useEffect(() => {
    const onPop = () => {
      const engine = engineRef.current;
      if (!engine || introRef.current) return;
      const params = new URLSearchParams(window.location.hash.slice(1));
      const item = params.get("item"), world = worlds.findIndex((w) => w.key === params.get("world"));
      setTour(null);
      setGuideOpen(false);
      if (item && getItem(item)) engine.openItem(item);
      else if (world >= 0 && stateRef.current.active === world) engine.clearSelection();
      else if (world >= 0) engine.enterWorld(world);
      else engine.exitToSpace();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Back in open space, re-fit the overview to the current screen.
  useEffect(() => {
    if (state.inWorld) return;
    const frame = requestAnimationFrame(() => engineRef.current?.refreshHome());
    return () => cancelAnimationFrame(frame);
  }, [state.inWorld]);

  // The 60-second tour: one stop per world.
  useEffect(() => {
    if (!tour) return;
    engineRef.current?.enterWorld(tour.step);
    if (tour.paused) return;
    const timer = setTimeout(() => {
      if (tour.step + 1 >= worlds.length) {
        setTour(null);
        engineRef.current?.exitToSpace();
        showToast("That's the tour. Click any world, or skim everything.");
      } else setTour({ step: tour.step + 1, paused: false });
    }, TOUR_MS);
    return () => clearTimeout(timer);
  }, [tour, showToast]);

  const startTour = () => setTour({ step: 0, paused: false });

  const endTour = useCallback(() => {
    setTour(null);
    engineRef.current?.exitToSpace();
  }, []);

  const nextStop = () => {
    if (!tour || tour.step + 1 >= worlds.length) endTour();
    else setTour({ step: tour.step + 1, paused: false });
  };

  // On the map: Esc steps back (closing the guide first), arrows hop between worlds, 0–6 jump straight to one.
  useEffect(() => {
    if (intro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const engine = engineRef.current;
      if (!engine) return;
      if (e.key === "Escape") {
        if (guideOpen) closeGuide();
        else if (tour) endTour();
        else if (stateRef.current.selectedId) { intend(); engine.clearSelection(); }
        else { intend(); engine.exitToSpace(); }
      } else if (e.key === "ArrowRight") { intend(); engine.hop(1); }
      else if (e.key === "ArrowLeft") { intend(); engine.hop(-1); }
      else if (/^[0-6]$/.test(e.key)) { intend(); engine.enterWorld(Number(e.key)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [intro, tour, endTour, guideOpen, closeGuide]);

  // The guide takes focus when it opens and closes on a click anywhere outside it.
  useEffect(() => {
    if (!guideOpen) return;
    guideRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!guideRef.current?.contains(target) && !guideButtonRef.current?.contains(target)) setGuideOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [guideOpen]);

  // Phones: keep the chosen place's chip scrolled into view.
  useEffect(() => {
    const row = chipRowRef.current, chip = row?.querySelector<HTMLElement>(`[data-chip="${state.selectedId}"]`);
    if (row && chip) row.scrollTo({ left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [state.selectedId]);

  const results = useMemo(() => searchMap(query), [query]);

  // Light up the strong matches on the map: places and skill stars that score close to the best result.
  useEffect(() => {
    const floor = (results[0]?.score ?? 0) * 0.35;
    engineRef.current?.setMatches(results.filter((h) => h.score >= floor).flatMap((h) =>
      h.kind === "item" ? [h.item.id] : h.kind === "skill" ? [`skill-${h.skill.name}`] : []));
  }, [results]);

  const openItem = (id: string) => {
    setTour((t) => (t ? { ...t, paused: true } : t));
    intend();
    engineRef.current?.openItem(id);
  };
  // A world flies there, a place opens its card, a skill opens the world where it was used.
  const openResult = (hit: Hit) => {
    setTour(null);
    if (hit.kind === "item") openItem(hit.item.id);
    else { intend(); engineRef.current?.enterWorld(hit.kind === "world" ? hit.index : worlds.findIndex((w) => w.key === hit.skill.world)); }
    setQuery("");
  };

  const world = state.active !== null ? worlds[state.active] : null;
  const selected = state.selectedId ? getItem(state.selectedId) : undefined;
  const compact = state.inWorld;
  const touring = tour !== null;
  const hidden = "pointer-events-none opacity-0";
  const hintsDone = hint === "done";
  const worldHint = !intro && !touring && hint === "world" && state.active === null;
  const placeHint = !intro && !touring && hint === "place" && state.inWorld && !selected;

  // The hint row takes room above the controls on a first visit; re-fit the overview when it goes.
  useEffect(() => {
    engineRef.current?.refreshHome();
  }, [hintsDone]);

  const search = (placement: "below" | "above") => (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setQuery(""); e.currentTarget.blur(); }
          if (e.key === "Enter" && results[0]) openResult(results[0]);
        }}
        placeholder="search the map…"
        aria-label="Search projects, roles and skills"
        className="w-full rounded-full border-2 border-cream/30 bg-night-card px-4 py-2.5 font-terminal text-[13px] text-cream outline-none transition placeholder:text-cream-faint focus:border-cream"
      />
      {query ? (
        <div className={`absolute z-10 rounded-2xl border-2 border-cream/30 bg-night-card p-1.5 shadow-[3px_3px_0_#050b1c] ${placement === "below" ? "right-0 top-full mt-2 w-[340px]" : "inset-x-0 bottom-full mb-2"}`}>
          {results.length ? (
            results.slice(0, 7).map((hit) => {
              const w = hit.kind === "world" ? hit.world : worlds.find((x) => x.key === (hit.kind === "item" ? hit.item.world : hit.skill.world));
              const label = hit.kind === "world" ? hit.world.name : hit.kind === "item" ? shortName(hit.item) : hit.skill.name;
              const note = hit.kind === "world" ? `world · ${hit.world.label}` : hit.kind === "skill" ? (hit.skill.world === "origin" ? "skill" : `skill · ${w?.name.toLowerCase()}`) : w?.name.toLowerCase();
              return (
                <button key={`${hit.kind}-${label}`} type="button" onClick={() => openResult(hit)}
                  className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-cream transition hover:bg-cream hover:text-night">
                  <Dot color={w?.color ?? "#f3e8cc"} />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-[16px] font-semibold leading-tight">{label}</span>
                    <small className="block truncate font-terminal text-[11px] opacity-75">{note}</small>
                  </span>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-2.5 font-terminal text-xs text-cream-muted">nothing yet. try “agents” or “sql”</p>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden text-cream" style={{ background: SKY_CSS }}>
      <a href="/skim" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-cream focus:px-4 focus:py-2 focus:font-display focus:text-night">
        Skip to the list version
      </a>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-manipulation" aria-label="A map of Divyam's work: seven worlds you can step into" role="img" />

      <div ref={pinsRef} className="pointer-events-none absolute inset-0 z-10" style={{ visibility: "hidden" }}>
        {state.pinsVisible && world
          ? itemsIn(world.key).map((item) => (
              <button
                key={item.id}
                type="button"
                data-id={item.id}
                onClick={() => openItem(item.id)}
                className={`pointer-events-auto absolute flex -translate-x-1/2 -translate-y-[calc(100%+10px)] items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-2.5 py-1 font-display text-[13px] font-semibold md:gap-2 md:px-3 md:py-1.5 md:text-[15px] shadow-[2px_2px_0_#050b1c] transition-colors ${
                  item.id === state.selectedId ? "border-cream bg-cream text-night" : "border-cream/30 bg-night-card text-cream hover:border-cream max-md:hidden"
                }`}
              >
                <Dot color={world.color} />
                {shortName(item)}
              </button>
            ))
          : null}
      </div>

      <div
        ref={tooltipRef}
        data-show="false"
        className="pointer-events-none absolute z-30 max-w-[270px] rounded-xl border border-cream/25 bg-night-card px-3.5 py-3 opacity-0 shadow-[3px_3px_0_#050b1c] transition-opacity duration-150 data-[show=true]:opacity-100"
      >
        <code data-tip="code" className="block font-terminal text-[11px] text-kiwi" />
        <b data-tip="title" className="mt-1 block font-display text-[16px] font-bold leading-tight text-cream" />
        <span data-tip="text" className="mt-1 block font-display text-[14px] leading-snug text-cream-muted" />
      </div>

      {/* Top bar: your name (back to the start), search and the main actions. Inert until the worlds have formed. */}
      <header ref={barRef} inert={intro} className={`absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-4 pt-4 transition duration-500 md:px-8 md:pt-6 ${intro ? `${hidden} -translate-y-2` : ""}`}>
        <button type="button" onClick={backToStart} className="text-left" aria-label="Back to the start">
          <span className="block font-terminal text-[11.5px] leading-[1.6] text-kiwi max-md:hidden">~/divyam</span>
          <span className="block font-display text-[19px] font-bold uppercase leading-none text-cream transition hover:text-sunshine md:text-[26px]">Divyam Sharma</span>
        </button>
        <div className="ml-auto flex items-center gap-1.5 md:gap-3.5">
          <div className="w-[260px] max-md:hidden">{search("below")}</div>
          <Link href="/skim" className={`${barButton} bg-cream text-night`}>Skim</Link>
          <button type="button" onClick={() => (touring ? endTour() : startTour())} className={`${barButton} bg-night-card text-cream`}>
            {touring ? "End tour" : "Tour"}
          </button>
          <button ref={guideButtonRef} type="button" onClick={() => setGuideOpen((open) => !open)} aria-expanded={guideOpen} aria-controls="guide"
            aria-label="How to explore" className={`${barButton} bg-night-card text-cream`}>
            ?
          </button>
          {/* Always on screen: on phones as an envelope, elsewhere spelled out */}
          <Link href="/contact" aria-label="Contact" className={`${barButton} bg-night-card text-cream`}>
            <svg aria-hidden viewBox="0 0 20 16" className="h-[13px] w-[16px] md:hidden" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <rect x="1" y="1" width="18" height="14" rx="2" /><path d="M1.5 2.5 10 9l8.5-6.5" />
            </svg>
            <span className="max-md:hidden">Contact</span>
          </Link>
          <a href={profile.links.resume} target="_blank" rel="noreferrer" className={`${textLink} max-lg:hidden`}>Resume ↗</a>
        </div>
      </header>

      {/* Bottom: search on phones, then the world chips (or the tour caption) */}
      <div ref={bottomRef} inert={intro} className={`absolute inset-x-4 bottom-4 z-20 flex flex-col gap-2.5 transition duration-500 md:inset-x-8 md:bottom-7 ${intro ? hidden : ""} ${compact && !touring ? "max-md:hidden" : ""}`}>
        {/* First visit only: one hint at a time, gone once it's been followed */}
        {!hintsDone ? (
          <div aria-live="polite" className="flex min-h-[34px] items-end justify-center">
            {worldHint ? (
              <p className={hintPill}>
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-kiwi motion-safe:animate-pulse" />
                <span className="max-md:hidden">click a world to step inside</span>
                <span className="md:hidden">tap a world to step inside</span>
                <span aria-hidden className="text-cream-faint max-md:hidden">·</span>
                <button type="button" onClick={startTour} className={hintLink}>
                  or take the <span className="max-md:hidden">60-sec </span>tour →
                </button>
              </p>
            ) : placeHint ? (
              <p className={`${hintPill} max-md:hidden`}>
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-kiwi motion-safe:animate-pulse" />
                click a pin or a building to open its story
                <span aria-hidden className="text-cream-faint">·</span>
                <span><kbd className={keycap}>←</kbd> <kbd className={keycap}>→</kbd> next world</span>
                <span aria-hidden className="text-cream-faint">·</span>
                <span><kbd className={keycap}>esc</kbd> map</span>
              </p>
            ) : null}
          </div>
        ) : null}
        <div className={`md:hidden ${touring ? "hidden" : ""}`}>{search("above")}</div>
        {touring && world ? (
          <div role="status" className="mx-auto w-full max-w-[560px] rounded-2xl bg-cream p-4 text-night shadow-[3px_3px_0_#050b1c]">
            <div className="font-terminal text-[11.5px] text-night/70">stop {tour.step + 1} of {worlds.length}&nbsp;&nbsp;{world.name.toLowerCase()}</div>
            <p className="mt-1.5 font-display text-[16px] leading-[1.45]">{world.tour}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setTour({ ...tour, paused: !tour.paused })} className={tourButton}>
                {tour.paused ? "Resume" : "Pause"}
              </button>
              <button type="button" onClick={nextStop} className={tourButton}>Next stop →</button>
              <button type="button" onClick={endTour} className={tourButton}>End tour</button>
              <span className="ml-auto flex gap-1.5">
                {worlds.map((w, i) => <i key={w.key} className={`size-1.5 rounded-full ${i === tour.step ? "bg-night" : "bg-night/20"}`} />)}
              </span>
            </div>
          </div>
        ) : (
          <nav aria-label="Worlds" className="flex gap-2.5 overflow-x-auto pb-1 md:flex-wrap md:justify-center md:overflow-visible md:pb-0">
            {worlds.map((w, i) => (
              <button
                key={w.key}
                type="button"
                onClick={() => { setTour(null); intend(); engineRef.current?.enterWorld(i); }}
                aria-current={state.active === i ? "true" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full border-2 px-3.5 py-2 font-display text-[15.5px] font-semibold transition ${
                  state.active === i ? "border-cream bg-cream text-night" : "border-cream/30 bg-night-card text-cream hover:border-cream"
                }`}
              >
                <Dot color={w.color} />
                {w.name}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* The open world. Desktop: a side panel with the world's list or a card.
          Phones: a slim sheet with the world's places as chips, so the island stays free of text; a card slides it up. */}
      <aside
        aria-hidden={!state.inWorld}
        className={`absolute bottom-4 left-4 right-4 z-20 flex flex-col rounded-[18px] border-2 border-cream/30 bg-night-card shadow-[4px_4px_0_#050b1c] transition duration-300 md:bottom-auto md:left-auto md:right-8 md:top-[100px] md:max-h-[calc(100%-200px)] md:w-[360px] ${
          selected ? "max-md:max-h-[58dvh]" : "max-md:max-h-[46dvh]"
        } ${state.inWorld && world ? "pointer-events-auto translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0"} ${touring ? "max-md:hidden" : ""}`}
      >
        {world ? (
          <>
            <div className="rounded-t-[15px] bg-cream px-4 py-[11px] font-terminal text-[12.5px] text-night">
              world {String(state.active).padStart(2, "0")}&nbsp;&nbsp;{world.label}
            </div>
            <div className="px-4 pt-3 md:hidden">
              {!selected ? (
                <>
                  <h2 className="font-display text-[24px] font-bold uppercase leading-none text-cream">{world.name}</h2>
                  <p className="mt-1.5 line-clamp-2 font-display text-[14px] leading-[1.45] text-cream-muted">{world.description}</p>
                  {placeHint ? (
                    <p aria-live="polite" className="mt-2 flex items-center gap-2 font-terminal text-[11.5px] text-cream motion-safe:animate-hint-in">
                      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-kiwi motion-safe:animate-pulse" />
                      tap a glowing dot, or a place below
                    </p>
                  ) : null}
                </>
              ) : null}
              <div
                ref={chipRowRef}
                className={`-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${selected ? "" : "mt-3"}`}
              >
                {itemsIn(world.key).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-chip={item.id}
                    aria-pressed={item.id === state.selectedId}
                    onClick={() => (item.id === state.selectedId ? (intend(), engineRef.current?.clearSelection()) : openItem(item.id))}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-display text-[14px] font-semibold transition ${
                      item.id === state.selectedId ? "border-cream bg-cream text-night" : "border-cream/30 text-cream"
                    }`}
                  >
                    <Dot color={world.color} />
                    {shortName(item)}
                  </button>
                ))}
              </div>
            </div>
            <div className={`min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-[18px] max-md:px-4 max-md:pb-4 max-md:pt-3 ${selected ? "" : "max-md:hidden"}`}>
              {selected ? (
                <ItemCard item={selected} worldName={world.name} onBack={() => { intend(); engineRef.current?.clearSelection(); }} />
              ) : (
                <>
                  <p className="font-terminal text-xs text-kiwi">{worldPath(state.active ?? 0)}</p>
                  <h2 className="mt-1 font-display text-[30px] font-bold uppercase leading-none text-cream">{world.name}</h2>
                  <p className="mt-2.5 font-display text-[15.5px] leading-[1.5] text-cream-muted">{world.description}</p>
                  <ul className="mt-4 grid gap-2">
                    {itemsIn(world.key).map((item) => (
                      <li key={item.id}>
                        <button type="button" onClick={() => openItem(item.id)}
                          className="w-full rounded-xl border-2 border-cream/20 px-3 py-2.5 text-left transition hover:border-cream">
                          <span className="block font-display text-[16px] font-semibold leading-snug text-cream">{item.title ?? item.name}</span>
                          <span className="mt-0.5 block whitespace-pre font-terminal text-[11.5px] text-cream-faint">
                            {[item.kind, item.when].filter(Boolean).join("   ")}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="flex gap-2 border-t border-cream/15 p-3 max-md:mt-3 max-md:p-2.5">
              <button type="button" onClick={() => (touring ? endTour() : (intend(), engineRef.current?.exitToSpace()))} className={`${smallButton} flex-1`}>← Map</button>
              <button type="button" onClick={() => { setTour(null); intend(); engineRef.current?.hop(1); }} className={`${smallButton} flex-1`}>Next world →</button>
            </div>
          </>
        ) : null}
      </aside>

      {/* The landing: your name above a single star; scroll (or click, or press Enter) to set off the Big Bang */}
      <section
        data-title-screen
        inert={!intro}
        onClick={(e) => { if (!(e.target as HTMLElement).closest("a, button")) playBang(); }}
        className={`absolute inset-0 z-30 cursor-pointer transition duration-700 ${intro ? "" : hidden}`}
      >
        <div
          className="absolute inset-x-0 top-0 flex flex-col items-center justify-end px-5 text-center transition-[opacity,transform] duration-500 ease-out"
          style={{ bottom: "calc(50% + 80px)", opacity: banged ? 0 : 1 - gather * 0.9, transform: `translateY(${-(banged ? 1 : gather) * 48}px)` }}
        >
          <p className="font-terminal text-[13px] leading-[1.6] text-cream-muted">
            <b className="font-medium text-kiwi">~/divyam</b>&nbsp;&nbsp;a map of my work
          </p>
          <h1 className="mt-4 font-display text-[52px] font-bold uppercase leading-[0.88] text-cream md:text-[clamp(80px,9vw,124px)]">
            <span className="block md:inline">Divyam</span> <span className="block md:inline">Sharma</span>
          </h1>
          <p className="mt-5 max-w-[600px] font-display text-[16px] font-medium leading-[1.5] text-cream md:text-[20px]">{profile.intro}</p>
        </div>
        <div
          className="absolute inset-x-0 bottom-7 flex flex-col items-center gap-3.5 px-5 text-center transition-opacity duration-500 md:bottom-9"
          style={{ opacity: banged ? 0 : 1 - gather }}
        >
          <button type="button" onClick={playBang} className="font-terminal text-[15px] text-cream transition hover:text-sunshine md:text-[16px]">
            <span className="inline-block max-md:hidden motion-safe:animate-nudge">scroll to begin&nbsp;&nbsp;↓</span>
            <span className="inline-block md:hidden motion-safe:animate-nudge-up">swipe up to begin&nbsp;&nbsp;↑</span>
          </button>
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
            <Link href="/skim" className={textLink}>Skim everything</Link>
            <a href={profile.links.resume} target="_blank" rel="noreferrer" className={textLink}>Resume ↗</a>
            <Link href="/contact" className={textLink}>Contact</Link>
          </div>
        </div>
      </section>

      {/* How to explore: opened from the ? in the top bar, any time */}
      {guideOpen ? (
        <div
          ref={guideRef}
          id="guide"
          role="dialog"
          aria-label="How to explore"
          tabIndex={-1}
          className="absolute inset-x-4 top-[68px] z-40 rounded-[18px] border-2 border-cream/30 bg-night-card shadow-[4px_4px_0_#050b1c] outline-none md:left-auto md:right-8 md:top-[86px] md:w-[380px]"
        >
          <div className="flex items-center justify-between rounded-t-[15px] bg-cream py-1.5 pl-4 pr-1.5 font-terminal text-[12.5px] text-night">
            how to explore
            <button type="button" onClick={closeGuide} aria-label="Close" className="grid size-8 place-items-center rounded-full font-display text-[20px] leading-none transition hover:bg-night/10">
              ×
            </button>
          </div>
          <dl className="grid grid-cols-[84px_1fr] gap-x-3 gap-y-3 px-4 pb-4 pt-3.5 font-display text-[15px] leading-[1.4] text-cream">
            <dt className="pt-0.5 font-terminal text-[11.5px] text-kiwi">worlds</dt>
            <dd>
              <span className="max-md:hidden">Click</span><span className="md:hidden">Tap</span> an island, or its name at the bottom, to step inside.
            </dd>
            <dt className="pt-0.5 font-terminal text-[11.5px] text-kiwi">stories</dt>
            <dd>
              <span className="max-md:hidden">Click a pin or a building to open its story.</span>
              <span className="md:hidden">Tap a dot on the island, or a place in the sheet below it.</span>
            </dd>
            <dt className="pt-0.5 font-terminal text-[11.5px] text-kiwi">moving</dt>
            <dd>
              <span className="max-md:hidden">
                <kbd className={keycap}>←</kbd> <kbd className={keycap}>→</kbd> next world, <kbd className={keycap}>0</kbd>–<kbd className={keycap}>6</kbd> jump
                to one, <kbd className={keycap}>esc</kbd> steps back.
              </span>
              <span className="md:hidden">← Map and Next world → sit under every world.</span>
            </dd>
            <dt className="pt-0.5 font-terminal text-[11.5px] text-kiwi">search</dt>
            <dd>Finds projects, roles and skills.</dd>
            <dt className="pt-0.5 font-terminal text-[11.5px] text-kiwi">in a hurry</dt>
            <dd>
              <button type="button" onClick={() => { setGuideOpen(false); startTour(); }} className={hintLink}>Take the 60-sec tour</button>, or{" "}
              <Link href="/skim" className={hintLink}>skim everything</Link> on one page.
            </dd>
          </dl>
        </div>
      ) : null}

      {toast ? (
        <div role="status" className="absolute bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-cream px-4 py-3 font-display text-[15px] font-semibold text-night shadow-[3px_3px_0_#050b1c]">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
