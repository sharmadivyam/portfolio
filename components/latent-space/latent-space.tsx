"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getItem, items, itemsIn, profile, searchText, shortName, skills, worldPath, worlds, type Item } from "@/data/portfolio";
import { LatentSpaceEngine, type EngineState, type SafeArea } from "./engine";

const TOUR_MS = 8000;
const SEARCHABLE = items.map((item) => ({ item, text: searchText(item) }));
const INITIAL: EngineState = { active: null, selectedId: null, inWorld: false, pinsVisible: false };

const press = "transition duration-150 ease-out hover:-translate-x-px hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5";
const shadow = "shadow-[3px_3px_0_#050b1c] hover:shadow-[4px_4px_0_#050b1c] active:shadow-[1px_1px_0_#050b1c]";
const bigButton = `inline-flex items-center rounded-xl border-2 border-cream px-5 pb-[13px] pt-[14px] font-display text-[15px] font-bold uppercase leading-none tracking-[0.06em] md:px-6 md:text-[16px] ${shadow} ${press}`;
const barButton = `inline-flex items-center rounded-[10px] border-2 border-cream px-3 pb-[7px] pt-2 font-display text-[13px] font-bold uppercase leading-none tracking-[0.05em] md:px-3.5 md:text-[14px] ${shadow} ${press}`;
const textLink = "font-display text-base font-semibold text-cream underline decoration-carrot decoration-[3px] underline-offset-[5px] transition hover:text-sunshine";
const smallButton = "rounded-[10px] border-2 border-cream/30 px-3 py-2 font-display text-[14px] font-semibold text-cream transition hover:border-cream";
const tourButton = "rounded-full border-2 border-night/20 px-3 py-1.5 font-display text-[14px] font-semibold transition hover:border-night";

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
      <h2 className="font-display text-[27px] font-bold leading-[1.06] text-cream">{item.title ?? item.name}</h2>
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

