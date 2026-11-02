"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { GlassPiece } from "@/content/site";
import styles from "./Lander.module.css";

export type Rect = { x: number; y: number; w: number; h: number };

// Anything that moves: a whole piece, or a blob of one
type Mass = {
  x: number; // top-left, in section coordinates
  y: number;
  vx: number; // px per second
  vy: number;
  w: number;
  h: number;
  m: number; // mass; a whole piece is 1
  home: boolean; // resting in its spot
  held: boolean;
};

type Body = Mass & {
  hx: number; // home, its spot in the sentence
  hy: number;
  hopping: boolean; // on its way home from an easter-egg hop, from any distance
  grabX: number; // where the pointer took hold, inside the piece
  grabY: number;
  movedAt: number; // last pointer move, ms
  downAt: number; // when the pointer took hold, ms, and where, so a quick click can be told from a drag
  downX: number;
  downY: number;
  squash: { at: number; t: number; nx: number; ny: number } | null; // flattening against what it hit, about to pop
  blobs: Blob[] | null; // popped into these
  poppedAt: number; // ms
  mend: { x: number; y: number } | null; // where the blobs are coming back together
  mendHome: boolean; // popped by the easter egg, so it comes back together in its spot
};

// A blob is soft: it stretches the way it's going, squashes when it lands,
// and wobbles back
type Blob = Mass & {
  d: number; // above 0 it's wider and shorter, below 0 narrower and taller
  dv: number;
  shrink: number; // 1, until it's nearly back with the others
};

type Lens = NonNullable<ReturnType<typeof lensMap>>;
type Look = { id: string; w: number; h: number; lens: Lens | null }; // what a blob looks like

const FRICTION = 3; // speed decays by e^-3 every second
const BOUNCE = 0.55; // energy kept when hitting another piece or an edge
const SNAP = 0.8; // released within this many piece-heights of home, it springs back
const STIFFNESS = 120; // home spring
const DAMPING = 20;
const HOP_STIFFNESS = 40; // a looser, bouncier spring for the easter-egg hop
const HOP_DAMPING = 7;
// Kandinsky's 1923 Bauhaus survey paired yellow with the triangle, red with the
// square and blue with the circle. Typing "bauhaus" turns the glass into them.
const SHAPES: Record<string, string> = { blue: "circle", red: "square", yellow: "triangle" };
const MAX_SPEED = 3500;
const POP = 1600; // px per second: hit an edge or another piece this hard and the glass pops
// With clickToPop the glass is a little more sensitive (Noah, Oct 28: "Can we make the orbs just a little more
// sensitive?"): let go this soon, this close to where it was taken, and it pops; and it pops at a softer impact
const CLICK = { ms: 320, px: 10 };
const POP_SOFT = 1250;
const CHAIN = 240; // px per second: with clickToPop, a flying piece of popped glass that hits a whole one this hard pops it
const CHAIN_REST = 2500; // ms after a piece popped before a flying piece can pop it again, so a chain ends
const SQUASH = 90; // ms it flattens against what it hit before it pops
const MEND_AFTER = 1200; // ms the blobs bounce around before they find each other again
const MEND_STIFFNESS = 60;
const MEND_DAMPING = 13;
const JELLY_STIFFNESS = 260; // how fast a blob's stretch springs back, with a wobble or two
const JELLY_DAMPING = 9;
const TINT = 250; // px per second: hit the top edge this hard, under the nav, and the nav takes the glass's color
const ZOOM = 1.75; // magnification at the heart of the glass
const PLATEAU = 0.15; // share of the radius, from the center out, that stays evenly zoomed; lower bulges more

const smooth = (x: number) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

