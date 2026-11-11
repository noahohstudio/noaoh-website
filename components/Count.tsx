"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Letters } from "./Flip";
import styles from "./Footer.module.css";

const PLACES = 5; // the count always shows this many digits; places it hasn't reached are gray zeros

// The space after each figure's ink, in em: Geist SemiBold's tabular figures, read from the font
// itself (a canvas can only measure the proportional ones). The caption ends where the ink does.
const INK_END: Record<string, number> = {
  "0": 0.036,
  "1": 0.0914,
  "2": 0.0488,
  "3": 0.039,
  "4": 0.0264,
  "5": 0.041,
  "6": 0.0448,
  "7": 0.0532,
  "8": 0.026,
  "9": 0.0436,
};
const MINE = "noaoh:visitor"; // this browser's number, from its first visit
const SEEN = "noaoh:seen"; // the count it saw last time

// Storage can be off, in private windows; then nothing is remembered or counted
function recall(key: string) {
  try {
    const n = Number(localStorage.getItem(key));
    return n > 0 ? n : null;
  } catch {
    return null;
  }
}

function remember(key: string, n: number) {
  try {
    localStorage.setItem(key, String(n));
    return true;
  } catch {
    return false;
  }
}

// Once per page load, however many times the footer mounts. A browser is
// counted on its first visit, and keeps that number.
let visit: Promise<{ total: number; mine: number | null } | null> | null = null;
function arrive() {
  visit ??= (async () => {
    const known = recall(MINE);
    const fresh = !known && remember(MINE, 0); // only count a browser that can remember it was counted
    const res = await fetch("/api/visits", { method: fresh ? "POST" : "GET" });
    if (!res.ok) return null;
    const { visits } = (await res.json()) as { visits?: number };
    if (typeof visits !== "number") return null;
    if (fresh) remember(MINE, visits);
    return { total: visits, mine: known ?? (fresh ? visits : null) };
  })().catch(() => null);
  return visit;
}

// How many people have stopped by, as big as the lander and edge to edge.
// When it comes into view it catches up with any visits since you last saw
// it, your own included, and each digit that changes turns over.
export function Count() {
  const number = useRef<HTMLParagraphElement>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [mine, setMine] = useState<number | null>(null);
  const [shown, setShown] = useState<number | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    let active = true;
    arrive().then((result) => {
      if (!active || !result) return;
      setTotal(result.total);
      setMine(result.mine);
      // From the count you saw last time; on a first visit, from just before you
      setShown(Math.min(recall(SEEN) ?? result.total - 1, result.total));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = number.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || total === null || shown === total) return;
    const id = window.setTimeout(() => {
      setShown(total);
      remember(SEEN, total);
    }, 500);
    return () => window.clearTimeout(id);
  }, [inView, total, shown]);

  const digits = shown ? String(shown) : "";
  const zeros = "0".repeat(Math.max(0, PLACES - digits.length));
  const places = zeros.length + digits.length;
  const last = (zeros + digits).slice(-1);

  // Fit the digits exactly between the page edges. The last digit's tracking
  // doesn't count, so its own edge lands on the page's.
  useLayoutEffect(() => {
    const el = number.current;
    const room = el?.parentElement;
    if (!el || !room) return;
    let width = 0;
    const fit = () => {
      if (room.clientWidth === width) return;
      width = room.clientWidth;
      const style = getComputedStyle(el);
      const size = parseFloat(style.fontSize);
      const used = el.getBoundingClientRect().width - (parseFloat(style.letterSpacing) || 0);
      const fitted = (size * width) / used;
      el.style.fontSize = `${fitted}px`;
      room.style.setProperty("--ink-end", `${fitted * (INK_END[last] ?? 0)}px`);
    };
    fit();
    document.fonts?.ready.then(() => {
      width = 0;
      fit();
    });
    const observer = new ResizeObserver(fit);
    observer.observe(room);
    return () => observer.disconnect();
  }, [places, last]);

  return (
    <div className={styles.count} data-turn={shown !== null || undefined}>
      <p
        ref={number}
        className={styles.number}
        aria-hidden="true"
        data-exact
        style={{ "--places": places } as React.CSSProperties}
      >
        <span className={styles.zeros}>
          <Letters text={zeros} />
        </span>
        <Letters text={digits} />
      </p>
      <p className={styles.caption} data-text="small" data-ready={total !== null || undefined}>
        {total !== null && <span className="visually-hidden">{total.toLocaleString("en-US")} </span>}
        people have stopped by.
        {mine !== null && <span className={styles.muted}> You&apos;re number {mine.toLocaleString("en-US")}.</span>}
      </p>
    </div>
  );
}
