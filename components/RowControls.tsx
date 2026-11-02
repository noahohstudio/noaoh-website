"use client";

import { useEffect, useRef, useState } from "react";
import { LoopControls } from "./Loop";
import styles from "./CaseStudy.module.css";

// One pause and one replay for a row of loops that play as one, at the row's top right, in place of a pair on
// each tile (Noah, Oct 28, of Kino's flow tiles: "lets have one main pause/rewind for this section"). It sends
// each loop in the row the same word (Loop.tsx), so they pause, play and start over together, in step.
export function RowControls() {
  const box = useRef<HTMLLIElement>(null);
  const [playing, setPlaying] = useState(false);
  const loops = () => [...(box.current?.parentElement?.querySelectorAll("video") ?? [])];

  useEffect(() => {
    const row = box.current?.parentElement;
    if (!row) return;
    const update = () => setPlaying([...row.querySelectorAll("video")].some((video) => !video.paused));
    row.addEventListener("play", update, true);
    row.addEventListener("pause", update, true);
    return () => {
      row.removeEventListener("play", update, true);
      row.removeEventListener("pause", update, true);
    };
  }, []);

  const send = (word: string) => loops().forEach((video) => video.dispatchEvent(new Event(word)));

  return (
    <li ref={box} role="none" className={styles.rowControls}>
      <LoopControls
        playing={playing}
        onToggle={() => send(playing ? "loop:pause" : "loop:play")}
        onReplay={() => send("loop:replay")}
      />
    </li>
  );
}
