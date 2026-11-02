"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { GlassPiece } from "@/content/site";
import { Letters } from "./Flip";
import { GlassField, type Rect } from "./GlassField";
import styles from "./NameLander.module.css";

export type LanderVariant = "echo" | "ledger" | "stack";

const GAP = 0.2; // between two circles, a share of one circle's width: enough that their square boxes, which the glass
// collides by, don't overlap (under 0.155 they do, and nudge each other off their homes)
const NAME_RIPPLE = { step: 80, hold: 560, rest: 240 }; // ms: the name's letters, a beat apart, each over this long

// Three circles of one size in a triangle, one on top and two under it, as big as fits the box. It sits on the
// box's floor, at its start, middle or end. Returned relative to `origin`, the lander, where the glass lives.
function triangle(box: DOMRect, origin: DOMRect, align: "start" | "center" | "end"): Rect[] {
  const k = Math.sqrt(3) / 2;
  const d = Math.max(0, Math.min(box.width / (2 + GAP), box.height / (1 + (1 + GAP) * k)));
  const s = d * (1 + GAP); // from one circle's center to the next
  const width = 2 * d + d * GAP;
  const height = d + s * k;
  const left = align === "end" ? box.right - width : align === "start" ? box.left : box.left + (box.width - width) / 2;
  const x = left - origin.left;
  const y = box.bottom - height - origin.top;
  return [
    { x: x + (width - d) / 2, y, w: d, h: d },
    { x, y: y + s * k, w: d, h: d },
    { x: x + s, y: y + s * k, w: d, h: d },
  ];
}

