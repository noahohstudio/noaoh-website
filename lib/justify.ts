/*
  Line breaking for the lander sentence.

  The sentence is split into units (a word, or words bound with a no-break
  space, like "noah oh"), measured once in ems. The goal: fill the screen top
  to bottom and edge to edge, with clean lines, at one even size.

  For each possible number of lines, the size that fills the height is known
  (height / lines). At that size this finds the line breaks that need the least
  visible stretching, and decides which lines get a glass piece. A line with a
  piece is filled by stretching the piece, so pieces go where a line needs
  filling. They stay in order: the first near the top, the last near the bottom.

  How a line fills its width:
  - with a glass piece: the piece grows (free up to a point, then not)
  - without one: a hair of extra letter-spacing, plus slightly wider word gaps
  - the last line may sit flush left instead of stretching
*/

export type Row = {
  units: number[];
  piece: number | null; // which glass piece sits on this line
  mode: "elastic" | "justify" | "start";
  stretch: number; // for "justify": how far the line stretches, 1 = its comfortable limit
};

export type Layout = { size: number; rows: Row[] };

type Input = {
  widths: number[]; // natural width of each unit, in em
  letters: number[]; // letters in each unit
  gaps: number[]; // word gaps inside each unit ("noah oh" has one)
  pieces: number; // glass pieces to place
  slot: number; // a piece's narrowest width, in em
  gap: number; // space between words, in em
  width: number; // available width, px
  height: number; // available height, px
  lineHeight: number; // in em
};

export const TRACK = 0.012; // em of extra letter-spacing per letter at a line's comfortable limit
const SAFETY = 0.03; // em left free on every line, so rounding never overflows
const FREE_GROWTH = 2.4; // em a piece can grow at no cost
const MAX_GROWTH = 6; // em past which a piece reads as a stripe
const SOFT_STRETCH = 1.5; // past this, stretched word gaps start to look like holes
const PLACEMENT = 4; // how firmly pieces keep to top, middle, bottom
const FILL = 40; // cost of leaving the screen 100% unfilled; 5% short costs 2

function lineCost(slack: number, gaps: number, letters: number, piece: boolean, last: boolean, gap: number) {
  if (piece) {
    const over = Math.max(0, slack - FREE_GROWTH);
    return over ** 2 + (slack > MAX_GROWTH ? 200 : 0);
  }
  const stretch = slack / (gaps * gap + letters * TRACK);
  if (last && stretch > 1.2) return 3; // flush left is fine on the last line, a full one is better
  if (gaps === 0) return 80 + stretch ** 2; // one word can't be justified
  return stretch ** 2 + Math.max(0, stretch - SOFT_STRETCH) ** 2 * 12;
}

// The cheapest way to set the sentence in exactly `lines` lines at `size`.
function breakLines(input: Input, size: number, lines: number) {
  const { widths, letters, gaps, pieces, slot, gap } = input;
  const n = widths.length;
  const lineWidth = input.width / size - SAFETY;
  if (lines < pieces || lines > n) return null;
  // Where each piece would ideally sit: spread evenly from the first line to the last
  const target = (p: number) => (pieces === 1 ? 0 : (p / (pieces - 1)) * (lines - 1));

  // cost[l][j][p]: first j units on l lines, with p pieces placed
  const shape = () => Array.from({ length: lines + 1 }, () => Array.from({ length: n + 1 }, () => new Array<number>(pieces + 1).fill(Infinity)));
  const cost = shape();
  const from: [number, number, boolean][][][] = Array.from({ length: lines + 1 }, () => Array.from({ length: n + 1 }, () => new Array(pieces + 1)));
  cost[0][0][0] = 0;

  for (let l = 1; l <= lines; l++) {
    for (let j = 1; j <= n; j++) {
      let natural = -gap;
      let count = 0;
      let inner = 0;
      for (let i = j - 1; i >= 0; i--) {
        natural += widths[i] + gap;
        count += letters[i];
        inner += gaps[i];
        if (natural > lineWidth) break;
        for (let p = 0; p <= pieces; p++) {
          for (const piece of [false, true]) {
            const before = piece ? p - 1 : p;
            if (before < 0 || cost[l - 1][i][before] === Infinity) continue;
            const used = natural + (piece ? gap + slot : 0);
            if (used > lineWidth) continue;
            let total =
              cost[l - 1][i][before] + lineCost(lineWidth - used, j - i - 1 + inner, count, piece, j === n, gap);
            if (piece) total += (l - 1 - target(before)) ** 2 * PLACEMENT;
            if (total < cost[l][j][p]) {
              cost[l][j][p] = total;
              from[l][j][p] = [i, before, piece];
            }
          }
        }
      }
    }
  }
  if (cost[lines][n][pieces] === Infinity) return null;

  const rows: Row[] = [];
  for (let l = lines, j = n, p = pieces; l > 0; l--) {
    const [i, before, piece] = from[l][j][p];
    const units = Array.from({ length: j - i }, (_, k) => i + k);
    const natural = units.reduce((sum, u) => sum + widths[u] + gap, -gap);
    const count = units.reduce((sum, u) => sum + letters[u], 0);
    const inner = units.reduce((sum, u) => sum + gaps[u], 0);
    const stretch = (lineWidth - natural) / ((units.length - 1 + inner) * gap + count * TRACK);
    const mode = piece ? "elastic" : (j === n && stretch > 1.2) || units.length + inner === 1 ? "start" : "justify";
    rows.unshift({ units, piece: piece ? before : null, mode, stretch: mode === "justify" ? stretch : 0 });
    j = i;
    p = before;
  }
  return { cost: cost[lines][n][pieces], rows };
}

// Tries every line count. For each, starts at the size that exactly fills the
// height and steps down a little if that sets much cleaner lines.
export function layoutSentence(input: Input): Layout | null {
  let best: (Layout & { score: number }) | null = null;
  for (let lines = Math.max(1, input.pieces); lines <= input.widths.length; lines++) {
    const fill = input.height / (lines * input.lineHeight);
    for (let step = 0; step <= 15; step++) {
      const size = Math.floor(fill * (1 - step * 0.01) * 10) / 10;
      const result = breakLines(input, size, lines);
      if (!result) continue;
      const score = result.cost + FILL * (1 - size / fill);
      if (!best || score < best.score) best = { size, rows: result.rows, score };
    }
  }
  return best && { size: best.size, rows: best.rows };
}
