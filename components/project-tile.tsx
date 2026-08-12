import type { TileSize } from "@/lib/projects";

const spanBySize: Record<TileSize, string> = {
  sm: "col-span-3 row-span-1",
  tall: "col-span-3 row-span-2",
  lg: "col-span-6 row-span-2",
};

type ProjectTileProps = {
  id: number;
  size: TileSize;
};

export default function ProjectTile({ id, size }: ProjectTileProps) {
  return (
    <div
      className={`relative border border-ink/15 ${spanBySize[size]}`}
    >
      <span className="absolute bottom-3 left-3 text-xs text-ink/30 lg:bottom-4 lg:left-4">
        {String(id).padStart(2, "0")}
      </span>
    </div>
  );
}
