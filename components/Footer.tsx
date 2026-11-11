"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { Count } from "./Count";
import { KONAMI_KEYS } from "./EasterEggs";
import { FlipText, Letters } from "./Flip";
import styles from "./Footer.module.css";

const DAY = 24 * 60 * 60 * 1000;
export const ASK = "Do you know the Konami code?";
export const TRY = "Try it."; // what the question turns into, hovered

// Closes every page: how many people have stopped by, then the small print.
// Hover the © and it turns into how many days the site has been up. Hover the
// Konami question and it says "Try it.", with the keys above it.
export function Footer() {
  const [days, setDays] = useState<number | null>(null);
  const [turning, setTurning] = useState(false);
  const year = new Date().getFullYear();
  const since = days === null ? `© ${year} ${site.name}` : `${days} ${days === 1 ? "day" : "days"} live`;

  return (
    <footer className={styles.footer}>
      <Count />
      <div className={styles.small}>
        <p
          className={styles.since}
          data-text="small"
          data-turn={turning || undefined}
          onPointerEnter={() => {
            setTurning(true);
            setDays(Math.max(1, Math.floor((Date.now() - Date.parse(site.launched)) / DAY) + 1));
          }}
          onPointerLeave={() => setDays(null)}
        >
          <span className="visually-hidden">
            © {year} {site.name}
          </span>
          <span aria-hidden="true">
            <Letters text={since} />
          </span>
        </p>
        <p className={styles.links} data-text="small">
          <a href={`mailto:${site.email}`}>
            <FlipText text={site.email} />
          </a>
          <a href={site.links.linkedin} target="_blank" rel="noreferrer">
            <FlipText text="LinkedIn" />
          </a>
        </p>
        <Hint />
      </div>
    </footer>
  );
}

// The faint question at the very bottom. Hovered, it turns over into "Try
// it." and the keys fade in above it one by one, left to right, each a small
// piece of the nav's glass. Each one fills in quietly as you press it in the
// right order; when the code is done they stay filled while the effect runs,
// and take its colors like the rest of the page.
function Hint() {
  const [trying, setTrying] = useState(false);
  const [turning, setTurning] = useState(false);
  const [right, setRight] = useState(0);

  useEffect(() => {
    let reset = 0;
    const keys = (event: Event) => {
      const count = (event as CustomEvent<number>).detail;
      setRight(count);
      window.clearTimeout(reset);
      if (count === KONAMI_KEYS.length) reset = window.setTimeout(() => setRight(0), 3600); // filled for as long as the effect runs
    };
    window.addEventListener("noaoh:keys", keys);
    return () => {
      window.removeEventListener("noaoh:keys", keys);
      window.clearTimeout(reset);
    };
  }, []);

  return (
    <div
      className={styles.hint}
      data-on={trying || undefined}
      data-turn={turning || undefined}
      onPointerEnter={() => {
        setTurning(true);
        setTrying(true);
      }}
      onPointerLeave={() => setTrying(false)}
    >
      <p className={styles.hintText} data-text="small">
        <span className="visually-hidden">{ASK}</span>
        {/* Keeps the question's size, so neither the hover area nor the footer's height changes with
            the words. Set in the same letters, so it wraps exactly where the question does. */}
        <span className={styles.hintSize} aria-hidden="true">
          <Letters text={ASK} />
        </span>
        <span aria-hidden="true">
          <Letters text={trying ? TRY : ASK} />
        </span>
      </p>
      <div className={styles.keys} aria-hidden="true">
        {KONAMI_KEYS.map((key, i) => (
          <kbd key={i} data-pressed={i < right || undefined} style={{ "--i": i } as React.CSSProperties}>
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
