// Types for zine-book.js, the frozen copy from the BoomLoom handoff. The module itself stays as it was approved.

export type ZineBook = {
  canvas: HTMLCanvasElement;
  next(): void;
  prev(): void;
  readonly page: number;
  pose(options?: {
    k?: number;
    flips?: { sheet: number; progress: number; tilt?: number; dir?: number; curl?: number }[];
  }): void;
  release(): void;
  sheets: number;
  destroy(): void;
};

export function createZineBook(
  container: HTMLElement,
  options: {
    spreads: string[];
    cover?: string | null;
    preserveDrawingBuffer?: boolean;
    background?: string | null;
    bleed?: { x: number; y: number }; // noaoh.com: room past the book's box on each side, as a share of it
  },
): Promise<ZineBook>;
