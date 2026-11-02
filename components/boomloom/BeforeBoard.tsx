"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { BoardPiece } from "@/content/projects";
import styles from "./BeforeBoard.module.css";

// The frame the pieces are placed in, so the board keeps its 16:9 and scales with its width
const W = 1920;
const H = 1080;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

// The before board, ported from the workshop's prototype (case-studies/boomloom-workshop/2-before-board-interactive):
// the brand's old pieces on the page's own white, each wearing a pill that says what was wrong. Resting on a piece
// or its pill, focusing it or tapping either brings up a glass note with a line more; the wordmark's note enlarges
// the real PNG until its pixels show. With a mouse, like the lab, the note follows the pointer down the piece, beside
// it, and the other pieces
// go slightly soft, their pills staying sharp (Noah, Oct 26, the one other exception to pictures never being
// touched). From the keyboard or a tap, the note sits beside its piece.
const GAP = 22; // px between a piece and its note
export function BeforeBoard({ pieces }: { pieces: BoardPiece[] }) {
  const [open, setOpen] = useState<number | null>(null);
  // Each note's place beside the pointer, kept after the pointer leaves, so a note fades out where it was
  const [places, setPlaces] = useState<Record<number, { x: number; y: number; left: boolean }>>({});
  const [hovered, setHovered] = useState(false);
  const [entering, setEntering] = useState(false); // a note fades and rises into place first, then glides
  const settle = useRef(0);
  const pointer = useRef("");
  const board = useRef<HTMLDivElement>(null);
  const notes = useRef<(HTMLDivElement | null)[]>([]);

  // As in the lab: beside the piece, on whichever side has room, following the pointer down it, never off the board
  const follow = (i: number, piece: Element, clientY: number) => {
    const box = board.current?.getBoundingClientRect();
    const note = notes.current[i];
    if (!box || !note) return;
    const r = piece.getBoundingClientRect(), left = r.left + r.width / 2 - box.left > box.width * 0.62;
    const y = clientY - box.top - GAP, low = r.top - box.top, high = r.bottom - box.top - note.offsetHeight;
    const top = Math.max(GAP / 2, Math.min(Math.max(low, Math.min(y, high)), box.height - note.offsetHeight - GAP / 2));
    setPlaces((all) => ({ ...all, [i]: { x: left ? r.left - box.left - GAP : r.right - box.left + GAP, y: top, left } }));
  };

  return (
    <div
      ref={board}
      className={styles.board}
      data-active={(open !== null && hovered) || undefined}
      role="group"
      aria-label="The brand before the redesign, each piece tagged with what was wrong"
      onKeyDown={(event) => event.key === "Escape" && setOpen(null)}
    >
      {pieces.map((piece, i) => {
        const [x, y, w, h] = piece.at;
        // A note sits beside its piece, on whichever side has room
        const right = x + w / 2 < W * 0.62;
        const noteX = right ? x + w + 24 : x - 24 - W * 0.17;
        const noteY = Math.max(24, piece.page ? y + 30 : y);
        return (
          <div key={piece.src}>
            {/* The piece and its pill are one button, so each opens the same note */}
            <button
              type="button"
              className={styles.piece}
              data-on={open === i || undefined}
              style={{ left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H) }}
              aria-label={`${piece.title}: ${piece.tag}. ${piece.note}`}
              onPointerDown={(event) => (pointer.current = event.pointerType)}
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse") return;
                window.clearTimeout(settle.current);
                setEntering(true);
                settle.current = window.setTimeout(() => setEntering(false), 200);
                follow(i, event.currentTarget, event.clientY);
                setHovered(true);
                setOpen(i);
              }}
              onPointerMove={(event) => {
                if (event.pointerType !== "mouse") return;
                follow(i, event.currentTarget, event.clientY);
              }}
              onPointerLeave={(event) => {
                if (event.pointerType !== "mouse") return;
                setHovered(false);
                setOpen(null);
              }}
              // Only the keyboard opens a note by focus; a tap would otherwise open it and close it at once
              onFocus={(event) => {
                if (!event.currentTarget.matches(":focus-visible")) return;
                setPlaces(({ [i]: _, ...rest }) => rest); // from the keyboard, the note sits beside its piece
                setOpen(i);
              }}
              onBlur={() => setOpen(null)}
              // A mouse or a key already opened it; a tap opens it, and a second tap closes it
              onClick={(event) => {
                if (pointer.current === "mouse" || event.detail === 0) setOpen(i);
                else {
                  setPlaces(({ [i]: _, ...rest }) => rest);
                  setOpen((current) => (current === i ? null : i));
                }
              }}
            >
              <span className={piece.page ? `${styles.frame} ${styles.page}` : styles.frame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={piece.src} alt="" draggable={false} loading="lazy" style={place(piece)} />
              </span>
              <span className={styles.tag} style={{ top: pct(piece.tagY - y, h) }} aria-hidden="true">
                {piece.tag}
              </span>
            </button>
            <div
              ref={(el) => {
                notes.current[i] = el;
              }}
              className={styles.note}
              style={
                places[i]
                  ? ({ "--x": `${places[i].x}px`, "--y": `${places[i].y}px` } as CSSProperties)
                  : { left: pct(noteX, W), top: pct(noteY, H) }
              }
              data-on={open === i || undefined}
              data-follow={places[i] ? (places[i].left ? "left" : "right") : undefined}
              data-entering={(open === i && entering) || undefined}
              aria-hidden="true"
            >
              <b>{piece.title}</b>
              <p>{piece.note}</p>
              {piece.loupe && <Loupe src={piece.src} at={piece.loupe} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Where a file sits in its piece: whole, or cropped to the part named in its pixels
function place({ size, crop }: BoardPiece): CSSProperties {
  if (!crop) return { inset: 0, width: "100%", height: "100%" };
  const [left, top, right, bottom] = crop;
  const w = right - left;
  const h = bottom - top;
  return { left: pct(-left, w), top: pct(-top, h), width: pct(size[0], w), height: pct(size[1], h) };
}

// The real file, enlarged eight times pixel for pixel (no smoothing), so its stair-stepped curves show.
// Its clear pixels show the page's own ground, as on the board.
function Loupe({ src, at }: { src: string; at: [number, number] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [x, y] = at;

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      const canvas = ref.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      context.imageSmoothingEnabled = false;
      context.fillStyle = getComputedStyle(canvas).getPropertyValue("--bg").trim() || "#ffffff";
      context.fillRect(0, 0, 480, 240);
      context.drawImage(image, x - 30, y - 15, 60, 30, 0, 0, 480, 240);
    };
    image.src = src;
  }, [src, x, y]);

  return <canvas ref={ref} width={480} height={240} className={styles.loupe} />;
}
