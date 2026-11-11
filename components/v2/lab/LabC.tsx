"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FlipText } from "@/components/Flip";
import { Media } from "@/components/Media";
import { Reveal } from "@/components/Reveal";
import { deal, LAB_PIECES, shared, useColumns, useReducedMotion } from "./shared";
import styles from "./LabC.module.css";

const OPEN = 460; // ms, a piece growing out of its tile
const CLOSE = 420; // ms, and going back
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)"; // the site's --ease: a strong ease-out, no overshoot
const SHRINK = 0.96; // what everything behind an open piece scales to
const FADE = 160; // ms, with reduced motion: the piece fades in and out, nothing moves
const STEP = 200; // ms, the cross-fade from one piece to the next

// The words under an open piece come out from beneath its bottom edge (Noah, Nov 8: "what if they instead slide from
// underneath card, not directly, but blur in subtly?"): each starts tucked up under the edge, out of sight, and slides
// down into place as it comes out of a soft blur, the title first, then what it is, then the line. They start as the
// piece is landing. Closing, they tuck back under first, quickly, and the piece goes home after them.
const TUCK = 14; // px up under the edge they start from
const SOFT = 4; // px of blur they resolve from
const EMERGE = { delay: 250, length: 420, gap: 45 }; // ms, opening
const REEMERGE = { delay: 60, length: 320, gap: 35 }; // ms, stepping to the next piece
const HIDE = { length: 120, gap: 12, lead: 128 }; // ms, tucking back; the piece leaves once they're all but gone
const tucked = { opacity: 0, transform: `translateY(-${TUCK}px)`, filter: `blur(${SOFT}px)` };
const PHASE: Record<number, number[]> = { 2: [0, 48], 3: [0, 88, 36] }; // px each column starts lower, so they don't line up

type Rect = { left: number; top: number; width: number; height: number };

const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

// The transform that puts a box laid out at `at` over `on` (from its top left corner)
const over = (on: Rect, at: Rect) =>
  `translate(${on.left - at.left}px, ${on.top - at.top}px) scale(${on.width / at.width}, ${on.height / at.height})`;

const scaleOf = (el: Element) => parseFloat(getComputedStyle(el).scale) || 1;

// What sits behind an open piece: the page and its footer, and the site's nav or index, whichever shows
function sceneParts() {
  const index = document.querySelector('nav[aria-label="Index"]')?.parentElement;
  const parts = [
    document.getElementById("main"),
    ...document.querySelectorAll<HTMLElement>("footer, [data-nav]"),
    ...(index ? [...index.children] : []),
  ];
  return parts.filter((el): el is HTMLElement => el instanceof HTMLElement && el.getClientRects().length > 0);
}

// Each part scales about the middle of the screen, so they all shrink together, as one
function aim(el: HTMLElement) {
  const s = scaleOf(el);
  const r = el.getBoundingClientRect();
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  el.style.transformOrigin = `${cx - (cx + (r.left - cx) / s)}px ${cy - (cy + (r.top - cy) / s)}px`;
}

// Where an element sits once everything behind is back to full size
function restingOf(el: Element): Rect {
  const main = document.getElementById("main");
  const s = main ? scaleOf(main) : 1;
  const r = el.getBoundingClientRect();
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  return { left: cx + (r.left - cx) / s, top: cy + (r.top - cy) / s, width: r.width / s, height: r.height / s };
}

