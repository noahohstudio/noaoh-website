import Link from "next/link";
import PlaceholderThumb from "@/components/placeholder-thumb";
import { projects } from "@/lib/projects";

const featured = projects.filter((project) => project.featured).slice(0, 3);

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-16 md:px-10 md:pb-28 md:pt-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              Graphic &amp; Digital Design
            </p>
            <h1 className="mt-6 font-display text-[13vw] leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Design that
              <br />
              holds <em className="italic text-accent">still</em>
              <br />
              and moves people.
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-ink-soft">
              I&apos;m Noah Oh, a graphic and digital designer working across
              brand identity, editorial, and web. This is placeholder copy —
              a short introduction will live here.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <Link
                href="/work"
                className="inline-flex items-center rounded-full bg-ink px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-paper transition-opacity hover:opacity-80"
              >
                View Work
              </Link>
              <Link
                href="/contact"
                className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
              >
                Get in touch
              </Link>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-accent">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 14px)",
                  color: "var(--color-paper)",
                }}
              />
              <p className="absolute bottom-6 left-6 right-6 font-display text-2xl italic leading-tight text-paper">
                Currently designing for clients worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Selected work */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-display text-4xl italic tracking-tight text-ink md:text-5xl">
              Selected Work
            </h2>
            <Link
              href="/work"
              className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
            >
              View all work →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, i) => (
              <article key={project.slug}>
                <PlaceholderThumb
                  color={project.color}
                  index={i + 1}
                  className="aspect-[4/5]"
                />
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl text-ink">
                    {project.title}
                  </h3>
                  <span className="shrink-0 text-xs text-ink-soft">
                    {project.year}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">
                  {project.category}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-20 md:grid-cols-12 md:px-10 md:py-28">
          <div className="md:col-span-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              About
            </p>
          </div>
          <div className="md:col-span-7">
            <p className="font-display text-2xl leading-snug text-ink md:text-3xl">
              Placeholder copy — a short paragraph on approach and process
              will live here, describing how each project moves from concept
              to considered, finished detail.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block text-xs font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
            >
              More about me →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden border-t border-line bg-ink">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 14px)",
            color: "var(--color-paper)",
          }}
        />
        <Link
          href="/contact"
          className="group relative mx-auto flex max-w-7xl flex-col gap-6 px-6 py-20 md:flex-row md:items-center md:justify-between md:px-10 md:py-28"
        >
          <h2 className="font-display text-4xl italic leading-tight text-paper sm:text-5xl md:text-6xl">
            Let&apos;s make something
            <br />
            worth looking at.
          </h2>
          <span className="inline-flex w-fit items-center rounded-full bg-accent px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-paper transition-opacity group-hover:opacity-80">
            Start a project
          </span>
        </Link>
      </section>
    </>
  );
}