// The lander as one main moment, then supporting text, in the footer's manner (Noah, Oct 28: "Lets do Noah in the same
// font size, weight, and spacing as the footer, continuing to allow the flipping over the characters, then the rest
// underneathe it? Kind of brutalist. Doesn't have to fill the viewport. Lets change the shapes into circles for now,
// and align them into a triangular formation, same functions"). The sentence's first word is set as big as the
// footer's count, and the rest of the sentence carries on under it. The glass is three circles in a triangle that can
// still be picked up and thrown. Three ways to arrange it, for Review:
//   echo: the footer's count, mirrored: the name, the circles beside it, the rest flush right under it
//   ledger: the name over a heavy rule, then the footer's four columns: the circles, then the rest across three
//   stack: the rest under the name in its own heavy weight, and the circles low on the right, where the words end
export function NameLander({
  sentence,
  glass,
  variant,
  align = "right",
  uid,
}: {
  sentence: string;
  glass: GlassPiece[];
  variant: LanderVariant;
  align?: "left" | "right"; // echo: the rest of the sentence flush right, as the count's caption, or flush left
  uid?: string; // keeps each lander's lenses apart when several share a page (Review); alone, the glass keeps its own
  // names, so the "bauhaus" easter egg still knows the blue circle, the red square and the yellow triangle
}) {
  const [first, ...others] = sentence.split(/[\s ]+/);
  const rest = others.join(" ");
  const pieces = uid ? glass.map((piece) => ({ ...piece, id: `${uid}-${piece.id}` })) : glass;

  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const boxRef = useRef<HTMLSpanElement>(null);
  const [homes, setHomes] = useState<Rect[] | null>(null);
  const [size, setSize] = useState(0);
  const [away, setAway] = useState<boolean[]>(() => glass.map(() => false));
  // Where the circles live: the biggest triangle that fits their box, measured again whenever the lander changes size
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const box = boxRef.current;
    const name = nameRef.current;
    if (!section || !box || !name) return;
    const align = variant === "ledger" ? "start" : "end";
    const place = () => {
      const next = triangle(box.getBoundingClientRect(), section.getBoundingClientRect(), align);
      setSize(parseFloat(getComputedStyle(name).fontSize));
      setHomes((prev) =>
        prev && prev.every((h, i) => Math.abs(h.x - next[i].x) < 0.5 && Math.abs(h.y - next[i].y) < 0.5 && Math.abs(h.w - next[i].w) < 0.5)
          ? prev
          : next,
      );
    };
    let active = true;
    document.fonts?.ready.then(() => active && place());
    place();
    const observer = new ResizeObserver(place);
    observer.observe(section);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [variant]);

  // Easter egg, as on the lander before: click your name in the nav and a ripple of mirrored letters runs through.
  // The name's letters turn over a beat apart and stay over longer, so it reads (Noah, Oct 28: ""noah" could have a
  // little longer of an effect when the top left is clicked on?"); the rest ripples quickly after them.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let timer = 0;
    const ripple = (event: Event) => {
      if ((event as CustomEvent).detail !== "name") return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const name = [...section.querySelectorAll<HTMLElement>("h1 [data-glyph]")];
      const rest = [...section.querySelectorAll<HTMLElement>("p [data-glyph]")];
      name.forEach((glyph, i) => glyph.style.setProperty("--ripple-delay", `${i * NAME_RIPPLE.step}ms`));
      rest.forEach((glyph, i) => glyph.style.setProperty("--ripple-delay", `${NAME_RIPPLE.rest + i * 14}ms`));
      section.removeAttribute("data-ripple");
      void section.offsetWidth;
      section.setAttribute("data-ripple", "");
      window.clearTimeout(timer);
      const over = Math.max(name.length * NAME_RIPPLE.step + NAME_RIPPLE.hold, NAME_RIPPLE.rest + rest.length * 14 + 220);
      timer = window.setTimeout(() => section.removeAttribute("data-ripple"), over + 80);
    };
    window.addEventListener("noaoh:egg", ripple);
    return () => {
      window.removeEventListener("noaoh:egg", ripple);
      window.clearTimeout(timer);
    };
  }, []);

  const onAway = useCallback((flags: boolean[]) => setAway(flags), []);
  // On the home page the circles roam past the lander, down to just above the first project card (Noah, Oct 29: "the
  // orbs should be able to move around until just above the case study preview cards"); elsewhere, the lander itself
  const floor = useCallback(() => {
    const section = sectionRef.current;
    const card = document.querySelector("#work li");
    if (!section) return 0;
    if (!card) return section.offsetHeight;
    return Math.max(section.offsetHeight, card.getBoundingClientRect().top - section.getBoundingClientRect().top - 12);
  }, []);
  const box = <span ref={boxRef} className={styles.box} aria-hidden="true" />;
  const name = (
    <h1 ref={nameRef} className={styles.name} data-exact>
      <span className="visually-hidden">{sentence.replace(/ /g, " ")}</span>
      <span aria-hidden="true">
        <Letters text={first} />
      </span>
    </h1>
  );
  const words = (
    <p className={styles.rest} aria-hidden="true" data-exact={variant === "stack" || undefined}>
      <Letters text={rest} />
    </p>
  );

  return (
    <section
      ref={sectionRef}
      className={styles.lander}
      data-variant={variant}
      data-align={align}
      aria-label="Introduction"
      style={
        {
          "--size": `${size}px`,
        } as CSSProperties
      }
    >
      <div className={styles.measure}>
        {variant === "echo" && (
          <>
            <div className={styles.top}>
              {name}
              {box}
            </div>
            {words}
          </>
        )}
        {variant === "ledger" && (
          <>
            {name}
            <div className={styles.grid}>
              {box}
              {words}
            </div>
          </>
        )}
        {variant === "stack" && (
          <>
            {name}
            <div className={styles.base}>
              {words}
              {box}
            </div>
          </>
        )}
      </div>

      {/* Where each circle goes back to: a well that shows first as the page opens, and while it's away */}
      {homes?.map((home, i) => (
        <span
          key={i}
          className={styles.home}
          data-empty={away[i] || undefined}
          aria-hidden="true"
          style={{ left: home.x, top: home.y, width: home.w, height: home.h, "--line": i } as CSSProperties}
        />
      ))}

      {homes && homes[0].w > 0 && (
        <GlassField
          pieces={pieces}
          homes={homes}
          lines={pieces.map((_, i) => i)}
          radius={homes[0].w / 2}
          sectionRef={sectionRef}
          onAway={onAway}
          clickToPop
          entrance="fade"
          floor={floor}
        />
      )}
    </section>
  );
}
