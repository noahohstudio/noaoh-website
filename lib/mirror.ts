// Where each letter mirrors. Flipping a letter around a fixed line makes it
// jump: a digit mirrored around the middle of the lowercase drops below the
// line. So each glyph gets its own axis, through the middle of its ink, and
// mirrors in place: it covers exactly the same space either way up.
//
// The same measurement says where the ink starts and how tall it is, so big
// type can be hovered on the letter itself rather than its whole line.
//
// Glyphs register with `ref={mirrorAxis}`. Once the fonts are in, each gets
// `--axis`, `--ink-top` and `--ink-height`, in em so they hold at any size.

type Ink = { axis: number; top: number; height: number };

const PAD = 0.03; // em of room above and below the ink that still counts as the letter
const queue = new Set<HTMLElement>();
const cache = new Map<string, Ink>();
let pending = false;
let ctx: CanvasRenderingContext2D | null = null;

export function mirrorAxis(el: HTMLElement | null) {
  if (!el) return;
  queue.add(el);
  if (pending) return;
  pending = true;
  (document.fonts?.ready ?? Promise.resolve()).then(() => requestAnimationFrame(settle));
}

function settle() {
  pending = false;
  ctx ??= document.createElement("canvas").getContext("2d");
  if (!ctx) return;
  const found: [HTMLElement, Ink][] = [];
  for (const el of queue) {
    if (!el.isConnected) continue;
    const style = getComputedStyle(el);
    const char = style.textTransform === "uppercase" ? el.textContent!.toUpperCase() : el.textContent!;
    const size = parseFloat(style.fontSize);
    // The box is one line tall; "normal" leaves no room around the font's own height
    const line = style.lineHeight === "normal" ? null : parseFloat(style.lineHeight) / size;
    const font = `${style.fontStyle} ${style.fontWeight} 1000px ${style.fontFamily}`;
    const key = `${font}|${line}|${char}`;
    let ink = cache.get(key);
    if (!ink) {
      // Measured large, so rounding doesn't creep in at display sizes
      ctx.font = font;
      const m = ctx.measureText(char);
      const ascent = m.fontBoundingBoxAscent / 1000;
      const descent = m.fontBoundingBoxDescent / 1000;
      const baseline = ((line ?? ascent + descent) - ascent - descent) / 2 + ascent; // from the box's top
      const above = m.actualBoundingBoxAscent / 1000; // the ink, above and below the baseline
      const below = m.actualBoundingBoxDescent / 1000;
      ink = {
        axis: baseline - (above - below) / 2,
        top: baseline - above - PAD,
        height: above + below + 2 * PAD,
      };
      cache.set(key, ink);
    }
    found.push([el, ink]);
  }
  queue.clear();
  for (const [el, ink] of found) {
    el.style.setProperty("--axis", `${ink.axis.toFixed(4)}em`);
    el.style.setProperty("--ink-top", `${ink.top.toFixed(4)}em`);
    el.style.setProperty("--ink-height", `${ink.height.toFixed(4)}em`);
  }
}
