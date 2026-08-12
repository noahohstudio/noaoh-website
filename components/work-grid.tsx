import ProjectTile from "@/components/project-tile";
import { projectTiles } from "@/lib/projects";

export default function WorkGrid() {
  return (
    <section
      id="work"
      className="scroll-mt-14 bg-paper px-6 py-16 sm:scroll-mt-16 sm:px-8 lg:scroll-mt-20 lg:px-12 lg:py-20"
    >
      <p className="text-[15px] text-ink/50 lg:text-[18px] lg:tracking-[-0.07em]">
        work
      </p>
      <div className="mt-8 grid grid-flow-dense grid-cols-6 gap-3 auto-rows-[clamp(150px,18vw,230px)] lg:grid-cols-12 lg:gap-6">
        {projectTiles.map((tile) => (
          <ProjectTile key={tile.id} id={tile.id} size={tile.size} />
        ))}
      </div>
    </section>
  );
}
