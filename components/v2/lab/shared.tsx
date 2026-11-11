"use client";

import { memo, useSyncExternalStore } from "react";
import { FlipText } from "@/components/Flip";
import { site } from "@/content/site";
import styles from "./shared.module.css";

// What the v2 lab renditions (LabA, LabB) share: the placeholder pieces, how they're dealt into columns, the piece
// itself, the glass note, and the soft blur at the screen's top and bottom edges. Noah, Nov 8: "I'm going to work
// towards building new lab projects for quick looks and interactions - so for now, use blank gray boxes (varying
// dimensions) and placeholder text."

export type Piece = {
  id: number;
  ratio: string; // width / height, for aspect-ratio
  tall: number; // height over width
  scale: number; // share of its column it takes, on screens wide enough for three columns
  end: boolean; // sits to the right of its column instead of the left
  title: string;
  context: string;
  note: string;
  video?: string; // a real piece's loop (content/site.ts `lab`)
  src?: string; // or its image
};

// Fourteen gray boxes at the proportions the lab's pieces come in, some a little narrower than their column so the
// columns stay loose
const SHAPES: [string, number, boolean?][] = [
  ["4:5", 1],
  ["16:10", 0.84, true],
  ["1:1", 0.72],
  ["3:4", 1],
  ["3:2", 1],
  ["4:3", 0.78, true],
  ["4:5", 0.86],
  ["1:1", 1],
  ["16:10", 1],
  ["3:4", 0.74, true],
  ["4:3", 1],
  ["3:2", 0.82],
  ["1:1", 0.9, true],
  ["4:5", 1],
];

export const PIECES: Piece[] = SHAPES.map(([shape, scale, end], id) => {
  const [w, h] = shape.split(":").map(Number);
  return {
    id,
    ratio: `${w} / ${h}`,
    tall: h / w,
    scale,
    end: Boolean(end),
    title: "[Lab project]",
    context: "[Kind, 2026]",
    note: "[One line on what it is.]",
  };
});

// The real pieces, the live lab's seven (content/site.ts `lab`), in Noah's order, until the new lab projects are built
// (Noah, Nov 11, choosing "The live lab's seven" for v2's lab). Each keeps its own proportions; the share of its
// column it takes and the side it sits on follow the placeholders' pattern, so the columns stay as loose.
export const LAB_PIECES: Piece[] = site.lab
  .filter((piece) => piece.src || piece.video)
  .map((piece, id) => {
    const [w, h] = piece.ratio.split("/").map((n) => Number(n.trim()));
    const [, scale, end] = SHAPES[id % SHAPES.length];
    return {
      id,
      ratio: `${w} / ${h}`,
      tall: h / w,
      scale,
      end: Boolean(end),
      title: piece.title,
      context: piece.context,
      note: piece.note,
      video: piece.video,
      src: piece.src,
    };
  });

const CAPTION = 0.3; // a caption and the gap under a piece, as a share of the column's width, roughly

// Deals the pieces into columns: in order, each to whichever column is shortest so far, then evened out by moving or
// swapping pieces between the tallest and shortest columns while that brings them closer. Each column keeps the
// pieces' order. Even columns keep the gaps between pieces even (the renditions make up the rest in the gaps).
export function deal(cols: number, pieces: Piece[] = PIECES): Piece[][] {
  const height = (p: Piece) => p.tall * (cols > 2 ? p.scale : 1) + CAPTION;
  const sum = (list: Piece[]) => list.reduce((total, p) => total + height(p), 0);
  const columns: Piece[][] = Array.from({ length: cols }, () => []);
  for (const piece of pieces) {
    const heights = columns.map(sum);
    columns[heights.indexOf(Math.min(...heights))].push(piece);
  }
  for (let round = 0; round < 100; round++) {
    const heights = columns.map(sum);
    const hi = heights.indexOf(Math.max(...heights));
    const lo = heights.indexOf(Math.min(...heights));
    const gap = heights[hi] - heights[lo];
    let best: { left: number; a: Piece; b: Piece | null } | null = null;
    for (const a of columns[hi]) {
      for (const b of [null, ...columns[lo]]) {
        const left = Math.abs(gap - 2 * (height(a) - (b ? height(b) : 0)));
        if (left < gap - 1e-6 && (!best || left < best.left)) best = { left, a, b };
      }
    }
    if (!best) break;
    const { a, b } = best;
    columns[hi] = [...columns[hi].filter((p) => p !== a), ...(b ? [b] : [])];
    columns[lo] = [...columns[lo].filter((p) => p !== b), a];
    for (const list of columns) list.sort((x, y) => x.id - y.id);
  }
  return columns;
}

// The left column's placeholders, in more sizes than the rest, in Lab B and Lab C (Noah, Nov 8: "for placeholders, lets vary the sizing of
// the left column slightly more"): from a tall portrait to a short landscape, each taking its own share of the column's
// width and sitting to its left or right. In order down the column, repeating if it holds more. Below 720px every piece
// takes the whole column, so there only the proportions vary.
const LEFT: [shape: string, scale: number, end: boolean][] = [
  ["3:4", 1, false],
  ["16:10", 0.72, true],
  ["1:1", 0.84, false],
  ["4:5", 0.92, true],
  ["3:2", 0.8, false],
  ["4:3", 0.9, true],
];

