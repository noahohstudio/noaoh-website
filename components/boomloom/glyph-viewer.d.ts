// Types for glyph-viewer.js, the copy from the BoomLoom handoff (plus the `construction` option).

export type GlyphViewer = {
  show(letter: string): void;
  setMode(mode: "outline" | "fill"): void;
  readonly letter: string;
  destroy(): void;
};

export function createGlyphViewer(
  container: HTMLElement,
  options?: { font?: string; construction?: string | null },
): Promise<GlyphViewer>;
