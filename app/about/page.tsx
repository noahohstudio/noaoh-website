import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Noah Oh — design background, approach, and tools.",
};

const approach = [
  {
    number: "01",
    title: "Listen first",
    body: "Placeholder copy — every project starts with understanding the problem before reaching for a solution.",
  },
  {
    number: "02",
    title: "Design in systems",
    body: "Placeholder copy — decisions are made to hold up across every size, surface, and edge case.",
  },
  {
    number: "03",
    title: "Sweat the finish",
    body: "Placeholder copy — the last ten percent of a project is where the craft actually shows.",
  },
];

const skills = [
  ["Identity", "Art Direction", "Editorial Design"],
  ["Web Design", "Design Systems", "Packaging"],
  ["Figma", "Adobe Suite", "Framer"],
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-violet">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 14px)",
                  color: "var(--color-paper)",
                }}
              />
              <span className="absolute bottom-6 left-6 text-xs font-medium uppercase tracking-[0.14em] text-paper">
                Portrait placeholder
              </span>
            </div>
          </div>

          <div className="md:col-span-8">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              About
            </p>
            <h1 className="mt-6 font-display text-4xl italic leading-tight tracking-tight text-ink md:text-6xl">
              I design things that are considered, not just decorated.
            </h1>
            <div className="mt-8 max-w-xl space-y-4 text-base leading-relaxed text-ink-soft">
              <p>
                Placeholder copy — Noah Oh is a graphic and digital designer
                with a background spanning branding studios and in-house
                product teams. This paragraph will be replaced with a real
                biography.
              </p>
              <p>
                Placeholder copy — a second paragraph on interests, values,
                or a bit of personal context can go here to round out the
                introduction.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <h2 className="font-display text-3xl italic tracking-tight text-ink md:text-4xl">
            How I work
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {approach.map((item) => (
              <div key={item.number}>
                <span className="font-display text-sm text-accent">
                  {item.number}
                </span>
                <h3 className="mt-3 text-lg font-medium text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="md:col-span-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
                Skills &amp; Tools
              </p>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3 md:col-span-9">
              {skills.map((group, i) => (
                <ul key={i} className="space-y-2">
                  {group.map((item) => (
                    <li
                      key={item}
                      className="font-display text-xl text-ink"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