// A displacement map for feDisplacementMap, shaped like a glass rod with
// rounded ends. Along its length it magnifies across the rod, the way a glass
// cylinder laid on a page does; the rounded ends bulge like a lens. So every
// piece reads as the same glass, however long it is. The zoom eases off toward
// the rim, where it meets the unmagnified page seamlessly.
function lensMap(w: number, h: number) {
  const cw = Math.max(24, Math.round(w / 2));
  const ch = Math.max(24, Math.round(h / 2));
  const radius = h / 2;
  const spineStart = Math.min(radius, w / 2); // the rod's center line
  const spineEnd = Math.max(w - radius, w / 2);
  const offsets = new Float32Array(cw * ch * 2);
  let max = 1;
  for (let j = 0; j < ch; j++) {
    for (let i = 0; i < cw; i++) {
      const x = ((i + 0.5) / cw) * w;
      const y = ((j + 0.5) / ch) * h;
      // Magnify around the nearest point on the center line, not the piece's middle
      const cx = Math.min(Math.max(x, spineStart), spineEnd);
      const ox = x - cx;
      const oy = y - h / 2;
      const r = Math.hypot(ox, oy) / radius; // 1 at the rim
      const ease = smooth((r - PLATEAU) / (1 - PLATEAU));
      const k = r < 1 ? (1 / ZOOM - 1) * (1 - ease) : 0; // sample inward to magnify
      const dx = ox * k;
      const dy = oy * k;
      offsets[(j * cw + i) * 2] = dx;
      offsets[(j * cw + i) * 2 + 1] = dy;
      max = Math.max(max, Math.abs(dx), Math.abs(dy));
    }
  }
  const scale = Math.ceil(max * 2) + 2;
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(cw, ch);
  for (let p = 0; p < cw * ch; p++) {
    image.data[p * 4] = Math.round((0.5 + offsets[p * 2] / scale) * 255);
    image.data[p * 4 + 1] = Math.round((0.5 + offsets[p * 2 + 1] / scale) * 255);
    image.data[p * 4 + 2] = 128;
    image.data[p * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return { url: canvas.toDataURL(), scale, w, h };
}

// Smaller, rounder pieces of the same glass. The biggest is about three
// quarters as tall as the piece; longer pieces make one more. `varied`: three or
// four, as round as the piece, from one big one down to small ones, never the same
// twice (Noah, Oct 28: "I want the circles to break into 4 sometimes, not just 3,
// and have more variety in the particle sizes. Slight enough to make it feel more
// realistic when they pop").
function blobSizes(w: number, h: number, varied = false) {
  if (varied) {
    const count = Math.random() < 0.45 ? 4 : 3;
    return Array.from({ length: count }, (_, k) => {
      const bh = h * (k === 0 ? 0.6 + Math.random() * 0.18 : 0.26 + Math.random() * 0.34);
      return { w: bh * (1 + Math.random() * 0.22), h: bh };
    }).sort(() => Math.random() - 0.5);
  }
  const count = Math.min(4, Math.max(3, Math.round(w / h) - 1));
  const sizes = Array.from({ length: count }, (_, k) => {
    const bh = h * (0.78 - k * 0.09) * (0.92 + Math.random() * 0.16);
    return { w: Math.max(bh, Math.min(w / 2, bh * (1.3 + Math.random() * 1.1))), h: bh };
  });
  for (let k = sizes.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [sizes[k], sizes[j]] = [sizes[j], sizes[k]];
  }
  return sizes;
}

// The lander's glass pieces: they can be picked up and thrown, they knock into
// each other and bounce off the edges, and they spring home when they come to
// rest near their spot. Thrown hard enough, a piece squashes and pops into
// blobs, which find each other again. Positions are written straight to the DOM each frame.
export function GlassField({
  pieces,
  homes,
  lines,
  radius,
  sectionRef,
  onAway,
  clickToPop = false,
  entrance = "rise",
  floor,
}: {
  pieces: GlassPiece[];
  homes: Rect[];
  lines: number[]; // the line each piece sits in, so it rises in with it (Lander.module.css)
  radius: number;
  sectionRef: React.RefObject<HTMLElement | null>;
  onAway: (away: boolean[]) => void;
  // Thrown hard into an edge or another piece, a piece pops. With clickToPop, a quick click pops it where it is too
  // (Noah, Oct 28: "Could we also make it so a fast click makes them pop?"; then, asked whether a hard toss should
  // still pop them as well: "Both"), and its pieces are `varied`.
  clickToPop?: boolean;
  // "rise": up with its line of text. "settle": each piece in turn, from a soft blur into its place. "fade": each in
  // turn, simply fading in. "none": already there (Lander.module.css).
  entrance?: "rise" | "settle" | "fade" | "none";
  // How far down the glass may go, in px from the top of the section; its own height when not given. The home page lets
  // it roam down to just above the project cards (NameLander.tsx).
  floor?: () => number;
}) {
  const floorRef = useRef(floor);
  floorRef.current = floor;
  const depth = (section: HTMLElement) => floorRef.current?.() ?? section.offsetHeight;
  const els = useRef<(HTMLSpanElement | null)[]>([]);
  const blobEls = useRef<(HTMLSpanElement | null)[][]>([]);
  const bodies = useRef<Body[]>([]);
  const frame = useRef(0);
  const timer = useRef(0);
  const last = useRef(0);
  const top = useRef(10);
  const away = useRef("");
  const shapedRef = useRef(false);
  const [lenses, setLenses] = useState<(Lens | null)[]>([]);
  const [looks, setLooks] = useState<(Look[] | null)[]>([]);

  const draw = useCallback(() => {
    bodies.current.forEach((b, i) => {
      const el = els.current[i];
      if (el && !b.blobs) {
        // `translate`, not `transform`, so an easter-egg `scale` never scales the offset
        el.style.translate = `${b.x - b.hx}px ${b.y - b.hy}px`;
        if (b.squash) {
          // Flattened against what it hit, anchored where it touches
          const e = 1 - (1 - b.squash.t) ** 3;
          const along = 1 - 0.32 * e;
          const across = 1 + 0.2 * e;
          const { nx, ny } = b.squash;
          if (!nx && !ny) {
            // Clicked: it presses in evenly, from its middle
            el.style.transformOrigin = "50% 50%";
            el.style.transform = `scale(${1 - 0.16 * e})`;
          } else {
            el.style.transformOrigin = nx ? `${nx < 0 ? 0 : 100}% 50%` : `50% ${ny < 0 ? 0 : 100}%`;
            el.style.transform = nx ? `scale(${along}, ${across})` : `scale(${across}, ${along})`;
          }
        }
      }
      b.blobs?.forEach((blob, k) => {
        const node = blobEls.current[i]?.[k];
        if (!node) return;
        node.style.translate = `${blob.x}px ${blob.y}px`;
        const sx = (1 + blob.d) * blob.shrink;
        const sy = blob.shrink / (1 + blob.d);
        node.style.transform = `scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`;
      });
    });
    const flags = bodies.current.map((b) => !b.home);
    const key = flags.map(Number).join("");
    if (key !== away.current) {
      away.current = key;
      onAway(flags);
    }
  }, [onAway]);

  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The squash is over: the piece pops into blobs. They burst out from its
  // middle and away from what it hit, stretched the way they're flying.
  const pop = useCallback((i: number, now: number) => {
    const b = bodies.current[i];
    if (!b?.squash) return;
    const { nx, ny } = b.squash;
    const sizes = blobSizes(b.w, b.h, clickToPop);
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    b.blobs = sizes.map((size, k) => {
      const along = ((k + 0.5) / sizes.length - 0.5) * (b.w - size.w);
      const lift = (Math.random() - 0.5) * (b.h - size.h);
      const angle = Math.atan2(lift, along) + (Math.random() - 0.5) * 0.9;
      const burst = 450 + Math.random() * 450;
      const vx = b.vx * 0.5 + Math.cos(angle) * burst - nx * 300;
      const vy = b.vy * 0.5 + Math.sin(angle) * burst - ny * 300 - Math.random() * 200;
      const speed = Math.hypot(vx, vy) || 1;
      return {
        x: cx + along - size.w / 2,
        y: cy + lift - size.h / 2,
        vx,
        vy,
        w: size.w,
        h: size.h,
        m: (size.w * size.h) / (b.w * b.h),
        home: false,
        held: false,
        d: (0.3 * (vx * vx - vy * vy)) / (speed * speed),
        dv: 0,
        shrink: 1,
      };
    });
    Object.assign(b, { vx: 0, vy: 0, squash: null, poppedAt: now, mend: null });
    const id = `${pieces[i].id}-${Math.round(now)}`; // new keys and lenses for every pop
    setLooks((all) => {
      const next = [...all];
      next[i] = sizes.map((size, k) => ({ id: `${id}-${k}`, w: size.w, h: size.h, lens: lensMap(size.w, size.h) }));
      return next;
    });
  }, [pieces, clickToPop]);

  // The blobs have found each other: the piece pops back, whole, right there.
  const merge = useCallback((i: number) => {
    const b = bodies.current[i];
    if (!b?.mend) return;
    Object.assign(b, { x: b.mend.x, y: b.mend.y, vx: 0, vy: 0, blobs: null, mend: null });
    if (b.mendHome) Object.assign(b, { home: true, mendHome: false });
    const el = els.current[i];
    if (el) {
      el.style.visibility = "";
      el.animate(
        [
          { transform: "scale(0.62, 0.78)" },
          { transform: "scale(1.1, 0.9)", offset: 0.4 },
          { transform: "scale(0.96, 1.05)", offset: 0.7 },
          { transform: "none" },
        ],
        { duration: 520, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
      );
    }
    blobEls.current[i]?.forEach((node) => node?.style.setProperty("display", "none"));
    setLooks((all) => {
      const next = [...all];
      next[i] = null;
      return next;
    });
  }, []);

  // Easter egg: glass thrown up into the nav. The nav decides if the knock landed under it.
  const knock = useCallback(
    (i: number) => {
      const b = bodies.current[i];
      const box = sectionRef.current?.getBoundingClientRect();
      if (!b || !box) return;
      const detail = { color: pieces[i].color, x: box.left + b.x + b.w / 2, y: box.top + b.y };
      window.dispatchEvent(new CustomEvent("noaoh:tint", { detail }));
    },
    [pieces, sectionRef],
  );

  const step = useCallback(
    (now: number) => {
      const section = sectionRef.current;
      if (!section) return;
      const dt = Math.min(0.032, (now - last.current) / 1000 || 0.016);
      last.current = now;
      const width = section.clientWidth;
      const height = depth(section);
      const all = bodies.current;
      const whole = all.filter((b) => !b.blobs && !b.squash);
      const loose = all.flatMap((b) => (b.blobs && !b.mend ? b.blobs : [])); // blobs still bouncing around
      const hits = new Map<number, { nx: number; ny: number; home?: boolean }>();
      let moving = false;

      for (const b of whole) {
        if (b.held) {
          moving = true;
          continue;
        }
        if (b.home) continue;
        const toX = b.hx - b.x;
        const toY = b.hy - b.y;
        const distance = Math.hypot(toX, toY);
        if (b.hopping) {
          b.vx += (toX * HOP_STIFFNESS - b.vx * HOP_DAMPING) * dt;
          b.vy += (toY * HOP_STIFFNESS - b.vy * HOP_DAMPING) * dt;
        } else if (distance < b.h * SNAP && Math.hypot(b.vx, b.vy) < 700) {
          b.vx += (toX * STIFFNESS - b.vx * DAMPING) * dt;
          b.vy += (toY * STIFFNESS - b.vy * DAMPING) * dt;
        } else {
          const keep = Math.exp(-FRICTION * dt);
          b.vx *= keep;
          b.vy *= keep;
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }

      // Blobs bounce around and slow down, then drift back toward each other,
      // shrinking as they arrive. All the while they stretch and wobble.
      for (const b of all) {
        if (!b.blobs) continue;
        moving = true;
        if (!b.mend && now - b.poppedAt > MEND_AFTER) b.mend = b.mendHome ? { x: b.hx, y: b.hy } : meetingPoint(b, width, height);
        const cx = b.mend ? b.mend.x + b.w / 2 : 0;
        const cy = b.mend ? b.mend.y + b.h / 2 : 0;
        for (const s of b.blobs) {
          if (b.mend) {
            const toX = cx - (s.x + s.w / 2);
            const toY = cy - (s.y + s.h / 2);
            s.vx += (toX * MEND_STIFFNESS - s.vx * MEND_DAMPING) * dt;
            s.vy += (toY * MEND_STIFFNESS - s.vy * MEND_DAMPING) * dt;
            s.shrink = Math.min(1, Math.max(0.55, Math.hypot(toX, toY) / (b.h * 1.2)));
          } else {
            const keep = Math.exp(-FRICTION * dt);
            s.vx *= keep;
            s.vy *= keep;
          }
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const speed = Math.hypot(s.vx, s.vy);
          const stretch = speed > 1 ? (Math.min(0.28, speed / 5000) * (s.vx * s.vx - s.vy * s.vy)) / (speed * speed) : 0;
          s.dv += (-(s.d - stretch) * JELLY_STIFFNESS - s.dv * JELLY_DAMPING) * dt;
          s.d = Math.min(0.45, Math.max(-0.45, s.d + s.dv * dt));
        }
      }

      // Pieces knock into each other. A held piece pushes but isn't pushed, so
      // swung hard enough it pops the piece it hits.
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const a = all[i];
          const b = all[j];
          if (a.blobs || a.squash || b.blobs || b.squash) continue;
          const victim = a.held ? j : b.held ? i : Math.hypot(a.vx, a.vy) >= Math.hypot(b.vx, b.vy) ? i : j;
          const impact = collide(a, b);
          if (!impact || impact.speed <= (clickToPop ? POP_SOFT : POP)) continue;
          const side = victim === i ? -impact.dir : impact.dir; // its side that touched the other
          hits.set(victim, impact.horizontal ? { nx: side, ny: 0 } : { nx: 0, ny: side });
        }
      }
      // Loose blobs bump into each other and into whole pieces, and squash a little when they do
      for (let i = 0; i < loose.length; i++) {
        for (let j = i + 1; j < loose.length; j++) jiggle(loose[i], loose[j], collide(loose[i], loose[j]));
        for (const b of whole) {
          const impact = collide(loose[i], b);
          jiggle(loose[i], null, impact);
          // A chain reaction (Noah, Oct 28: "could lead to chain reactions"): a piece flying out of a pop pops the
          // glass it hits hard enough, and that glass comes back together in its own place
          const k = all.indexOf(b);
          if (clickToPop && impact && impact.speed > CHAIN && !b.held && now - b.poppedAt > CHAIN_REST) {
            const side = impact.dir; // b's side that the flying piece hit
            hits.set(k, impact.horizontal ? { nx: side, ny: 0, home: true } : { nx: 0, ny: side, home: true });
          }
        }
      }

      all.forEach((b, i) => {
        if (b.held || b.home || b.blobs || b.squash) return;
        const fast = Math.hypot(b.vx, b.vy);
        if (fast > MAX_SPEED) {
          b.vx *= MAX_SPEED / fast;
          b.vy *= MAX_SPEED / fast;
        }
        const hit = walls(b, width, height);
        if (hit.ny < 0 && hit.y > TINT) knock(i);
        if (Math.max(hit.x, hit.y) > (clickToPop ? POP_SOFT : POP))
          hits.set(i, hit.x >= hit.y ? { nx: hit.nx, ny: 0 } : { nx: 0, ny: hit.ny });
        const speed = Math.hypot(b.vx, b.vy);
        const distance = Math.hypot(b.hx - b.x, b.hy - b.y);
        if (distance < 0.5 && speed < 10) {
          Object.assign(b, { x: b.hx, y: b.hy, vx: 0, vy: 0, home: true, hopping: false });
        } else if (b.hopping || speed > 3 || distance < b.h * SNAP) {
          moving = true;
        }
      });
      for (const s of all.flatMap((b) => b.blobs ?? [])) {
        const hit = walls(s, width, height);
        jiggle(s, null, hit.x ? { speed: hit.x, horizontal: true, dir: 0 } : null);
        jiggle(s, null, hit.y ? { speed: hit.y, horizontal: false, dir: 0 } : null);
      }

      // Squashing pieces pop once the squash is over; newly hit ones start squashing
      all.forEach((b, i) => {
        if (!b.squash) return;
        moving = true;
        b.squash.t = Math.min(1, Math.max(0, (now - b.squash.at) / SQUASH)); // it may be waiting its turn
        if (now >= b.squash.at + SQUASH) pop(i, now);
      });
      hits.forEach((normal, i) => {
        const b = all[i];
        if (b.held || b.blobs || b.squash || shapedRef.current || reduced()) return;
        b.squash = { at: now, t: 0, ...normal };
        b.home = false;
        b.hopping = false;
        b.mendHome = Boolean(normal.home);
        moving = true;
      });
      all.forEach((b, i) => {
        const at = b.mend;
        if (at && b.blobs?.every((s) => isBack(s, at, b))) merge(i);
      });

      draw();
      if (moving) schedule.current();
    },
    [draw, knock, merge, pop, sectionRef, clickToPop],
  );

  // Next frame on whichever comes first: an animation frame, or a short timer
  // for when the browser holds animation frames back (background panes, iframes).
  const schedule = useRef(() => {});
  schedule.current = () => {
    const run = (now: number) => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(timer.current);
      frame.current = 0;
      timer.current = 0;
      step(now);
    };
    frame.current = requestAnimationFrame(run);
    timer.current = window.setTimeout(() => run(performance.now()), 34);
  };

  const wake = useCallback(() => {
    if (frame.current || timer.current) return;
    last.current = performance.now();
    schedule.current();
  }, []);

  // Follow the sentence when its lines change: pieces at home move with their spot.
  useEffect(() => {
    bodies.current = homes.map((home, i): Body => {
      const b = bodies.current[i];
      const spot = { w: home.w, h: home.h, hx: home.x, hy: home.y };
      if (!b) {
        return {
          ...spot,
          ...{ x: home.x, y: home.y, vx: 0, vy: 0, m: 1, home: true, held: false, hopping: false },
          ...{ grabX: 0, grabY: 0, movedAt: 0, downAt: 0, downX: 0, downY: 0 },
          ...{ squash: null, blobs: null, poppedAt: 0, mend: null, mendHome: false },
        };
      }
      return b.home ? { ...b, ...spot, x: home.x, y: home.y } : { ...b, ...spot };
    });
    setLenses(homes.map((home) => lensMap(home.w, home.h)));
    draw();
    wake();
  }, [homes, draw, wake]);

  // The blobs appear and the whole piece disappears in the same frame
  useLayoutEffect(() => {
    looks.forEach((set, i) => {
      const el = els.current[i];
      if (!set || !el) return;
      el.style.visibility = "hidden";
      el.style.transform = "";
      el.style.transformOrigin = "";
    });
    draw();
  }, [looks, draw]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(timer.current);
      frame.current = 0;
      timer.current = 0;
    },
    [],
  );

  // Easter eggs. "name": one after another, the pieces squash and pop where
  // they are, and their blobs come back together in their spots. As circles,
  // squares and triangles they hop out and bounce back instead.
  // "bauhaus": the pieces turn into a circle, a square and a triangle, or back.
  const [shaped, setShaped] = useState(false);
  useEffect(() => {
    shapedRef.current = shaped;
  }, [shaped]);
  useEffect(() => {
    const egg = (event: Event) => {
      const kind = (event as CustomEvent).detail;
      if (kind === "bauhaus") setShaped((s) => !s);
      if (kind === "name" && !reduced()) {
        const now = performance.now();
        bodies.current.forEach((b, i) => {
          if (b.held || b.blobs || b.squash) return;
          if (shapedRef.current) {
            Object.assign(b, { home: false, hopping: true, vx: (Math.random() - 0.5) * 500, vy: -(900 + Math.random() * 500) });
            return;
          }
          // Pressed down into the line for a beat, then up and out
          Object.assign(b, { squash: { at: now + i * 90, t: 0, nx: 0, ny: 1 }, home: false, hopping: false, mendHome: true });
          b.vx = 0;
          b.vy = 0;
        });
        draw();
        wake();
      }
    };
    window.addEventListener("noaoh:egg", egg);
    return () => window.removeEventListener("noaoh:egg", egg);
  }, [draw, wake]);

  const grab = (i: number) => (event: ReactPointerEvent<HTMLSpanElement>) => {
    const b = bodies.current[i];
    const section = sectionRef.current;
    if (!b || b.blobs || b.squash || !section) return;
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is a nicety; dragging still works without it
    }
    event.currentTarget.style.zIndex = String(++top.current);
    const box = section.getBoundingClientRect();
    Object.assign(b, {
      held: true,
      home: false,
      hopping: false,
      vx: 0,
      vy: 0,
      grabX: event.clientX - box.left - b.x,
      grabY: event.clientY - box.top - b.y,
      movedAt: performance.now(),
      downAt: performance.now(),
      downX: event.clientX,
      downY: event.clientY,
    });
    draw();
    wake();
  };

  const move = (i: number) => (event: ReactPointerEvent<HTMLSpanElement>) => {
    const b = bodies.current[i];
    const section = sectionRef.current;
    if (!b?.held || !section) return;
    const box = section.getBoundingClientRect();
    const now = performance.now();
    const dt = Math.max(8, now - b.movedAt) / 1000;
    const x = Math.min(Math.max(event.clientX - box.left - b.grabX, 0), section.clientWidth - b.w);
    const y = Math.min(Math.max(event.clientY - box.top - b.grabY, 0), depth(section) - b.h);
    // Smoothed throw velocity
    b.vx = b.vx * 0.4 + ((x - b.x) / dt) * 0.6;
    b.vy = b.vy * 0.4 + ((y - b.y) / dt) * 0.6;
    b.x = x;
    b.y = y;
    b.movedAt = now;
  };

  const drop = (i: number) => (event: ReactPointerEvent<HTMLSpanElement>) => {
    const b = bodies.current[i];
    if (!b?.held) return;
    b.held = false;
    // A quick click, not a drag: it presses in and pops where it is, and its pieces come back together at home
    const now = performance.now();
    const clicked =
      now - b.downAt < CLICK.ms && Math.hypot(event.clientX - b.downX, event.clientY - b.downY) < CLICK.px;
    if (clickToPop && clicked && !shapedRef.current && !reduced()) {
      Object.assign(b, { vx: 0, vy: 0, squash: { at: now, t: 0, nx: 0, ny: 0 }, home: false, hopping: false, mendHome: true });
      wake();
      return;
    }
    const still = performance.now() - b.movedAt > 80;
    if (still || reduced()) {
      b.vx = 0;
      b.vy = 0;
    }
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > MAX_SPEED) {
      b.vx *= MAX_SPEED / speed;
      b.vy *= MAX_SPEED / speed;
    }
    if (reduced() && Math.hypot(b.hx - b.x, b.hy - b.y) < b.h * SNAP) {
      Object.assign(b, { x: b.hx, y: b.hy, home: true });
    }
    wake();
  };

  const filter = (id: string, lens: Lens) => (
    <filter key={id} id={`lens-${id}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feImage href={lens.url} x="0" y="0" width={lens.w} height={lens.h} preserveAspectRatio="none" result="map" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale={lens.scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );

  return (
    <>
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        {lenses.map((lens, i) => (lens ? filter(pieces[i].id, lens) : null))}
        {looks.flatMap((set) => (set ?? []).map((look) => (look.lens ? filter(look.id, look.lens) : null)))}
      </svg>
      {homes.map((home, i) => {
        const shape = shaped ? SHAPES[pieces[i].id] ?? "circle" : undefined;
        return [
          <span
            key={pieces[i].id}
            ref={(el) => {
              els.current[i] = el;
            }}
            className={styles.glass}
            aria-hidden="true"
            data-shape={shape}
            data-entrance={entrance}
            style={
              {
                "--c": pieces[i].color,
                "--line": lines[i] ?? 0,
                // Magnify, then frost
                "--lens": lenses[i] ? `url(#lens-${pieces[i].id}) blur(3px)` : "blur(3px)",
                "--square": (home.h / home.w).toFixed(4), // the scale that makes it as wide as it is tall
                left: home.x,
                top: home.y,
                width: home.w,
                height: home.h,
                // A Bauhaus square or triangle takes a modest corner, even from a circle (as on the old lander: 0.18 of its height)
                borderRadius: shape === "circle" ? "50%" : shape ? Math.min(radius, home.h * 0.18) : radius,
              } as React.CSSProperties
            }
            onPointerDown={grab(i)}
            onPointerMove={move(i)}
            onPointerUp={drop(i)}
            onPointerCancel={drop(i)}
          />,
          // Each blob is a small rounded piece of the same glass, with its own lens
          ...(looks[i] ?? []).map((look, k) => (
            <span
              key={look.id}
              ref={(el) => {
                (blobEls.current[i] ??= [])[k] = el;
              }}
              className={`${styles.glass} ${styles.blob}`}
              aria-hidden="true"
              style={
                {
                  "--c": pieces[i].color,
                  "--lens": look.lens ? `url(#lens-${look.id}) blur(3px)` : "blur(3px)",
                  width: look.w,
                  height: look.h,
                  borderRadius: look.h / 2,
                } as React.CSSProperties
              }
            />
          )),
        ];
      })}
    </>
  );
}

