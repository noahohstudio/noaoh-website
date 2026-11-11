"use client";

import { useEffect, useRef, useState } from "react";
import { opening } from "./data";
import { Keep } from "./Keep";
import styles from "./JokeLead.module.css";

/*
  Home's line, with Noah's joke in it (Nov 9: "when you hover over my header, what if it blurs out/in very subtly, and
  rewords into "Just kidding." "He has no idea what he's doing." Maybe two different lines/fades? Or just one. Lets try
  both"). Rest the pointer on the line and it goes soft and comes back reworded; move off and the real line comes back
  the same way. `two`: "Just kidding.", then a moment later "He has no idea what he's doing." on the line under it,
  and both stay while the pointer does (Noah, Nov 9: "make the time between just kidding and he has no idea shorter so
  that it flows a little nicer, and have he has no idea appear a line under "Just kidding.", keeping both for as long
  as the user hovers"); `one`: straight to the second. The real line always holds the space and is what screen readers
  get; the joke is drawn over it, hidden from them. Not on touch, which has no hover. With reduced motion the words
  change without the blur.
*/

export type JokeMode = "one" | "two";

const KIDDING = "Just kidding.";
const NO_IDEA = "He has no idea what he's doing.";
const HALF = 180; // ms, going soft, then the same coming back: a swap takes 360ms
// ms "Just kidding." holds alone before the second line comes in under it: a comic's pause, long enough to read it and
// believe it, short enough not to wait for (Noah, Nov 9: "a little more time before he has no idea appears. It needs to
// flow in a natural way"; it was 400)
const BEAT = 750;

export function JokeLead({ className, mode = "two" }: { className?: string; mode?: JokeMode }) {
  const [face, setFace] = useState<string[] | null>(null); // the joke's lines showing, or null for the real line
  const [soft, setSoft] = useState(false); // mid-swap
  const current = useRef<string[] | null>(null);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => clear, []);

  // Soft, change the words at the softest point, then sharp again
  const swap = (next: string[] | null) => {
    current.current = next;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSoft(false);
      setFace(next);
      return;
    }
    setSoft(true);
    later(HALF, () => {
      setFace(next);
      setSoft(false);
    });
  };

  const enter = (event: React.PointerEvent) => {
    if (event.pointerType === "touch") return;
    clear();
    if (mode === "one") return swap([NO_IDEA]);
    swap([KIDDING]);
    // The second line comes in under the first, which stays put: only the new line resolves (JokeLead.module.css)
    later(HALF * 2 + BEAT, () => {
      current.current = [KIDDING, NO_IDEA];
      setFace(current.current);
    });
  };

  const leave = (event: React.PointerEvent) => {
    if (event.pointerType === "touch") return;
    clear();
    if (current.current === null && face === null && !soft) return;
    swap(null);
  };

  return (
    <h1
      className={`${className ?? ""} ${styles.lead}`}
      data-text="statement"
      data-soft={soft || undefined}
      onPointerEnter={enter}
      onPointerLeave={leave}
    >
      <span className={styles.real} data-away={face !== null || undefined}>
        {opening.name}
        <Keep text={opening.rest} />
      </span>
      <span className={styles.joke} aria-hidden="true">
        {face?.map((line, i) => (
          <span key={line} className={styles.jokeLine} data-late={i > 0 || undefined}>
            {line}
          </span>
        ))}
      </span>
    </h1>
  );
}
