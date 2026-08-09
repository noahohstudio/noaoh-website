import Link from "next/link";

const socials = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://www.linkedin.com", label: "LinkedIn" },
  { href: "https://read.cv", label: "Read.cv" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-2xl italic text-ink">
              Say hello.
            </p>
            <Link
              href="mailto:hello@noahoh.design"
              className="mt-1 inline-block text-sm text-ink-soft transition-colors hover:text-ink"
            >
              hello@noahoh.design
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse gap-2 border-t border-line pt-6 text-xs text-ink-soft md:flex-row md:items-center md:justify-between">
          <p>&copy; {year} Noah Oh. All rights reserved.</p>
          <p>Based in Los Angeles, CA — working worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