export function LatentSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<LatentSpaceEngine | null>(null);
  const stateRef = useRef<EngineState>(INITIAL);
  const readyRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [state, setState] = useState<EngineState>(INITIAL);
  const [intro, setIntro] = useState(true);
  const [query, setQuery] = useState("");
  const [tour, setTour] = useState<{ step: number; paused: boolean } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const enterMap = useCallback(() => {
    setIntro(false);
    engineRef.current?.setIntro(false);
  }, []);

  const backToTitle = () => {
    delete document.documentElement.dataset.deeplink;   // set by the page for shared links; it hides the title screen
    setTour(null);
    setQuery("");
    setIntro(true);
    engineRef.current?.setIntro(true);
  };

  // The canvas engine: created once, driven through refs so nothing re-renders per frame.
  useEffect(() => {
    const canvas = canvasRef.current, tooltip = tooltipRef.current, pins = pinsRef.current;
    if (!canvas || !tooltip || !pins) return;
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
      },
      onPress: (p) => {
        setTour((t) => (t ? { ...t, paused: true } : t));
        if (p?.kind === "skill") showToast("Skills float between worlds. They're used everywhere.");
      },
    });
    engineRef.current = engine;
    engine.start();

    // Every visit and every refresh starts on the title screen, except a shared link opened fresh
    // (#world=junction, #item=gateway, #tour); the page's inline script makes the same call before first paint.
    const shared = "deeplink" in document.documentElement.dataset;
    if (!shared && window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    const params = new URLSearchParams(shared ? window.location.hash.slice(1) : "");
    const item = params.get("item"), world = worlds.findIndex((w) => w.key === params.get("world"));
    const deepLink = Boolean(item && getItem(item)) || world >= 0 || params.has("tour");
    if (item && getItem(item)) engine.openItem(item, true);
    else if (world >= 0) engine.enterWorld(world, true);
    else if (deepLink) engine.setIntro(false, true);
    const frame = requestAnimationFrame(() => {
      if (deepLink) setIntro(false);
      if (params.has("tour")) setTour({ step: 0, paused: false });
    });

    return () => {
      cancelAnimationFrame(frame);
      engine.destroy();
      engineRef.current = null;
    };
  }, [showToast]);

  // On the title screen, a scroll, a swipe up or Enter steps into the map.
  useEffect(() => {
    if (!intro) return;
    let touchY: number | null = null;
    const onWheel = (e: WheelEvent) => { if (e.deltaY > 8) enterMap(); };
    const onKey = (e: KeyboardEvent) => {
      const onPage = e.target === document.body || e.target === document.documentElement;
      if (onPage && ["Enter", " ", "ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); enterMap(); }
    };
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? null; };
    const onTouchEnd = (e: TouchEvent) => {
      const y = e.changedTouches[0]?.clientY;
      if (touchY !== null && y !== undefined && touchY - y > 40) enterMap();
      touchY = null;
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [intro, enterMap]);

  // Keep the address bar in sync, so any world or card can be linked to.
  useEffect(() => {
    if (!readyRef.current) return;
    const key = state.active !== null ? worlds[state.active].key : null;
    const hash = key ? `#world=${key}${state.selectedId ? `&item=${state.selectedId}` : ""}` : "";
    window.history.replaceState(null, "", hash || window.location.pathname + window.location.search);
  }, [state.active, state.selectedId]);

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

  const startTour = () => {
    setIntro(false);
    setTour({ step: 0, paused: false });
  };

  const endTour = useCallback(() => {
    setTour(null);
    engineRef.current?.exitToSpace();
  }, []);

  const nextStop = () => {
    if (!tour || tour.step + 1 >= worlds.length) endTour();
    else setTour({ step: tour.step + 1, paused: false });
  };

  // On the map: Esc steps back, arrows hop between worlds, 0–6 jump straight to one.
  useEffect(() => {
    if (intro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const engine = engineRef.current;
      if (!engine) return;
      if (e.key === "Escape") {
        if (tour) endTour();
        else if (stateRef.current.selectedId) engine.clearSelection();
        else engine.exitToSpace();
      } else if (e.key === "ArrowRight") engine.hop(1);
      else if (e.key === "ArrowLeft") engine.hop(-1);
      else if (/^[0-6]$/.test(e.key)) engine.enterWorld(Number(e.key));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [intro, tour, endTour]);

  const words = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const results = useMemo(
    () => (words.length ? SEARCHABLE.filter((s) => words.every((w) => s.text.includes(w))).map((s) => s.item) : []),
    [words],
  );

  // Light up matching items and skill stars on the map.
  useEffect(() => {
    const skillIds = words.length
      ? skills.filter((s) => words.every((w) => s.name.toLowerCase().includes(w))).map((s) => `skill-${s.name}`)
      : [];
    engineRef.current?.setMatches([...results.map((r) => r.id), ...skillIds]);
  }, [words, results]);

  const openItem = (id: string) => {
    setTour((t) => (t ? { ...t, paused: true } : t));
    engineRef.current?.openItem(id);
  };
  const openResult = (id: string) => {
    openItem(id);
    setQuery("");
  };

  const world = state.active !== null ? worlds[state.active] : null;
  const selected = state.selectedId ? getItem(state.selectedId) : undefined;
  const compact = state.inWorld;
  const touring = tour !== null;
  const hidden = "pointer-events-none opacity-0";

  const search = (placement: "below" | "above") => (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { setQuery(""); e.currentTarget.blur(); }
          if (e.key === "Enter" && results[0]) openResult(results[0].id);
        }}
        placeholder="search the map…"
        aria-label="Search projects, roles and skills"
        className="w-full rounded-full border-2 border-cream/30 bg-night-card px-4 py-2.5 font-terminal text-[13px] text-cream outline-none transition placeholder:text-cream-faint focus:border-cream"
      />
      {query ? (
        <div className={`absolute inset-x-0 z-10 rounded-2xl border-2 border-cream/30 bg-night-card p-1.5 shadow-[3px_3px_0_#050b1c] ${placement === "below" ? "top-full mt-2" : "bottom-full mb-2"}`}>
          {results.length ? (
            results.slice(0, 6).map((item) => {
              const w = worlds.find((x) => x.key === item.world);
              return (
                <button key={item.id} type="button" onClick={() => openResult(item.id)}
                  className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left font-display text-[16px] font-semibold text-cream transition hover:bg-cream hover:text-night">
                  <Dot color={w?.color ?? "#f3e8cc"} />
                  {shortName(item)}
                  <small className="ml-auto font-terminal text-xs font-normal opacity-80">{w?.name.toLowerCase()}</small>
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
    <div className="relative h-dvh w-full overflow-hidden bg-night text-cream">
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
                  item.id === state.selectedId ? "border-cream bg-cream text-night" : "border-cream/30 bg-night-card text-cream hover:border-cream"
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

      {/* Top bar: your name (back to the title screen), search and the main actions */}
      <header ref={barRef} className={`absolute inset-x-0 top-0 z-20 flex items-center gap-3 px-4 pt-4 transition duration-500 md:px-8 md:pt-6 ${intro ? `${hidden} -translate-y-2` : ""}`}>
        <button type="button" onClick={backToTitle} className="text-left" aria-label="Back to the title screen">
          <span className="block font-terminal text-[11.5px] leading-[1.6] text-kiwi max-md:hidden">~/divyam</span>
          <span className="block font-display text-[22px] font-bold uppercase leading-none text-cream transition hover:text-sunshine md:text-[26px]">Divyam Sharma</span>
        </button>
        <div className="ml-auto flex items-center gap-2.5 md:gap-3.5">
          <div className="w-[260px] max-md:hidden">{search("below")}</div>
          <Link href="/skim" className={`${barButton} bg-cream text-night`}>Skim</Link>
          <button type="button" onClick={() => (touring ? endTour() : startTour())} className={`${barButton} bg-night-card text-cream`}>
            {touring ? "End tour" : "Tour"}
          </button>
          <a href={profile.links.resume} target="_blank" rel="noreferrer" className={`${textLink} max-lg:hidden`}>Resume ↗</a>
        </div>
      </header>

      {/* Bottom: search on phones, then the world chips (or the tour caption) */}
      <div ref={bottomRef} className={`absolute inset-x-4 bottom-4 z-20 flex flex-col gap-2.5 transition duration-500 md:inset-x-8 md:bottom-7 ${intro ? hidden : ""} ${compact && !touring ? "max-md:hidden" : ""}`}>
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
                onClick={() => { setTour(null); engineRef.current?.enterWorld(i); }}
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

      {/* The open world: overview or a detail card */}
      <aside
        aria-hidden={!state.inWorld}
        className={`absolute bottom-4 left-4 right-4 z-20 flex max-h-[46dvh] flex-col rounded-[18px] border-2 border-cream/30 bg-night-card shadow-[4px_4px_0_#050b1c] transition duration-300 md:bottom-auto md:left-auto md:right-8 md:top-[100px] md:max-h-[calc(100%-200px)] md:w-[360px] ${
          state.inWorld && world ? "pointer-events-auto translate-x-0 opacity-100" : "pointer-events-none translate-x-3 opacity-0"
        } ${touring ? "max-md:hidden" : ""}`}
      >
        {world ? (
          <>
            <div className="rounded-t-[15px] bg-cream px-4 py-[11px] font-terminal text-[12.5px] text-night">
              world {String(state.active).padStart(2, "0")}&nbsp;&nbsp;{world.label}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-[18px]">
              {selected ? (
                <ItemCard item={selected} worldName={world.name} onBack={() => engineRef.current?.clearSelection()} />
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
                          <span className="mt-0.5 block font-terminal text-[11.5px] text-cream-faint">
                            {[item.kind, item.when].filter(Boolean).join("   ")}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="flex gap-2 border-t border-cream/15 p-3">
              <button type="button" onClick={() => (touring ? endTour() : engineRef.current?.exitToSpace())} className={`${smallButton} flex-1`}>← Map</button>
              <button type="button" onClick={() => { setTour(null); engineRef.current?.hop(1); }} className={`${smallButton} flex-1`}>Next world →</button>
            </div>
          </>
        ) : null}
      </aside>

      {/* Title screen: the map waits, dimmed, behind your name */}
      <div data-title-screen aria-hidden className={`pointer-events-none absolute inset-0 z-[25] bg-[radial-gradient(ellipse_at_center,rgba(10,20,48,0.86)_0%,rgba(10,20,48,0.62)_55%,rgba(10,20,48,0.4)_100%)] transition-opacity duration-700 ${intro ? "opacity-100" : "opacity-0"}`} />
      <section
        data-title-screen
        aria-hidden={!intro}
        onClick={(e) => { if (!(e.target as HTMLElement).closest("a, button")) enterMap(); }}
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center px-5 text-center transition duration-700 ${intro ? "opacity-100" : `${hidden} -translate-y-4`}`}
      >
        <p className="font-terminal text-[13px] leading-[1.6] text-cream-muted">
          <b className="font-medium text-kiwi">~/divyam</b>&nbsp;&nbsp;a map of my work
        </p>
        <h1 className="mt-4 font-display text-[56px] font-bold uppercase leading-[0.88] text-cream md:text-[clamp(84px,10vw,136px)]">
          <span className="block md:inline">Divyam</span> <span className="block md:inline">Sharma</span>
        </h1>
        <p className="mt-5 max-w-[620px] font-display text-[17px] font-medium leading-[1.5] text-cream md:text-[21px]">{profile.pitch}</p>
        <Meta className="mt-4 justify-center">
          <span>recently <mark className="rounded-[5px] bg-cream px-[7px] py-0.5 text-night">{profile.recently}</mark></span>
          <span>next <mark className="rounded-[5px] bg-cream px-[7px] py-0.5 text-night">{profile.next}</mark></span>
        </Meta>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <button type="button" onClick={enterMap} className={`${bigButton} bg-cream text-night`}>Enter the map →</button>
          <Link href="/skim" className={`${bigButton} bg-night-card text-cream`}>Skim everything</Link>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-7 gap-y-2">
          <button type="button" onClick={startTour} className={textLink}>60-sec tour</button>
          <a href={profile.links.resume} target="_blank" rel="noreferrer" className={textLink}>Resume ↗</a>
          <Link href="/contact" className={textLink}>Contact</Link>
        </div>
        <p className="absolute bottom-6 font-terminal text-[11.5px] text-cream-faint md:bottom-8">scroll or press enter to explore</p>
      </section>

      {toast ? (
        <div role="status" className="absolute bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-xl bg-cream px-4 py-3 font-display text-[15px] font-semibold text-night shadow-[3px_3px_0_#050b1c]">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
