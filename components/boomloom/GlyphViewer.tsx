"use client";

import { useEffect, useRef } from "react";
import type { GlyphViewer as Viewer } from "./glyph-viewer.js";
import styles from "./BoomLoom.module.css";

// The BoomLoom Display glyph viewer, built from the copy in the BoomLoom handoff. It runs in the
// browser only and sets its own height from its width. Its few words take the page's font.
// `construction` is the font to find the rings in, when the shown outlines have been simplified.
export function GlyphViewer({ font, construction }: { font: string; construction?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let viewer: Viewer | null = null;
    let gone = false;
    import("./glyph-viewer.js")
      .then(({ createGlyphViewer }) => createGlyphViewer(el, { font, construction }))
      .then((made) => (gone ? made.destroy() : (viewer = made)))
      .catch((error) => console.error(error));
    return () => {
      gone = true;
      viewer?.destroy();
    };
  }, [font, construction]);

  return <div ref={ref} className={styles.glyphs} />;
}
