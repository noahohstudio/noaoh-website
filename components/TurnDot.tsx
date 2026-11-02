"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./CaseStudy.module.css";

const LEAD = 0.4; // the dot sets off this long before a turn, so it lands as the turn starts
const STRETCH = 0.4; // how much longer the dot grows per px/ms of speed, up to twice its length

// A signature dot under a row of tiles that take turns (Noah, Oct 27, of Kino's flow tiles: "why don't we just have the
// signature dot at the very bottom of the screen, and it just kind of slides as the different screens play their
// animations"). It reads the time of the row's first loop, which all of them share, and sits under the tile whose turn
// it is; between turns, under the next to play. It shows once the loops have played (never under reduced motion,
// where they rest on their stills), and stays put if they're paused.
export function TurnDot({ color, times }: { color: string; times: [number, number][] }) {
  const dot = useRef<HTMLLIElement>(null);
  const [at, setAt] = useState<number | null>(null);

  useEffect(() => {
    const row = dot.current?.parentElement;
    if (!row) return;
    const tick = () => {
      const video = row.querySelector("video");
      if (!video || (video.paused && video.currentTime === 0)) return;
      const t = video.currentTime + LEAD;
      setAt(Math.max(0, times.findIndex(([start, end]) => t >= start && t < end)));
    };
    const timer = window.setInterval(tick, 100);
    return () => window.clearInterval(timer);
  }, [times]);

  // It stretches along its way as it speeds up, and rounds again as it slows (Noah, Oct 28: "It could also stretch
  // slightly when it speeds up, to show the speed"): each frame of a slide, its length follows how fast it's going.
  useEffect(() => {
    const el = dot.current;
    if (!el || at === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const center = () => {
      const box = el.getBoundingClientRect();
      return (box.left + box.right) / 2;
    };
    let x = center();
    let then = performance.now();
    let stretch = 1;
    let frame = 0;
    const until = then + 900;
    const step = (now: number) => {
      const next = center();
      const speed = Math.abs(next - x) / Math.max(now - then, 1);
      [x, then] = [next, now];
      stretch += (1 + Math.min(speed * STRETCH, 1) - stretch) / 2;
      el.style.transform = `scale(${stretch}, ${1 / Math.sqrt(stretch)})`;
      if (now < until) frame = requestAnimationFrame(step);
      else el.style.transform = "";
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [at]);

  return (
    <li
      ref={dot}
      className={styles.turnDot}
      aria-hidden="true"
      data-on={at !== null || undefined}
      style={{ "--i": at ?? 0, "--dot": color } as CSSProperties}
    />
  );
}
