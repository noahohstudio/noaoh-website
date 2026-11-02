"use client";

import { useEffect } from "react";
import { site } from "@/content/site";
import styles from "./EasterEggs.module.css";

// Words that do things when typed anywhere on the page (outside text fields).
// Each one sends a "noaoh:egg" event; the parts of the page that care listen.
const WORDS = ["bauhaus"];

// ↑ ↑ ↓ ↓ ← → ← → B A, hinted at the bottom of every page. As you type it,
// "noaoh:keys" says how many keys in a row are right, for the hint to show.
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
export const KONAMI_KEYS = ["↑", "↑", "↓", "↓", "←", "→", "←", "→", "B", "A"];

const WAVE = 900; // ms for the wave of turning letters to cross the screen
const SCATTER = 0.35; // how far a letter may run ahead of the wave or lag behind it, as a share of the wave
const HOLD = 2200; // ms everything stays turned over and in color

// Kandinsky's pairs, as in the "bauhaus" egg: a blue circle, a red square, a yellow triangle
const SHAPES = ["circle", "square", "triangle"];

// The bands run blue, pink, red, yellow. Pink is the Konami code's own color,
// between the glass's blue and red, and the white page takes a faint blush of it.
const PINK = "#ea91bc";
const BLUSH = "#fdf1f5";

export function EasterEggs() {
  useEffect(() => {
    let typed = "";
    let keys: string[] = [];
    const listen = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable]")) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // The arrow keys are for the Konami code, so they never scroll the page.
      // Space, Page Up and Down, Home and End, the wheel and the scrollbar still do.
      if (event.key.startsWith("Arrow") && !event.shiftKey) event.preventDefault();
      const key = event.key.toLowerCase();

      keys = [...keys, key].slice(-KONAMI.length);
      const right = streak(keys);
      window.dispatchEvent(new CustomEvent("noaoh:keys", { detail: right }));
      if (right === KONAMI.length) {
        keys = [];
        window.dispatchEvent(new CustomEvent("noaoh:egg", { detail: "konami" }));
      }

      if (key.length !== 1) return;
      typed = (typed + key).slice(-12);
      const word = WORDS.find((w) => typed.endsWith(w));
      if (!word) return;
      typed = "";
      window.dispatchEvent(new CustomEvent("noaoh:egg", { detail: word }));
    };
    window.addEventListener("keydown", listen);
    return () => window.removeEventListener("keydown", listen);
  }, []);

  useEffect(() => {
    let running = false;
    const konami = (event: Event) => {
      if ((event as CustomEvent).detail !== "konami" || running) return;
      running = true;
      sweep();
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) burst();
      turnOver(() => (running = false));
    };
    window.addEventListener("noaoh:egg", konami);
    return () => window.removeEventListener("noaoh:egg", konami);
  }, []);

  return null;
}

// How many of the last keys pressed are the start of the code
function streak(keys: string[]) {
  for (let n = Math.min(keys.length, KONAMI.length); n > 0; n--) {
    if (keys.slice(-n).join() === KONAMI.slice(0, n).join()) return n;
  }
  return 0;
}

// The letters on screen turn over in a loose wave from the top left, then turn
// back the same way. The wave still sweeps across, but each letter runs a
// little ahead or behind, so neighbours go in no set order. Only the ones in
// view, so it stays light.
function turnOver(done: () => void) {
  const root = document.documentElement;
  const reach = window.innerWidth + window.innerHeight;
  const glyphs = Array.from(document.querySelectorAll<HTMLElement>("[data-glyph]")).filter((glyph) => {
    const box = glyph.getBoundingClientRect();
    const seen = box.bottom > 0 && box.top < window.innerHeight && box.right > 0 && box.left < window.innerWidth;
    if (seen) {
      const along = (box.left + box.top) / reach; // 0 at the top left, 1 at the bottom right
      const at = along * (1 - SCATTER) + Math.random() * SCATTER;
      glyph.style.setProperty("--k-delay", `${Math.round(at * WAVE)}ms`);
    }
    return seen;
  });
  glyphs.forEach((glyph) => glyph.setAttribute("data-wave", ""));
  root.setAttribute("data-konami", "");
  window.setTimeout(() => root.removeAttribute("data-konami"), WAVE + HOLD);
  window.setTimeout(() => {
    for (const glyph of glyphs) {
      glyph.removeAttribute("data-wave");
      glyph.style.removeProperty("--k-delay");
    }
    done();
  }, WAVE * 2 + HOLD + 100);
}

