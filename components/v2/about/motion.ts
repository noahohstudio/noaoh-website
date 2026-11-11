"use client";

import { useEffect, useState, type RefObject } from "react";

/*
  Motion shared by the v2 about renditions.

  Resolve: text comes into focus from a soft blur as it enters, once, after naheeljawaid.com. Blocks that show together
  follow each other in reading order, a beat apart. Mark an element `data-resolve` (text: from blur), `data-resolve="pic"`
  (a picture: the site's quietest entrance, from 35% and 6px lower, never blurred) or `data-resolve="words"` (each
  `[data-w]` child word in turn). Each rendition's CSS draws the states. On a fresh load the loader covers the page for
  about 1.4s (Loader.tsx), so what's already in view waits for it to clear.
*/
const LOADER_CLEARS = 1400; // ms after the page starts loading (Loader.module.css: clears from 1380ms)
const MOST = 8; // beats a block waits, at most, behind the ones showing with it

export function useResolve(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = [...el.querySelectorAll<HTMLElement>("[data-resolve]")];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.setAttribute("data-shown", ""));
      return;
    }
    let ready = performance.now() >= LOADER_CLEARS;
    const waiting = new Set<HTMLElement>();
    const show = (list: HTMLElement[]) =>
      list
        .sort((a, b) => {
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          return ra.top - rb.top || ra.left - rb.left;
        })
        .forEach((item, i) => {
          item.style.setProperty("--resolve-i", String(Math.min(i, MOST)));
          item.setAttribute("data-shown", "");
        });
    const watcher = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        entering.forEach((item) => watcher.unobserve(item));
        if (ready) show(entering);
        else entering.forEach((item) => waiting.add(item));
      },
      { rootMargin: "0px 0px -4% 0px" },
    );
    items.forEach((item) => watcher.observe(item));
    const timer = window.setTimeout(() => {
      ready = true;
      show([...waiting]);
      waiting.clear();
    }, Math.max(0, LOADER_CLEARS - performance.now()));
    return () => {
      watcher.disconnect();
      window.clearTimeout(timer);
    };
  }, [root]);
}

// The title's letters turn over in a quick wave, one after another, as the row is reached: the site's mirrored letters
// (components/Flip.tsx, "ripple"), run through the whole title instead of only the letter under the pointer.
const timers = new WeakMap<HTMLElement, number>();
const STEP = 16;
export function ripple(el: HTMLElement | null) {
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const glyphs = el.querySelectorAll<HTMLElement>("[data-glyph]");
  glyphs.forEach((glyph, i) => glyph.style.setProperty("--ripple-delay", `${i * STEP}ms`));
  el.removeAttribute("data-ripple");
  void el.offsetWidth; // start over if it's already running
  el.setAttribute("data-ripple", "");
  window.clearTimeout(timers.get(el));
  timers.set(
    el,
    window.setTimeout(() => el.removeAttribute("data-ripple"), glyphs.length * STEP + 260),
  );
}

// Whether this is a mouse or trackpad, which can hover: only then do pictures come up beside the rows
export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const query = matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return fine;
}

// The pictures of a hovered row take turns, a clean cut every so often, starting from the first each time
export function useTurn(count: number, key: unknown, every = 900) {
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    setTurn(0);
    if (count < 2) return;
    const timer = window.setInterval(() => setTurn((t) => t + 1), every);
    return () => window.clearInterval(timer);
  }, [count, key, every]);
  return count ? turn % count : 0;
}

// A picture's box inside a square of `max` px, at its own shape
export function fit(ratio: string, max: number, maxHeight = max) {
  const [w, h] = ratio.split("/").map(Number);
  const r = w / h || 4 / 3;
  let width = max;
  let height = width / r;
  if (height > maxHeight) {
    height = maxHeight;
    width = height * r;
  }
  return { width: Math.round(width), height: Math.round(height) };
}
