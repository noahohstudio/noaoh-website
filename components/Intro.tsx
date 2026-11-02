"use client";

import { useEffect, useState } from "react";
import styles from "./Intro.module.css";

// One second of film. The counter runs 24 frames, holds on the last one only
// if the typeface hasn't arrived yet, then the gate opens on the hairline.
const FPS = 24;
const FRAME_MS = 1000 / FPS;
const FONT_GRACE_MS = 2500;
const GATE_MS = 2300;

const timecode = (frame: number) =>
  `00:00:${String(Math.floor(frame / FPS)).padStart(2, "0")}:${String(frame % FPS).padStart(2, "0")}`;

export function Intro({ name }: { name: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("intro")) return;

    let raf = 0;
    let finished = false;
    let fontsReady = false;
    const start = performance.now();
    document.fonts?.ready.then(() => (fontsReady = true));

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      setFrame(FPS);
      try {
        sessionStorage.setItem("noaoh:intro", "1");
      } catch {}
      // Hold the last frame for one frame, then open the gate.
      window.setTimeout(() => {
        root.classList.add("lit");
        window.setTimeout(() => root.classList.remove("intro", "lit"), GATE_MS);
      }, FRAME_MS);
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      let next = Math.min(FPS, Math.floor(elapsed / FRAME_MS));
      if (next === FPS && !fontsReady && elapsed < 1000 + FONT_GRACE_MS) next = FPS - 1;
      setFrame(next);
      if (next === FPS) return finish();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("keydown", finish);
    window.addEventListener("pointerdown", finish);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("pointerdown", finish);
    };
  }, []);

  return (
    <div className={styles.intro} aria-hidden="true">
      <div className={styles.panel} data-half="top" />
      <div className={styles.panel} data-half="bottom" />
      <div className={styles.label}>
        <span>{name}</span>
        <span className={styles.timecode}>{timecode(frame)}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ transform: `scaleX(${frame / FPS})` }} />
      </div>
    </div>
  );
}
