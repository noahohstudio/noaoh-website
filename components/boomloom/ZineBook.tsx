"use client";

import { useEffect, useRef } from "react";
import type { ZineBook as Book } from "./zine-book.js";
import styles from "./BoomLoom.module.css";

// The interactive zine, built from the frozen copy in the BoomLoom handoff. It runs in the browser
// only, and isn't built until it nears the screen, so three.js and the spreads load late.
// The book listens for the arrow keys on the whole window, so keep one per page.
// Its canvas runs past the 16 / 9 box by BLEED, so a page turning toward you and its shadow are never cut; the words
// above and below sit over that margin (Noah, Oct 28: "make sure theres a little more leeway? We can make up for it by
// putting the text over the video so that neither is cut off, but there is room for the shadows and pages arent cut").
const BLEED = { x: 0.03, y: 0.14 }; // a share of the box on each side; BoomLoom.module.css's .stage matches
export function ZineBook({ spreads }: { spreads: string[] }) {
  const ref = useRef<HTMLDivElement>(null); // the stage, the box plus its bleed
  const key = spreads.join("|");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let book: Book | null = null;
    let gone = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        import("./zine-book.js")
          .then(({ createZineBook }) => createZineBook(el, { spreads: key.split("|"), bleed: BLEED }))
          .then((made) => (gone ? made.destroy() : (book = made)))
          .catch((error) => console.error(error));
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(el);
    return () => {
      gone = true;
      observer.disconnect();
      book?.destroy();
    };
  }, [key]);

  return (
    <div className={styles.zine}>
      <div ref={ref} className={styles.stage} />
    </div>
  );
}
