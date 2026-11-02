"use client";

import { useEffect } from "react";

const COLORS = ["blue", "red", "yellow"] as const; // the glass's, in its order (content/site.ts)

// Highlighting text takes one of the glass's colors, and the next one each time a new highlight starts (Noah, Oct 29:
// "when the user highlights a word, can it be one of our primary glass colors? … the text should be a darker hue of the
// same color - similar to rachels highlights. Everytime you highlight, what if it shifts between the 3 colors?").
// globals.css, "Highlights", has the colors.
export function SelectionColor() {
  useEffect(() => {
    const root = document.documentElement;
    let i = 0;
    let had = false; // a highlight is showing
    root.dataset.hl = COLORS[i];
    // The color moves on as a highlight is let go, so the next one starts in its own color, never changing under you,
    // and a plain click doesn't use one up
    const change = () => {
      const selection = document.getSelection();
      const has = Boolean(selection && !selection.isCollapsed && selection.toString().trim());
      if (had && !has) {
        i = (i + 1) % COLORS.length;
        root.dataset.hl = COLORS[i];
      }
      had = has;
    };
    document.addEventListener("selectionchange", change);
    return () => document.removeEventListener("selectionchange", change);
  }, []);
  return null;
}
