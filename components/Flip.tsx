"use client";

import { mirrorAxis } from "@/lib/mirror";
import styles from "./Flip.module.css";

// Splits text into words and letters. While the pointer is on a letter it
// mirrors top to bottom, in place; it rights itself as soon as the pointer
// leaves. Words never break across lines, hyphenated ones included. A letter
// that changes is a new letter, so inside `[data-turn]` it turns over.
export function Letters({ text }: { text: string }) {
  return text.split(/(\s+)/).map((chunk, i) =>
    /^\s*$/.test(chunk) ? (
      chunk
    ) : (
      <span key={i} className={styles.word} data-word>
        {Array.from(chunk).map((char, j) => (
          <span key={`${j}-${char}`} className={styles.char}>
            <span ref={mirrorAxis} className={styles.glyph} data-glyph>
              {char}
            </span>
          </span>
        ))}
      </span>
    ),
  );
}

// Mirroring text for links and labels. Screen readers get the plain words.
export function FlipText({ text }: { text: string }) {
  return (
    <span>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        <Letters text={text} />
      </span>
    </span>
  );
}
