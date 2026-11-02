"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { FlipText } from "./Flip";
import styles from "./SectionDial.module.css";

type Item = { id: string; title: string };

const LINE = 0.35; // a section is current once its top passes this far down the screen, as on the home page
const REACH = 150; // px from the center at which a label has turned, faded and blurred all the way
const TURN = 42; // degrees a label turns at the edge, like the face of a drum

// The case study's sections as a dial in the middle of the nav, after Roy's chapters. The one
// you're reading sits in the center, and the rest turn away to either side, fading and blurring
// the further they are. Click one to go there, or slide the dial (drag it, or swipe sideways on a
// trackpad) and let go: it settles on the nearest section and takes you there. The arrow keys are
// left alone, since they belong to the Konami code.
export function SectionDial({ items }: { items: Item[] }) {
  const dial = useRef<HTMLElement>(null);
  const labels = useRef<(HTMLAnchorElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [focused, setFocused] = useState<number | null>(null); // a label reached with the keyboard turns to the center
  const [centers, setCenters] = useState<number[]>([]); // each label's center along the strip
  const [slide, setSlide] = useState<number | null>(null); // how far it's been slid, while sliding
  const press = useRef<{ x: number; moved: boolean } | null>(null);
  const slid = useRef(false); // a slide just ended, so the click it ends on isn't followed
  const live = useRef({ centers, current, slide });
  live.current = { centers, current, slide };

  useEffect(() => {
    const measure = () => setCenters(labels.current.map((a) => (a ? a.offsetLeft + a.offsetWidth / 2 : 0)));
    measure();
    const observer = new ResizeObserver(measure);
    labels.current.forEach((a) => a && observer.observe(a));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const pick = () => {
      const line = window.innerHeight * LINE;
      let index = 0;
      items.forEach((item, i) => {
        const top = document.getElementById(item.id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) index = i;
      });
      setCurrent(index);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [items]);

  // Lets go of a slide: settles on the section nearest the center and goes there
  const settle = () => {
    const { centers: at, current: from, slide: by } = live.current;
    setSlide(null);
    if (by === null || !at.length) return;
    const center = at[from] - by;
    const index = at.reduce((best, c, i) => (Math.abs(c - center) < Math.abs(at[best] - center) ? i : best), 0);
    if (index === from) return;
    setCurrent(index);
    document.getElementById(items[index].id)?.scrollIntoView({ block: "start" });
  };

  const settling = useRef(settle);
  settling.current = settle;

  // A sideways swipe on a trackpad slides it too; up and down still scroll the page
  useEffect(() => {
    const el = dial.current;
    if (!el) return;
    let timer = 0;
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      setSlide((by) => (by ?? 0) - event.deltaX);
      clearTimeout(timer);
      timer = window.setTimeout(() => settling.current(), 140);
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheel);
      clearTimeout(timer);
    };
  }, []);

  const down = (event: PointerEvent) => {
    if (event.button === 0) press.current = { x: event.clientX, moved: false };
  };
  const move = (event: PointerEvent) => {
    const p = press.current;
    if (!p) return;
    const by = event.clientX - p.x;
    if (!p.moved && Math.abs(by) < 4) return;
    if (!p.moved) {
      p.moved = true;
      dial.current?.setPointerCapture(event.pointerId);
    }
    setSlide(by);
  };
  const up = () => {
    const moved = press.current?.moved;
    press.current = null;
    if (!moved) return;
    slid.current = true;
    setTimeout(() => (slid.current = false), 0);
    settle();
  };
  const click = (event: MouseEvent) => {
    if (!slid.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const center = (centers[focused ?? current] ?? 0) - (slide ?? 0);

  return (
    <nav
      ref={dial}
      className={styles.dial}
      aria-label="Sections"
      data-ready={centers.length ? "" : undefined}
      data-sliding={slide !== null || undefined}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onClickCapture={click}
      onScroll={(event) => (event.currentTarget.scrollLeft = 0)}
    >
      <div className={styles.track} style={{ transform: `translateX(${-center}px)` }}>
        {items.map((item, i) => {
          const t = Math.max(-1, Math.min(1, ((centers[i] ?? 0) - center) / REACH));
          const far = Math.abs(t);
          return (
            <a
              key={item.id}
              ref={(a) => {
                labels.current[i] = a;
              }}
              href={`#${item.id}`}
              draggable={false}
              aria-current={i === current ? "location" : undefined}
              onFocus={(event) => event.currentTarget.matches(":focus-visible") && setFocused(i)}
              onBlur={() => setFocused(null)}
              onClick={() => setFocused(null)}
              style={{
                opacity: 1 - far * 0.7,
                filter: far > 0.01 ? `blur(${(far * 2.2).toFixed(2)}px)` : undefined,
                transform: `perspective(260px) rotateY(${(t * TURN).toFixed(1)}deg) translateZ(${(-far * 10).toFixed(1)}px)`,
              }}
            >
              <FlipText text={item.title} />
            </a>
          );
        })}
      </div>
    </nav>
  );
}