// Where a popped piece comes back together: where its blobs are, on average by
// size, kept inside the lander. Returns its top-left.
function meetingPoint(b: Body, width: number, height: number) {
  const blobs = b.blobs ?? [];
  const mass = blobs.reduce((sum, s) => sum + s.m, 0);
  const x = blobs.reduce((sum, s) => sum + (s.x + s.w / 2) * s.m, 0) / mass - b.w / 2;
  const y = blobs.reduce((sum, s) => sum + (s.y + s.h / 2) * s.m, 0) / mass - b.h / 2;
  return { x: Math.min(Math.max(x, 0), width - b.w), y: Math.min(Math.max(y, 0), height - b.h) };
}

const isBack = (s: Blob, at: { x: number; y: number }, b: Body) =>
  Math.hypot(at.x + b.w / 2 - (s.x + s.w / 2), at.y + b.h / 2 - (s.y + s.h / 2)) < 4 && Math.hypot(s.vx, s.vy) < 40;

// A knock squashes a blob along the way it was hit; its stretch springs back with a wobble
function jiggle(a: Blob, b: Blob | null, impact: ReturnType<typeof collide>) {
  if (!impact) return;
  const kick = (impact.horizontal ? -1 : 1) * Math.min(6, impact.speed / 300);
  a.dv += kick;
  if (b) b.dv += kick;
}