export function varyLeft(columns: Piece[][]): Piece[][] {
  return columns.map((list, c) =>
    c > 0
      ? list
      : list.map((piece, i) => {
          const [shape, scale, end] = LEFT[i % LEFT.length];
          const [w, h] = shape.split(":").map(Number);
          return { ...piece, ratio: `${w} / ${h}`, tall: h / w, scale, end };
        }),
  );
}

// Three columns from 720px, two below
const WIDE = "(min-width: 720px)";
const STILL = "(prefers-reduced-motion: reduce)";

function media(query: string) {
  return (change: () => void) => {
    const list = matchMedia(query);
    list.addEventListener("change", change);
    return () => list.removeEventListener("change", change);
  };
}

const watchWide = media(WIDE);
const watchStill = media(STILL);

export function useColumns() {
  return useSyncExternalStore(
    watchWide,
    () => (matchMedia(WIDE).matches ? 3 : 2),
    () => 3,
  );
}

export function useReducedMotion() {
  return useSyncExternalStore(
    watchStill,
    () => matchMedia(STILL).matches,
    () => false,
  );
}

// One piece: the gray box, then its title and, in gray, what it is. `id` says which copy of which piece it is, and
// `order` staggers its entrance. Only a piece whose focus changes draws again.
export const PieceView = memo(function PieceView({
  piece,
  id,
  column,
  index,
  order,
  on,
}: {
  piece: Piece;
  id: string;
  column: number;
  index: number;
  order: number;
  on: boolean;
}) {
  return (
    <li
      className={styles.piece}
      data-key={id}
      data-c={column}
      data-i={index}
      data-on={on || undefined}
      data-end={piece.end || undefined}
      style={{ "--scale": piece.scale, "--order": Math.min(order, 8) } as React.CSSProperties}
    >
      <div className={styles.inner}>
        <div className={styles.box} style={{ aspectRatio: piece.ratio }} />
        <p className={styles.caption}>
          <FlipText text={piece.title} />{" "}
          <span className={styles.muted}>
            <FlipText text={piece.context} />
          </span>
        </p>
      </div>
    </li>
  );
});

export type Side = "left" | "right" | "below";
export type Spot = { x: number; y: number; side: Side };

const GAP = 24; // px between a piece and the note beside it

// Where the note goes for a piece: beside it, following the pointer down it, on the side away from the edge of the
// page; and where there's no room beside it (phones), under it, or over it near the bottom of the screen. In the
// coordinates of `box`, the note's positioned parent.
export function placeNote(
  tile: DOMRect,
  box: DOMRect,
  note: { w: number; h: number },
  column: number,
  cols: number,
  pointerY: number | null,
): Spot {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const right = tile.right + GAP + note.w <= vw - 12;
  const left = tile.left - GAP - note.w >= 12;
  const side: Side = column < cols - 1 ? (right ? "right" : left ? "left" : "below") : left ? "left" : right ? "right" : "below";
  if (side !== "below") {
    const at = pointerY ?? tile.top + tile.height * 0.2;
    const y = Math.max(tile.top, Math.min(at - 32, tile.bottom - note.h));
    return { x: (side === "right" ? tile.right + GAP : tile.left - GAP) - box.left, y: y - box.top, side };
  }
  const x = Math.max(16, Math.min(tile.left + tile.width / 2 - note.w / 2, vw - 16 - note.w));
  const floor = vh - 64; // clear of the bottom edge's blur
  let y = tile.bottom + 12;
  if (y + note.h > floor) y = tile.top - 12 - note.h >= 56 ? tile.top - 12 - note.h : Math.min(tile.bottom, floor) - 12 - note.h;
  return { x: x - box.left, y: y - box.top, side };
}

// The note on the piece in focus: frosted glass, like the nav, its title in v2's display face. It slides along as
// the pointer moves, and appears in place rather than flying in.
export function Note({
  piece,
  on,
  entering,
  side,
  ref,
  style,
}: {
  piece: Piece;
  on: boolean;
  entering: boolean;
  side?: Side;
  ref?: React.Ref<HTMLDivElement>;
  style?: React.CSSProperties;
}) {
  return (
    <div
      ref={ref}
      className={styles.note}
      aria-hidden="true"
      data-on={on || undefined}
      data-side={side}
      data-entering={(on && entering) || undefined}
      style={style}
    >
      <p className={styles.noteTitle}>{piece.title}</p>
      <p className={styles.muted}>{piece.context}</p>
      <p className={styles.noteBody}>{piece.note}</p>
    </div>
  );
}

// A soft, progressive blur along the top and bottom of the screen: pieces resolve as they come in and dissolve as they
// leave. Each band stacks a few layers of frosted glass, each blurring more and masked closer to the edge.
export function Edges() {
  return (
    <>
      {["top", "bottom"].map((edge) => (
        <div key={edge} className={styles.edge} data-edge={edge} aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      ))}
    </>
  );
}

export { styles as shared };
