"use client";

import { useEffect } from "react";
import "./text.css";

// Turns v2's text styles on (text.css) for the whole site (app/layout.tsx): on its pages from the first paint, and on
// the whole document, so what opens over everything (Lab C's piece, drawn into the body) takes them too. The wrapper
// takes no box of its own.
export function TypeScope({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.type = "";
    return () => {
      delete html.dataset.type;
    };
  }, []);
  return (
    <div data-type="" style={{ display: "contents" }}>
      {children}
    </div>
  );
}