// Keeps something inside the lander. Returns how hard it hit, across and up or
// down, and which edges: -1 for the left or top, 1 for the right or bottom.
function walls(b: Mass, width: number, height: number) {
  const hit = { x: 0, nx: 0, y: 0, ny: 0 };
  if (b.x < 0) {
    Object.assign(hit, { x: Math.max(0, -b.vx), nx: -1 });
    [b.x, b.vx] = [0, Math.abs(b.vx) * BOUNCE];
  } else if (b.x + b.w > width) {
    Object.assign(hit, { x: Math.max(0, b.vx), nx: 1 });
    [b.x, b.vx] = [width - b.w, -Math.abs(b.vx) * BOUNCE];
  }
  if (b.y < 0) {
    Object.assign(hit, { y: Math.max(0, -b.vy), ny: -1 });
    [b.y, b.vy] = [0, Math.abs(b.vy) * BOUNCE];
  } else if (b.y + b.h > height) {
    Object.assign(hit, { y: Math.max(0, b.vy), ny: 1 });
    [b.y, b.vy] = [height - b.h, -Math.abs(b.vy) * BOUNCE];
  }
  return hit;
}

// Push two overlapping things apart along the shallower overlap, and trade
// momentum along that axis by mass. A held piece acts like an immovable hand.
// Returns how hard they met and along which axis (`dir` is -1 when `a` is
// left of or above `b`), or null if they weren't closing in.
function collide(a: Mass, b: Mass) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  if (ox <= 0 || oy <= 0) return null;
  const ia = a.held ? 0 : 1 / a.m; // how easily each one moves
  const ib = b.held ? 0 : 1 / b.m;
  if (ia + ib === 0) return null;
  if (ia) a.home = false;
  if (ib) b.home = false;

  const horizontal = ox < oy;
  const overlap = horizontal ? ox : oy;
  const dir = horizontal
    ? a.x + a.w / 2 < b.x + b.w / 2 ? -1 : 1
    : a.y + a.h / 2 < b.y + b.h / 2 ? -1 : 1;
  const rel = horizontal ? a.vx - b.vx : a.vy - b.vy;
  const closing = rel * dir < 0;
  const impulse = closing ? (-(1 + BOUNCE) * rel) / (ia + ib) : 0;
  const pa = (overlap * ia) / (ia + ib);
  const pb = (overlap * ib) / (ia + ib);

  if (horizontal) {
    a.x += dir * pa;
    b.x -= dir * pb;
    a.vx += impulse * ia;
    b.vx -= impulse * ib;
  } else {
    a.y += dir * pa;
    b.y -= dir * pb;
    a.vy += impulse * ia;
    b.vy -= impulse * ib;
  }
  return closing ? { speed: Math.abs(rel), horizontal, dir } : null;
}
