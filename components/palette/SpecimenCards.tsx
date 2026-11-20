"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./SpecimenCards.module.css";

// Palit's specimen cards as the piece itself, in place of their loop (Noah, Nov 18: "Specimen card should not be video.
// Instead, they should just be interactive cards that depict exactly what the video is depicting"). The loop's board,
// 1280 x 720, scaled to the box: four of Palit v3's own cards, whole, two by two. Click one (or Enter on it) and it lifts
// out of its place to the middle while the others blur and dim a touch behind it, inside the box only; its ×, Esc, a click
// outside it, or Enter again puts it back. The motion is the loop's critically damped spring, with no overshoot.
// A card's `src` is its smallest file (`/work/palette/cards/teal-880.webp`), so the case-study check can find it; the rest
// of its set (each width in `widths`, AVIF and WebP) sits beside it under the same name.
export type SpecimenCard = { src: string; alt: string; label: string };

const stem = (src: string) => src.replace(/-\d+\.(?:webp|avif|jpg|png)$/, "");

export function SpecimenCards({ cards, widths }: { cards: SpecimenCard[]; widths: number[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const last = useRef<number | null>(null);

  // Esc closes the open card; focus goes back to the card that was opened
  useEffect(() => {
    if (open === null) {
      if (last.current !== null) buttons.current[last.current]?.focus({ preventScroll: true });
      return;
    }
    last.current = open;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const set = (src: string, type: string) => widths.map((w) => `${stem(src)}-${w}.${type} ${w}w`).join(", ");

  return (
    <div className={styles.board}>
      <ul className={styles.grid} aria-label="Four colors, each with its specimen card">
        {cards.map((card, i) => {
          const isOpen = open === i;
          return (
            <li key={card.src}>
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                className={styles.spec}
                data-at={i}
                data-open={isOpen || undefined}
                aria-expanded={isOpen}
                aria-label={card.label}
                inert={open !== null && !isOpen}
                onClick={(event) => {
                  if (!isOpen) return setOpen(i);
                  // open: its × closes it, and so does Enter or Space from the keyboard (a click with no pointer)
                  const onX = (event.target as HTMLElement).dataset.x !== undefined;
                  if (onX || event.detail === 0) setOpen(null);
                }}
              >
                <picture>
                  <source type="image/avif" srcSet={set(card.src, "avif")} sizes="(min-width: 720px) 70vw, 100vw" />
                  <img
                    src={`${stem(card.src)}-${widths[0]}.webp`}
                    srcSet={set(card.src, "webp")}
                    sizes="(min-width: 720px) 70vw, 100vw"
                    alt={card.alt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </picture>
                <span className={styles.x} data-x="" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.scrim} data-on={open !== null || undefined} onClick={() => setOpen(null)} aria-hidden="true" />
    </div>
  );
}