// Soft bands of the glass colors and pink sweep across the whole screen, over
// a faint pink blush. White stays white; text and shapes under a band take
// its color. Pictures sit above the bands, so they never change, and the nav,
// which sits above the pictures, gets its own copy (EasterEggs.module.css).
function sweep() {
  const root = document.documentElement;
  const tile = washTile();
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  const layers = [
    lay(document.body, styles.blush),
    lay(document.body, styles.bands, tile),
    ...(nav ? [lay(nav, styles.navBlush), lay(nav, styles.navBands, tile)] : []),
  ];
  root.setAttribute("data-bands", "");
  window.setTimeout(() => layers.forEach((layer) => layer.setAttribute("data-out", "")), WAVE + HOLD);
  window.setTimeout(() => {
    layers.forEach((layer) => layer.remove());
    root.removeAttribute("data-bands");
  }, WAVE + HOLD + 600);
}

// A layer of the effect: the blush, or, given the painted tile, the bands
function lay(parent: HTMLElement, className: string, tile?: string | null) {
  const layer = document.createElement("div");
  layer.className = className;
  layer.setAttribute("aria-hidden", "true");
  layer.style.setProperty("--blush", BLUSH);
  if (tile !== undefined) {
    if (tile) layer.style.setProperty("--wash", `url(${tile})`);
    const field = document.createElement("div");
    field.className = styles.field;
    const stripes = document.createElement("div");
    stripes.className = styles.stripes;
    field.appendChild(stripes);
    layer.appendChild(field);
  }
  parent.appendChild(layer);
  return layer;
}

// The colors, painted once into a long strip that the browser blows up and
// slides across the page once while the effect runs. Each color appears just
// once, in order around the color wheel, from cool to warm: a soft periwinkle
// (the glass's blue leaning toward rose), rose, red, and last the strong gold
// it fades out on. The fields
// are wide, so only two or three are ever on screen together. Every blend is
// between neighbours on the wheel and goes around it rather than across, so
// it stays as bright as its ends; each color holds for a while before it
// turns. The lines between colors bend gently down the strip.
let tile: string | null = null;
function washTile() {
  if (tile) return tile;
  const WIDE = 640;
  const TALL = 256;
  const canvas = document.createElement("canvas");
  canvas.width = WIDE;
  canvas.height = TALL;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const [blue, pinkGlass, red, yellowGlass] = [site.lander.glass[0].color, PINK, site.lander.glass[1].color, site.lander.glass[2].color].map((hex) => lch(oklab(hex)));
  const pink = [pinkGlass[0] + 0.01, pinkGlass[1] * 0.8, pinkGlass[2]]; // softer
  const yellow = [yellowGlass[0] - 0.01, yellowGlass[1] * 1.15, yellowGlass[2] - 0.05]; // punchier, a little toward gold
  const periwinkle = turn(blue, pink, 0.3);
  // Left to right along the strip. It slides rightward, so the colors flow
  // left to right across the page and the page sees them from the right end
  // first: periwinkle, rose, red, gold. Beyond the first and last lines the
  // end colors simply hold, so the strip always covers the screen.
  const colors = [yellow, red, pink, periwinkle];
  const stops = [0.329, 0.495, 0.661, 0.826];
  // How each line bends down the strip: waves of [times down the strip, how
  // far, where it starts]. Whole-number waves, so it repeats downward without a seam.
  const bends = [
    [[1, 0.014, 0.4], [2, 0.006, 2.0]],
    [[1, 0.018, 1.3], [3, 0.006, 4.0]],
    [[2, 0.016, 2.6], [1, 0.012, 5.1]],
    [[1, 0.02, 0.9], [2, 0.008, 3.3]],
  ];
  const image = ctx.createImageData(WIDE, TALL);
  for (let y = 0; y < TALL; y++) {
    const v = y / TALL;
    const lines = bends.map((waves, k) => stops[k] + waves.reduce((sum, [times, far, from]) => sum + far * Math.sin(2 * Math.PI * times * v + from), 0));
    for (let x = 0; x < WIDE; x++) {
      const u = x / WIDE;
      let color = colors[0];
      if (u >= lines[lines.length - 1]) color = colors[colors.length - 1];
      else if (u > lines[0]) {
        const k = lines.findIndex((line, i) => u >= line && u < lines[i + 1]);
        const t = (u - lines[k]) / (lines[k + 1] - lines[k]);
        // Into the periwinkle gently, with no hold, so it never reads as a band
        const eased = k === colors.length - 2 ? t * t * (3 - 2 * t) : t * t * t * (t * (t * 6 - 15) + 10);
        color = turn(colors[k], colors[k + 1], eased);
      }
      image.data.set([...srgb(lab(color)), 255], (y * WIDE + x) * 4);
    }
  }
  ctx.putImageData(image, 0, 0);
  tile = canvas.toDataURL();
  return tile;
}