// v2 lab, rendition C (Noah, Nov 8: "Maybe we just keep it static, scrollable, no titles until you click in, and when
// you do, its a simple overlay, shrinking everything else and blurring", after the craft section of bruce-cao.com).
// The pieces sit still in three loose columns on the page, with no words at all. Click one and it grows out of its
// own spot into a large frame in the middle of the screen, with its title, what it is and a line under it, while
// everything else, the page and the site's nav, shrinks a little and goes soft behind frosted paper. Click anywhere
// else, press Escape or Close, and it goes back into its spot as the page comes back. The arrow keys step to the
// piece before or after it. It's a dialog: focus goes into it and back to the piece after.
export function LabC() {
  const cols = useColumns();
  const reduced = useReducedMotion();
  const columns = useMemo(() => deal(cols, LAB_PIECES), [cols]);
  const pieces = useMemo(() => new Map(columns.flat().map((piece) => [piece.id, piece])), [columns]);
  const order = useMemo(() => [...pieces.keys()].sort((a, b) => a - b), [pieces]);
  const tiles = useRef(new Map<number, HTMLButtonElement>());
  const [shown, setShown] = useState<number | null>(null);
  const was = useRef<number | null>(null);
  const phase = useRef<"opening" | "open" | "closing" | null>(null);
  const from = useRef<Rect | null>(null); // the tile it grew from
  const first = useRef<number | null>(null); // the piece that was opened, before any stepping
  const home = useRef<Rect | null>(null); // the open frame's own place
  const backdrop = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLElement>(null);
  const frame = useRef<HTMLSpanElement>(null);
  const meta = useRef<HTMLElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const running = useRef(new Map<Element, Animation>());
  const scene = useRef<{ el: HTMLElement; origin: string }[]>([]);
  const page = useRef<{ overflow: string; gutter: string } | null>(null);
  const piece = shown === null ? null : (pieces.get(shown) ?? null);

  // One animation of ours per element at a time; a new one takes over from wherever the last one is
  const play = useCallback((el: Element | null, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    if (!el) return null;
    running.current.get(el)?.cancel();
    const animation = el.animate(keyframes, { fill: "both", ...options });
    running.current.set(el, animation);
    return animation;
  }, []);

  // The title, what it is, and the line, in that order
  const words = useCallback(() => [...(meta.current?.children ?? [])], []);

  const emerge = useCallback(
    ({ delay, length, gap }: typeof EMERGE) =>
      words().forEach((el, k) =>
        play(el, [tucked, { opacity: 1, transform: "none", filter: "blur(0px)" }], { duration: length, delay: delay + k * gap, easing: EASE }),
      ),
    [play, words],
  );

  // Nothing behind moves while a piece is open: no scrolling, by wheel, touch or keys
  const hold = useCallback((event: WheelEvent) => {
    if (!event.ctrlKey) event.preventDefault();
  }, []);

  const lock = useCallback(() => {
    const html = document.documentElement;
    page.current = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
    html.style.overflow = "hidden";
    html.style.scrollbarGutter = "stable";
    window.addEventListener("wheel", hold, { capture: true, passive: false });
    const main = document.getElementById("main");
    if (main) main.inert = true;
  }, [hold]);

  // Everything back as it was
  const restore = useCallback(() => {
    for (const animation of running.current.values()) animation.cancel();
    running.current.clear();
    for (const { el, origin } of scene.current) el.style.transformOrigin = origin;
    scene.current = [];
    const html = document.documentElement;
    if (page.current) {
      html.style.overflow = page.current.overflow;
      html.style.scrollbarGutter = page.current.gutter;
      page.current = null;
    }
    window.removeEventListener("wheel", hold, { capture: true });
    const main = document.getElementById("main");
    if (main) main.inert = false;
  }, [hold]);

  useEffect(() => restore, [restore]);

  const open = (id: number) => {
    const tile = tiles.current.get(id)?.firstElementChild;
    if (phase.current || !tile) return;
    from.current = rectOf(tile);
    first.current = id;
    phase.current = "opening";
    lock();
    setShown(id);
  };

  // Opening, and stepping from piece to piece, once the frame is laid out and before it's drawn
  useLayoutEffect(() => {
    const before = was.current;
    was.current = shown;
    if (shown === null || !frame.current) return;
    home.current = rectOf(frame.current);
    if (before === null) {
      dialog.current?.focus({ preventScroll: true });
      const done = () => {
        if (phase.current === "opening") phase.current = "open";
      };
      if (reduced) {
        play(figure.current, [{ opacity: 0 }, { opacity: 1 }], { duration: FADE, easing: "ease-out" })?.finished.then(done, () => {});
        return;
      }
      // The piece grows from its tile; the rest shrinks and goes soft behind the paper; its words come out from under it
      play(frame.current, [{ transform: over(from.current ?? home.current, home.current) }, { transform: "none" }], {
        duration: OPEN,
        easing: EASE,
      })?.finished.then(done, () => {});
      play(backdrop.current, [{ opacity: 0 }, { opacity: 1 }], { duration: OPEN, easing: EASE });
      emerge(EMERGE);
      play(closer.current, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, delay: 180, easing: "linear" });
      scene.current = sceneParts().map((el) => ({ el, origin: el.style.transformOrigin }));
      for (const { el } of scene.current) {
        aim(el);
        play(el, [{ scale: "1" }, { scale: String(SHRINK) }], { duration: OPEN, easing: EASE });
      }
    } else if (before !== shown) {
      // The next piece fades in over the last, and its words come out from under it again, quicker
      play(figure.current, [{ opacity: 0 }, { opacity: 1 }], { duration: STEP, easing: "ease-out" });
      if (!reduced) emerge(REEMERGE);
    }
  }, [shown, reduced, play, emerge]);

  const close = useCallback(() => {
    if (shown === null || phase.current === "closing") return;
    phase.current = "closing";
    const button = tiles.current.get(shown);
    const tile = button?.firstElementChild;
    const finish = () => {
      // The tile comes back fully in, if it was still on its way in
      for (const animation of button?.closest("[data-reveal]")?.getAnimations() ?? []) animation.finish();
      restore();
      phase.current = null;
      setShown(null);
      button?.focus({ preventScroll: true });
    };
    const fadeOut = (el: Element | null, duration: number) =>
      play(el, [{ opacity: getComputedStyle(el ?? document.body).opacity }, { opacity: 0 }], { duration, easing: "linear" });
    if (reduced || !tile || !frame.current || !home.current) {
      fadeOut(closer.current, FADE);
      fadeOut(figure.current, FADE)?.finished.then(finish, () => {});
      if (!figure.current) finish();
      return;
    }
    // Back into its tile, where the tile will rest once the page is full size again. The page stays where it was left,
    // unless the arrows stepped to a piece off the screen: then the page behind moves to it first.
    let rest = restingOf(tile);
    if (shown !== first.current && (rest.top + rest.height < 48 || rest.top > window.innerHeight - 48)) {
      const y = window.scrollY;
      window.scrollTo({ top: Math.max(0, y + rest.top + rest.height / 2 - window.innerHeight / 2), behavior: "instant" });
      // What moved with the page keeps shrinking about the middle of the screen
      const moved = window.scrollY - y;
      for (const { el } of scene.current) {
        if (getComputedStyle(el).position === "fixed") continue;
        const [x, oy] = el.style.transformOrigin.split(" ").map(parseFloat);
        el.style.transformOrigin = `${x}px ${oy + moved}px`;
      }
      rest = restingOf(tile);
    }
    // The words tuck back under the edge, the line first, then the piece goes home with everything behind it
    const list = words();
    list.forEach((el, k) => {
      const at = getComputedStyle(el);
      play(el, [{ opacity: at.opacity, transform: at.transform, filter: at.filter }, tucked], {
        duration: HIDE.length,
        delay: (list.length - 1 - k) * HIDE.gap,
        easing: "cubic-bezier(0.4, 0, 0.6, 1)",
      });
    });
    fadeOut(closer.current, HIDE.length);
    const leave = { duration: CLOSE, delay: HIDE.lead, easing: EASE };
    const now = getComputedStyle(frame.current).transform;
    play(frame.current, [{ transform: now === "none" ? "none" : now }, { transform: over(rest, home.current) }], leave)?.finished.then(
      finish,
      () => {},
    );
    play(backdrop.current, [{ opacity: getComputedStyle(backdrop.current ?? document.body).opacity }, { opacity: 0 }], leave);
    for (const { el } of scene.current) play(el, [{ scale: String(scaleOf(el)) }, { scale: "1" }], leave);
  }, [shown, reduced, play, restore, words]);

  // The piece before or after, in a quick cross-fade: the one leaving fades out where it was as the next fades in
  const step = useCallback(
    (by: number) => {
      if (shown === null || phase.current !== "open") return;
      const next = order[(order.indexOf(shown) + by + order.length) % order.length];
      const leaving = figure.current;
      if (leaving && dialog.current) {
        const r = leaving.getBoundingClientRect();
        const ghost = leaving.cloneNode(true) as HTMLElement;
        ghost.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
        ghost.setAttribute("aria-hidden", "true");
        Object.assign(ghost.style, { position: "fixed", left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, margin: "0", pointerEvents: "none" });
        dialog.current.append(ghost);
        ghost
          .animate([{ opacity: getComputedStyle(leaving).opacity }, { opacity: 0 }], { duration: STEP, easing: "ease-out", fill: "forwards" })
          .finished.then(() => ghost.remove(), () => ghost.remove());
      }
      setShown(next);
    },
    [shown, order],
  );

  // While open: Escape and Close close it, the arrows step, Tab stays inside, and the frame keeps its place on resize
  useEffect(() => {
    if (shown === null) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        step(event.key === "ArrowRight" ? 1 : -1);
      } else if (event.key === "Tab") {
        event.preventDefault();
        closer.current?.focus();
      }
    };
    const resize = () => {
      if (phase.current === "open" && frame.current) home.current = rectOf(frame.current);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
    };
  }, [shown, close, step]);

  return (
    <section className={styles.lab} aria-labelledby="lab-title">
      <h1 id="lab-title" className="visually-hidden">
        Lab
      </h1>
      <div className={styles.grid}>
        {columns.map((list, c) => (
          <ul
            key={`${cols}-${c}`}
            className={styles.column}
            style={{ "--phase": `${PHASE[cols]?.[c] ?? 0}px` } as React.CSSProperties}
          >
            {list.map((p) => (
              <li
                key={p.id}
                className={styles.item}
                data-end={p.end || undefined}
                style={{ "--scale": p.scale } as React.CSSProperties}
              >
                <Reveal>
                  <button
                    ref={(el) => {
                      if (el) tiles.current.set(p.id, el);
                      else tiles.current.delete(p.id);
                    }}
                    type="button"
                    className={styles.tile}
                    aria-label={`${p.title}, ${p.context}`}
                    aria-haspopup="dialog"
                    data-away={shown === p.id || undefined}
                    onClick={() => open(p.id)}
                  >
                    <span className={`${shared.box} ${styles.box}`} style={{ aspectRatio: p.ratio }}>
                      <Media
                        media={{ ratio: p.ratio, src: p.src, video: p.video, alt: "" }}
                        sizes="(min-width: 720px) 33vw, 50vw"
                        controls={false}
                      />
                    </span>
                  </button>
                </Reveal>
              </li>
            ))}
          </ul>
        ))}
      </div>
      {piece &&
        createPortal(
          <div
            className={styles.layer}
            // Anywhere but the piece and its words closes it
            onClick={(event) => {
              if (!(event.target as Element).closest("[data-keep]")) close();
            }}
          >
            <div ref={backdrop} className={styles.backdrop} />
            <div ref={dialog} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="lab-c-title" tabIndex={-1}>
              <figure ref={figure} className={styles.figure} data-keep style={{ "--ar": 1 / piece.tall } as React.CSSProperties}>
                <span ref={frame} className={`${shared.box} ${styles.frame}`} style={{ aspectRatio: piece.ratio }}>
                  <Media media={{ ratio: piece.ratio, src: piece.src, video: piece.video, alt: piece.title }} sizes="80vw" />
                </span>
                <figcaption ref={meta} className={styles.meta}>
                  <h2 id="lab-c-title" className={styles.title} data-text="title">
                    {piece.title}
                  </h2>
                  <p className={styles.kind} data-text="small">{piece.context}</p>
                  <p className={styles.note} data-text="small">{piece.note}</p>
                </figcaption>
              </figure>
              <button ref={closer} type="button" className={styles.close} data-text="small" onClick={close}>
                <FlipText text="Close" />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}
