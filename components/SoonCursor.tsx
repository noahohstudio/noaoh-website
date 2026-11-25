"use client";

import { useEffect, useRef } from "react";
import styles from "./SoonCursor.module.css";

// Over a case study that isn't open yet, coming soon or locked (`data-soon`: its card on home, its name in the rail),
// the pointer turns into the word "soon" (Noah, Nov 25: "can we also have a subtle effect where whenever your cursor is
// on a locked case study, it turns into the word "soon"?"). The word sits on the pointer's tip, in the nav's glass so
// it reads over a picture as well as over the page, and the arrow hides while it shows. A mouse only: a touch screen
// has no pointer to turn.
export function SoonCursor() {
  const word = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = word.current;
    if (!el) return;
    const root = document.documentElement;
    // Only once this is running does the arrow hide over them (globals.css), so it never goes without the word
    root.setAttribute("data-soon-cursor", "");

    let at: { x: number; y: number } | null = null;
    let on = false;
    const set = (next: boolean) => {
      if (next === on) return;
      on = next;
      el.toggleAttribute("data-on", on);
    };
    const over = (target: Element | null) => !!target?.closest("[data-soon]");

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return set(false);
      at = { x: event.clientX, y: event.clientY };
      el.style.translate = `${at.x}px ${at.y}px`;
      set(over(event.target as Element | null));
    };
    // The page moving under a still pointer changes what's under it
    const scroll = () => {
      if (at) set(over(document.elementFromPoint(at.x, at.y)));
    };
    const out = () => {
      at = null;
      set(false);
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", scroll, { passive: true });
    root.addEventListener("pointerleave", out);
    window.addEventListener("blur", out);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", scroll);
      root.removeEventListener("pointerleave", out);
      window.removeEventListener("blur", out);
      root.removeAttribute("data-soon-cursor");
    };
  }, []);

  return (
    <span ref={word} className={styles.word} data-type="" aria-hidden="true">
      <span data-text="small">soon</span>
    </span>
  );
}
