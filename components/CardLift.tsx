"use client";

import { useEffect } from "react";

const SETTLE = 180; // ms without scrolling before the page counts as still, as the lab's

// Rest the pointer on a project card while the page is still and it lifts a little (Noah, Oct 29: "not liking the
// blur, lets remove and replace with a very subtle lift instead"). It marks the card's row (`data-on`);
// Work.module.css does the rest. Scrolling settles it until the page is still again, as in the lab, so cards passing
// under a still pointer don't bob. Off a card, it settles straight away (Noah, Oct 29: "not liking the hesitation when
// i unhover"). Only cards that open a case study; one coming soon isn't a link.
export function CardLift() {
  useEffect(() => {
    let pointer: { x: number; y: number } | null = null;
    let row: HTMLElement | null = null;
    let scrolling = false;
    let idle = 0;

    const apply = (next: HTMLElement | null) => {
      if (next === row) return;
      row?.removeAttribute("data-on");
      row = next;
      row?.setAttribute("data-on", "");
    };
    const under = () => {
      const el = pointer && document.elementFromPoint(pointer.x, pointer.y);
      return el?.closest("#work [data-card]")?.closest<HTMLElement>("li") ?? null;
    };
    const focus = () => apply(under());

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = { x: event.clientX, y: event.clientY };
      if (!scrolling) focus();
    };
    const out = () => {
      pointer = null;
      apply(null);
    };
    // While the page moves, no card is lifted. Once it has been still for a moment, whatever the pointer rests on is.
    const scroll = () => {
      scrolling = true;
      apply(null);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        scrolling = false;
        focus();
      }, SETTLE);
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", out);
    window.addEventListener("blur", out);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", out);
      window.removeEventListener("blur", out);
      window.removeEventListener("scroll", scroll);
      window.clearTimeout(idle);
      apply(null);
    };
  }, []);

  return null;
}
