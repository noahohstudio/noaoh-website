"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Letters } from "./Flip";
import styles from "./CaseStudy.module.css";

const ROOM_MS = 450; // the page moves down to make room
const FADE_IN_MS = 320; // then the details settle in, one line after another
const STEP_MS = 70; // the beat between one line and the next
const FADE_OUT_MS = 160;
const ERASE_MS = 45; // the label retypes itself: each letter of the old word goes, last first
const TYPE_MS = 70; // then each of the new word's comes, turning over as it lands

const token = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

// "Read more": centered on a hairline across the column, after Roy's. Opening it, first the page moves down smoothly
// to make room, then the details fade in one line after another, each rising a little (Noah, Oct 26: "a subtle
// subsequent fade in for the elements under "read more" whenever it is opened").
// Closing runs the other way round. Underneath it's a plain <details>, so it still opens
// without JavaScript, and with reduced motion it simply opens.
// Open, it says "Read less" (Noah, Oct 28: "When opened, "Read more" should change to "Read less" subtly"), and it
// turns back as closing starts, like the sign. It retypes itself (Noah: "lets just make read more/less retype itself,
// flipping the characters as they reappear"): "more" is erased back to "Read", then "less" is typed in, each letter
// turning over for a beat as it lands, as the count's do. A letter turn alone, then a cross-fade, were tried first. The
// word keeps the room of the wider one, so the sign beside it holds still. Never as the page loads; with reduced
// motion the word simply changes.
export function ReadMore({ children }: { children: ReactNode }) {
  const details = useRef<HTMLDetailsElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState("more"); // the word as typed so far
  const [typed, setTyped] = useState(false); // it has retyped at least once, so a letter landing may turn over
  const shown = useRef("more");

  useEffect(() => {
    const goal = open ? "less" : "more";
    const show = (next: string) => {
      shown.current = next;
      setWord(next);
    };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show(goal);
      return;
    }
    let timer = 0;
    const step = () => {
      const now = shown.current;
      if (now === goal) return;
      const typing = goal.startsWith(now);
      if (!typing && now.length === 1) setTyped(true);
      show(typing ? goal.slice(0, now.length + 1) : now.slice(0, -1));
      timer = window.setTimeout(step, goal.startsWith(shown.current) ? TYPE_MS : ERASE_MS);
    };
    timer = window.setTimeout(step, ERASE_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  async function toggle(event: MouseEvent<HTMLElement>) {
    const el = details.current;
    const inner = body.current;
    if (!el || !inner || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    const room = token("--ease-flip", "ease-in-out");
    const settle = token("--ease", "ease-out");

    try {
      if (!el.open) {
        inner.style.overflow = "hidden";
        inner.style.opacity = "0";
        inner.style.height = "0px";
        el.open = true;
        const grow = inner.animate([{ height: "0px" }, { height: `${inner.scrollHeight}px` }], {
          duration: ROOM_MS,
          easing: room,
          fill: "forwards",
        });
        await grow.finished;
        inner.style.height = "";
        inner.style.overflow = "";
        grow.cancel();
        // Each line in turn: a note's label and text together, or a heading between notes
        const lines = [...inner.querySelectorAll<HTMLElement>("dl > div, :scope > p")];
        const shows = (lines.length ? lines : [inner]).map((line, i) =>
          line.animate(
            [
              { opacity: 0, transform: "translateY(4px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: FADE_IN_MS, delay: i * STEP_MS, easing: settle, fill: "both" },
          ),
        );
        inner.style.opacity = "";
        await Promise.all(shows.map((show) => show.finished));
        shows.forEach((show) => show.cancel());
      } else {
        el.dataset.closing = "";
        setOpen(false);
        const hide = inner.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: FADE_OUT_MS,
          easing: "ease-in",
          fill: "forwards",
        });
        await hide.finished;
        inner.style.overflow = "hidden";
        const shrink = inner.animate([{ height: `${inner.offsetHeight}px` }, { height: "0px" }], {
          duration: ROOM_MS,
          easing: room,
          fill: "forwards",
        });
        await shrink.finished;
        el.open = false;
        delete el.dataset.closing;
        inner.style.overflow = "";
        hide.cancel();
        shrink.cancel();
      }
    } catch {
      // An animation was cut short, for example by leaving the page. Nothing to undo.
    } finally {
      busy.current = false;
    }
  }

  return (
    <details
      ref={details}
      className={styles.more}
      onToggle={(event) => setOpen(event.currentTarget.open && !event.currentTarget.dataset.closing)}
    >
      <summary onClick={toggle}>
        <span className={styles.moreLabel}>
          <span>
            <span className="visually-hidden">{open ? "Read less" : "Read more"}</span>
            <span aria-hidden="true">
              <Letters text="Read" />{" "}
              <span className={styles.moreWord}>
                <span className={styles.moreRoom}>more</span>
                <span className={styles.moreRoom}>less</span>
                <span data-turn={typed || undefined}>
                  <Letters text={word} />
                </span>
              </span>
            </span>
          </span>
        </span>
      </summary>
      <div ref={body}>{children}</div>
    </details>
  );
}
