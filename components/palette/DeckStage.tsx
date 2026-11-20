"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import styles from "./DeckStage.module.css";

// Palit's finals deck as a piece you click through (Palit 9, F "on stage", Noah, Nov 18: "Lets make it interactive, its
// ready to ship"). It keeps the approved loop's language: the slides on one still stage with a soft shadow and a
// hairline, each change a fade-through (the old slide out in 120 ms, then the new one in over 220 ms with a small lift,
// never both at once), and a light-gray line under the stage that fills as you go (Noah, Nov 18, on its length: "a little
// bigger or longer, same width").
// Click or tap the right of the stage for the next slide and the left third for the one before; swipe; or, with the stage
// focused, use the arrow keys. The keys listen on the stage only, so nothing else on the page is taken over. Over the
// stage the pointer stays the system's own (Noah, Nov 19: "lets keep the default cursor for left or right, instead of the
// custom arrow with the circle. It's quite large").
// A slide's `src` is its smallest file (`/work/palette/deck/s010-1600.webp`), so the case-study check can find it; the
// rest of its set (each width in `widths`, AVIF and WebP) sits beside it under the same name.
export type DeckSlide = { src: string; n: number; alt: string };
const stem = (src: string) => src.replace(/-\d+\.(?:webp|avif|jpg|png)$/, "");

const BACK = 0.3; // the left share of the stage that goes back

export function DeckStage({ slides, widths, label }: { slides: DeckSlide[]; widths: number[]; label?: string }) {
  const [at, setAt] = useState(0);
  const down = useRef<{ x: number; y: number } | null>(null);
  const count = slides.length;


  const go = useCallback((step: number) => setAt((i) => (i + step + count) % count), [count]);

  // the next slide is fetched ahead, so a click never waits on the network
  useEffect(() => {
    const next = slides[(at + 1) % count];
    const img = new Image();
    img.src = `${stem(next.src)}-${widths[0]}.webp`;
  }, [at, count, slides, widths]);

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      go(1);
    } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      go(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setAt(count - 1);
    }
  };

  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    down.current = { x: event.clientX, y: event.clientY };
  };
  const onUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = down.current;
    down.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1); // a swipe: to the left moves on, as a page turns
      return;
    }
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) return; // a drag that wasn't a swipe does nothing
    const box = event.currentTarget.getBoundingClientRect();
    go(event.clientX - box.left < box.width * BACK ? -1 : 1); // the left third goes back, the rest goes on
  };

  // how far through these slides you are (the appendix's slides are numbered past the talk's 67, so not the talk's place)
  const fill = (at + 1) / count;
  const set = (src: string, type: string) => widths.map((w) => `${stem(src)}-${w}.${type} ${w}w`).join(", ");

  return (
    <div className={styles.deck}>
      <div
        className={styles.stage}
        role="group"
        aria-roledescription="slides"
        aria-label={label ?? "Slides"}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={() => (down.current = null)}
      >
        {slides.map((slide, i) => (
          <picture key={slide.src} className={styles.slide} data-on={i === at || undefined} aria-hidden={i !== at}>
            <source type="image/avif" srcSet={set(slide.src, "avif")} sizes="86vw" />
            <img
              src={`${stem(slide.src)}-${widths[0]}.webp`}
              srcSet={set(slide.src, "webp")}
              sizes="86vw"
              alt={i === at ? slide.alt : ""}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
            />
          </picture>
        ))}
      </div>
      <div className={styles.line} aria-hidden="true">
        <span style={{ transform: `scaleX(${fill})` }} />
      </div>
      <p className={styles.status} aria-live="polite">
        {`Slide ${at + 1} of ${count}`}
      </p>
    </div>
  );
}
