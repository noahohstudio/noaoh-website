import type { Metadata } from "next";
import PlaceholderThumb from "@/components/placeholder-thumb";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected design work — brand, editorial, and web projects.",
};

export default function WorkPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16 md:px-10 md:pb-16 md:pt-24">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              Selected Work
            </p>
            <h1 className="mt-6 font-display text-6xl italic tracking-tight text-ink md:text-7xl">
              Work
            </h1>
          </div>
          <div className="md:col-span-4 md:self-end">
            <p className="text-sm leading-relaxed text-ink-soft">
              A collection of placeholder projects spanning identity,
              editorial, packaging, and web design. Real case studies will
              replace these thumbnails.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <article
                key={project.slug}
                className={project.large ? "lg:col-span-2" : undefined}
              >
                <PlaceholderThumb
                  color={project.color}
                  index={i + 1}
                  className={project.large ? "aspect-[16/9]" : "aspect-[4/5]"}
                />
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-2xl text-ink">
                    {project.title}
                  </h2>
                  <span className="shrink-0 text-xs text-ink-soft">
                    {project.year}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {project.category}
                </p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                  {project.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