// oklab as lightness, colorfulness and hue, and back
const lch = ([L, A, B]: number[]) => [L, Math.hypot(A, B), Math.atan2(B, A)];
const lab = ([L, C, h]: number[]) => [L, C * Math.cos(h), C * Math.sin(h)];

// From one color to another the short way round the color wheel
function turn(from: number[], to: number[], t: number) {
  let dh = to[2] - from[2];
  if (dh > Math.PI) dh -= 2 * Math.PI;
  if (dh < -Math.PI) dh += 2 * Math.PI;
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + dh * t];
}

const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function oklab(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => linear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function srgb([L, A, B]: number[]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => Math.round(gamma(Math.min(1, Math.max(0, c))) * 255));
}

// Big glass shapes burst up from the bottom of the screen, wherever you are
// on the page, fly in arcs and fall back out of sight. A few large ones
// rather than a shower of small ones, and no frosting, so the browser can
// move them off the main thread and they stay smooth.
function burst() {
  const layer = document.createElement("div");
  layer.className = styles.burst;
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const width = window.innerWidth;
  const height = window.innerHeight;
  const colors = site.lander.glass.map((piece) => piece.color);
  const RISING = 0.45; // share of each flight spent going up
  const flights = Array.from({ length: 14 }, (_, i) => {
    const kind = i % 3;
    const size = 70 + Math.random() * 110;
    const rise = height * (0.5 + Math.random() * 0.4) + size; // from just below the screen to the top of its arc
    const fall = rise * ((1 - RISING) / RISING) ** 2; // the same gravity on the way down, so it ends lower than it began
    const timing = { duration: 2000 + Math.random() * 700, delay: Math.random() * 450, fill: "both" as const };

    // Across at a steady speed on the outside, up and down on the inside: an arc
    const toss = document.createElement("span");
    toss.className = styles.toss;
    toss.style.left = `${width * (0.15 + Math.random() * 0.7) - size / 2}px`;
    const chip = document.createElement("span");
    chip.className = styles.chip;
    chip.dataset.shape = SHAPES[kind];
    chip.style.setProperty("--c", colors[kind]);
    chip.style.width = `${size}px`;
    chip.style.height = `${size}px`;
    toss.appendChild(chip);
    layer.appendChild(toss);

    return [
      toss.animate([{ translate: "0 0" }, { translate: `${(Math.random() - 0.5) * width * 0.5}px 0` }], timing),
      chip.animate(
        [
          { translate: "0 0", easing: "cubic-bezier(0.333, 0.667, 0.667, 1)" }, // slowing as it climbs
          { translate: `0 ${-rise}px`, offset: RISING, easing: "cubic-bezier(0.333, 0, 0.667, 0.333)" }, // speeding up as it falls
          { translate: `0 ${fall - rise}px` },
        ],
        timing,
      ),
      chip.animate([{ rotate: "0deg" }, { rotate: `${(Math.random() - 0.5) * 540}deg` }], timing),
    ];
  });
  Promise.all(flights.flat().map((flight) => flight.finished)).finally(() => layer.remove());
}
