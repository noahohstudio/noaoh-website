"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { Media } from "./Media";
import { FlipText } from "./Flip";
import { Reveal } from "./Reveal";
import styles from "./Lab.module.css";

const GAP = 24; // px between a piece and the note beside it
const SETTLE = 180; // ms without scrolling before the page counts as still

type Spot = { i: number; x: number; y: number; side: "left" | "right" };

// Only real pieces: a placeholder never goes live
const PIECES = site.lab.filter((piece) => piece.src || piece.video);

// Experiments and side projects, in two loose columns of different heights.
// Rest the pointer on one while the page is still, and everything else goes
// soft and faint, and a note about it appears beside it, following the pointer
// down the piece. Scrolling clears it until the page settles again.
export function Lab() {
  const section = useRef<HTMLElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const scrolling = useRef(false);
  const [spot, setSpot] = useState<Spot | null>(null); // kept after the pointer leaves, so the note fades out whole
  const [on, setOn] = useState(false);
  const wasOn = useRef(false);
  const item = spot ? PIECES[spot.i] : null;

  useEffect(() => {
    wasOn.current = on;
  }, [on]);

  // Focus the piece under the pointer
  const focus = useCallback(() => {
    const box = section.current?.getBoundingClientRect();
    const at = pointer.current;
    if (!box || !at || scrolling.current) return;
    const i = items.current.findIndex((el) => {
      const r = el?.getBoundingClientRect();
      return r && at.x >= r.left && at.x <= r.right && at.y >= r.top && at.y <= r.bottom;
    });
    const tile = items.current[i]?.getBoundingClientRect();
    if (!tile) return;
    // A piece in the left column gets its note on the right, and the other way round
    const right = tile.left + tile.width / 2 < box.left + box.width / 2;
    setSpot({
      i,
      x: right ? tile.right - box.left + GAP : tile.left - box.left - GAP,
      y: Math.max(tile.top - box.top, Math.min(at.y - box.top - 32, tile.bottom - box.top - 140)),
      side: right ? "right" : "left",
    });
    setOn(true);
  }, []);

  // While the page moves, nothing is in focus. Once it has been still for a
  // moment, whatever the pointer rests on comes into focus.
  useEffect(() => {
    let idle = 0;
    const scroll = () => {
      scrolling.current = true;
      setOn(false);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        scrolling.current = false;
        focus();
      }, SETTLE);
    };
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", scroll);
      window.clearTimeout(idle);
    };
  }, [focus]);

  return (
    <section ref={section} className={styles.lab} aria-labelledby="lab-title">
      <h1 id="lab-title" className="visually-hidden">
        Lab
      </h1>
      <ul
        className={styles.grid}
        data-active={on ? "" : undefined}
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse") return;
          pointer.current = { x: event.clientX, y: event.clientY };
          focus();
        }}
        onPointerLeave={() => {
          pointer.current = null;
          setOn(false);
        }}
      >
        {PIECES.map((piece, i) => (
          <li
            key={piece.title}
            ref={(el) => {
              items.current[i] = el;
            }}
            className={styles.item}
            data-on={(on && spot?.i === i) || undefined}
          >
            {/* Comes in quietly as it first shows; inside the tile, so it never meets the spotlight's fade */}
            <Reveal className={styles.tile}>
              <Media media={{ ratio: piece.ratio, src: piece.src, video: piece.video, alt: piece.title }} />
              <p className={styles.caption}>
                <FlipText text={piece.title} />{" "}
                <span className={styles.muted}>
                  <FlipText text={piece.context} />
                </span>
              </p>
            </Reveal>
          </li>
        ))}
      </ul>
      <div
        className={styles.note}
        aria-hidden="true"
        data-on={on ? "" : undefined}
        data-side={spot?.side}
        data-entering={on && !wasOn.current ? "" : undefined}
        style={spot ? ({ "--x": `${spot.x}px`, "--y": `${spot.y}px` } as React.CSSProperties) : undefined}
      >
        {item && (
          <>
            <p className={styles.noteTitle}>{item.title}</p>
            <p className={styles.muted}>{item.context}</p>
            <p className={styles.noteBody}>{item.note}</p>
          </>
        )}
      </div>
    </section>
  );
}
