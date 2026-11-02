"use client";

import { useEffect, useRef } from "react";

// Project cards and lab tiles come in quietly each time they come into view:
// from faint rather than from nothing, rising less than a page's own blocks
// (globals.css, "Entrances"). Ones that show together follow each other, top
// to bottom, a beat apart. Out of view, they go back to faint, unseen.
const MOST = 4; // beats a card waits, at most, behind the others showing with it

let watcher: IntersectionObserver | null = null;

function watch(el: HTMLElement) {
  watcher ??= new IntersectionObserver((entries) => {
    entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach((entry, i) => {
        const card = entry.target as HTMLElement;
        card.style.setProperty("--reveal-i", String(Math.min(i, MOST)));
        card.setAttribute("data-shown", "");
      });
    for (const entry of entries) {
      if (!entry.isIntersecting) entry.target.removeAttribute("data-shown");
    }
  });
  watcher.observe(el);
  return () => watcher?.unobserve(el);
}

export function Reveal({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => (ref.current ? watch(ref.current) : undefined), []);
  return (
    <div ref={ref} className={className} data-reveal="">
      {children}
    </div>
  );
}
