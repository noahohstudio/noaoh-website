import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Noah Oh about a project.",
};

const socials = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://www.linkedin.com", label: "LinkedIn" },
  { href: "https://read.cv", label: "Read.cv" },
  { href: "https://are.na", label: "Are.na" },
];

export default function ContactPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-gold">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 14px)",
            color: "var(--color-ink)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink/70">
            Contact
          </p>
          <h1 className="mt-6 font-display text-5xl italic leading-[0.95] tracking-tight text-ink sm:text-6xl md:text-7xl">
            Let&apos;s talk
            <br />
            about your project.
          </h1>
          <Link
            href="mailto:hello@noahoh.design"
            className="mt-10 inline-block break-all font-display text-2xl text-ink underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70 sm:text-3xl md:text-4xl"
          >
            hello@noahoh.design
          </Link>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-12 md:px-10 md:py-24">
          <div className="md:col-span-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              Availability
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
              <span className="h-2 w-2 shrink-0 rounded-full bg-pine" />
              Placeholder — currently booking new projects for early 2027.
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              Elsewhere
            </p>
            <ul className="mt-4 space-y-2">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-xl text-ink transition-opacity hover:opacity-70"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft">
              Based In
            </p>
            <p className="mt-4 font-display text-xl text-ink">
              Los Angeles, CA
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Working with clients worldwide.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
