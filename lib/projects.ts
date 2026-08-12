export type TileSize = "sm" | "tall" | "lg";

export type ProjectTile = {
  id: number;
  size: TileSize;
};

// Structural placeholders only — real projects (image, title, link) get
// filled in later. Sizes control the bento span; see components/project-tile.tsx.
export const projectTiles: ProjectTile[] = [
  { id: 1, size: "sm" },
  { id: 2, size: "sm" },
  { id: 3, size: "lg" },
  { id: 4, size: "tall" },
  { id: 5, size: "lg" },
  { id: 6, size: "sm" },
  { id: 7, size: "sm" },
  { id: 8, size: "tall" },
];
