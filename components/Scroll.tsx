"use client";

import { useEffect } from "react";

const EASE = 0.2; // share of the way left that the page covers each frame, at 60 frames a second: settled in about a fifth of a second

// A slightly weighted scroll. The wheel sets where the page is headed and the
// page eases there, instead of jumping a notch at a time. Keys, the scrollbar,
// links and touch stay the browser's own, and so does the wheel with reduced
// motion on, or over anything that scrolls by itself.
export function Scroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let target = window.scrollY;
    let current = window.scrollY;
    let frame = 0;
    let last = 0;

    const glide = (now: number) => {
      const step = 1 - (1 - EASE) ** (Math.min(64, Math.max(0, now - last)) / (1000 / 60));
      last = now;
      current += (target - current) * step;
      if (Math.abs(target - current) < 0.5) current = target;
      window.scrollTo({ top: current, behavior: "instant" });
      frame = current === target ? 0 : requestAnimationFrame(glide);
    };

    const wheel = (event: WheelEvent) => {
      if (event.defaultPrevented || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (scrollsItself(event.target, event.deltaY)) return;
      event.preventDefault();
      if (!frame) {
        current = target = window.scrollY;
        last = performance.now();
        frame = requestAnimationFrame(glide);
      }
      const notch = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      target = Math.min(Math.max(0, target + event.deltaY * notch), root.scrollHeight - window.innerHeight);
    };

    // Anything else that moves the page takes over: the next wheel starts from there
    const scroll = () => {
      if (frame && Math.abs(window.scrollY - current) > 2) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("scroll", scroll);
    };
  }, []);

  return null;
}

// True if the wheel is over something that can scroll that way by itself
function scrollsItself(target: EventTarget | null, delta: number) {
  for (let el = target instanceof Element ? target : null; el && el !== document.documentElement; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY !== "auto" && overflowY !== "scroll") continue;
    if (delta > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
  }
  return false;
}
