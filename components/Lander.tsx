"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { GlassPiece } from "@/content/site";
import { TRACK, layoutSentence, type Layout } from "@/lib/justify";
import { Letters } from "./Flip";
import { GlassField, type Rect } from "./GlassField";
import styles from "./Lander.module.css";

const GAP = 0.22; // em between words, close to Geist's own word space
const SLOT = 1.6; // em, the narrowest a glass piece gets
const LINE_HEIGHT = 1; // matches --leading-display

// Units the lines can break between: single words, or words bound with a
// no-break space (like "noah oh").
const toUnits = (sentence: string) =>
  sentence
    .split(" ")
    .filter(Boolean)
    .map((unit) => unit.split(" "));

const sameLayout = (a: Layout | null, b: Layout) =>
  !!a &&
  a.size === b.size &&
  a.rows.length === b.rows.length &&
  a.rows.every(
    (row, i) =>
      row.units.join() === b.rows[i].units.join() && row.piece === b.rows[i].piece && row.stretch === b.rows[i].stretch,
  );

// One sentence that fills the first screen at one even size, in clean,
// justified lines. Glass pieces fill the lines that need it, and visitors can
// pick them up and throw them around.
export function Lander({ sentence, glass }: { sentence: string; glass: GlassPiece[] }) {
  const units = useMemo(() => toUnits(sentence), [sentence]);

  const sectionRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const widths = useRef<number[] | null>(null); // em width of every word, in reading order
  const [layout, setLayout] = useState<Layout | null>(null);
  const [homes, setHomes] = useState<Rect[] | null>(null);
  const [away, setAway] = useState<boolean[]>(() => glass.map(() => false));

  // Measure every word once in the browser's own flow, then set the lines ourselves.
  useEffect(() => {
    const section = sectionRef.current;
    const screen = screenRef.current;
    const text = textRef.current;
    if (!section || !screen || !text) return;
    let active = true;

    const update = () => {
      const em = widths.current;
      if (!em) return;
      let w = 0;
      const unitWidths = units.map((words) => words.reduce((sum, _, k) => sum + em[w++] + (k ? GAP : 0), 0));
      const { paddingTop, paddingBottom } = getComputedStyle(section);
      const next = layoutSentence({
        widths: unitWidths,
        letters: units.map((words) => words.reduce((sum, word) => sum + Array.from(word).length, 0)),
        gaps: units.map((words) => words.length - 1),
        pieces: glass.length,
        slot: SLOT,
        gap: GAP,
        width: text.clientWidth,
        height: screen.offsetHeight - parseFloat(paddingTop) - parseFloat(paddingBottom),
        lineHeight: LINE_HEIGHT,
      });
      if (next) setLayout((prev) => (sameLayout(prev, next) ? prev : next));
    };

    const measure = async () => {
      await document.fonts?.ready;
      const family = getComputedStyle(text).fontFamily.split(",")[0];
      await document.fonts?.load(`600 100px ${family}`).catch(() => undefined);
      if (!active) return;
      const size = parseFloat(getComputedStyle(text).fontSize);
      widths.current = Array.from(
        text.querySelectorAll<HTMLElement>("[data-word]"),
        (el) => el.getBoundingClientRect().width / size,
      );
      update();
    };
    measure();

    const observer = new ResizeObserver(update);
    observer.observe(screen);
    observer.observe(text);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [units, glass.length]);

  // Easter egg: click your name in the nav while on the lander, and a ripple of
  // mirrored letters runs through the sentence.
  useEffect(() => {
    const text = textRef.current;
    if (!text) return;
    let timer = 0;
    const ripple = (event: Event) => {
      if ((event as CustomEvent).detail !== "name") return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const glyphs = text.querySelectorAll<HTMLElement>("[data-glyph]");
      glyphs.forEach((glyph, i) => glyph.style.setProperty("--ripple-delay", `${i * 14}ms`));
      text.removeAttribute("data-ripple");
      void text.offsetWidth; // restart it if it's already running
      text.setAttribute("data-ripple", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => text.removeAttribute("data-ripple"), glyphs.length * 14 + 300);
    };
    window.addEventListener("noaoh:egg", ripple);
    return () => {
      window.removeEventListener("noaoh:egg", ripple);
      window.clearTimeout(timer);
    };
  }, []);

  // Where each glass piece lives: its spot in the text, relative to the section.
  useLayoutEffect(() => {
    const text = textRef.current;
    if (!layout || !text) return;
    const place = () =>
      setHomes(
        Array.from(text.querySelectorAll<HTMLElement>("[data-slot]"))
          .sort((a, b) => Number(a.dataset.slot) - Number(b.dataset.slot))
          .map((el) => ({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight })),
      );
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [layout]);

  // The sentence only re-renders when the lines change or a piece leaves or
  // returns home, not on every pixel of a drag.
  const awayKey = away.map(Number).join("");
  const words = useMemo(() => {
    const word = (text: string, key: string) => <Letters key={key} text={text} />;
    // A layout from before the sentence changed (while editing) doesn't apply
    const current = layout?.rows.every((row) => row.units.every((u) => u < units.length));

    if (!layout || !current) {
      return (
        <span aria-hidden="true">
          {units.map((unit, u) => (
            <Fragment key={u}>
              {u > 0 && " "}
              <span className={styles.bind}>
                {unit.map((text, k) => (
                  <Fragment key={k}>
                    {k > 0 && " "}
                    {word(text, `${u}-${k}`)}
                  </Fragment>
                ))}
              </span>
            </Fragment>
          ))}
        </span>
      );
    }

    return (
      <span aria-hidden="true" className={styles.rows}>
        {layout.rows.map((row, r) => {
          const items = row.units.flatMap((u) => units[u].map((text, k) => word(text, `${u}-${k}`)));
          if (row.piece !== null) {
            // The piece sits after the line's first unit, or at its end
            const at = row.units.length > 1 ? units[row.units[0]].length : items.length;
            items.splice(
              at,
              0,
              <span
                key={`slot-${row.piece}`}
                className={styles.slot}
                data-slot={row.piece}
                data-empty={awayKey[row.piece] === "1" || undefined}
              />,
            );
          }
          return (
            <span
              key={r}
              className={styles.row}
              data-mode={row.mode}
              style={
                {
                  "--line": r, // its turn as the sentence rises in
                  ...(row.mode === "justify"
                    ? {
                        // Share the line's spare width between letters and word gaps
                        letterSpacing: `calc(var(--tracking-tight) + ${(TRACK * row.stretch).toFixed(4)}em)`,
                        columnGap: `${(GAP * (1 + row.stretch)).toFixed(4)}em`,
                      }
                    : {}),
                } as React.CSSProperties
              }
            >
              {items}
            </span>
          );
        })}
      </span>
    );
  }, [layout, awayKey, units]);

  // The line each piece of glass sits in, so it rises in with that line
  const lines = useMemo(() => {
    const at: number[] = [];
    layout?.rows.forEach((row, r) => {
      if (row.piece !== null) at[row.piece] = r;
    });
    return at;
  }, [layout]);

  return (
    <section
      ref={sectionRef}
      className={styles.lander}
      aria-label="Introduction"
      style={layout ? ({ "--size": `${layout.size}px` } as React.CSSProperties) : undefined}
    >
      <span ref={screenRef} className={styles.screen} aria-hidden="true" />

      <div className="shell">
        <h1 ref={textRef} className={styles.sentence} data-ready={layout && homes ? "true" : undefined} data-exact>
          <span className="visually-hidden">{sentence.replace(/ /g, " ")}</span>
          {words}
        </h1>
      </div>

      {layout && homes && (
        <GlassField
          pieces={glass}
          homes={homes}
          lines={lines}
          radius={layout.size * 0.14}
          sectionRef={sectionRef}
          onAway={setAway}
        />
      )}
    </section>
  );
}
