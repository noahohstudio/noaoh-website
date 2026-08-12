import Image from "next/image";

const navRight = [
  { label: "work", href: "#work" },
  { label: "play", href: null },
  { label: "about", href: "#about" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex h-screen w-full flex-col justify-between overflow-hidden bg-void px-5 py-5 text-paper sm:px-8 sm:py-6 lg:px-12 lg:py-8"
    >
      <nav className="flex flex-none flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[13px] tracking-[-0.02em] sm:text-[15px] lg:text-[18px] lg:tracking-[-0.07em]">
        <a href="#top" className="hover:opacity-70">
          home
        </a>
        <a href="mailto:hello@noahoh.com" className="hover:opacity-70">
          hello@noahoh.com
        </a>
        <div className="flex items-center gap-5 lg:gap-8">
          {navRight.map((item) =>
            item.href ? (
              <a key={item.label} href={item.href} className="hover:opacity-70">
                {item.label}
              </a>
            ) : (
              <span key={item.label} className="opacity-70">
                {item.label}
              </span>
            ),
          )}
        </div>
      </nav>

      <div className="grid min-h-0 flex-1 grid-cols-2 items-center gap-6 py-4 lg:grid-cols-12 lg:gap-8 lg:py-0">
        <div
          id="about"
          className="order-2 col-span-2 grid grid-cols-2 gap-6 self-end scroll-mt-24 lg:order-1 lg:col-span-3 lg:col-start-1 lg:flex lg:h-full lg:flex-col lg:justify-between lg:gap-0 lg:self-auto"
        >
          <div>
            <p className="text-[13px] sm:text-[15px] lg:text-[18px] lg:tracking-[-0.07em]">
              contact
            </p>
            <div className="mt-2 flex flex-col gap-0.5 text-[13px] leading-[1.3] sm:text-[15px] lg:mt-4 lg:gap-1 lg:text-[18px] lg:leading-[1.33] lg:tracking-[-0.07em]">
              <a href="#" className="w-fit hover:opacity-70">
                linkedin
              </a>
              <a
                href="mailto:hello@noahoh.com"
                className="w-fit hover:opacity-70"
              >
                email
              </a>
              <a href="#" className="w-fit hover:opacity-70">
                instagram
              </a>
              <a href="#" className="w-fit hover:opacity-70">
                resume / CV
              </a>
            </div>
          </div>

          <div>
            <p className="text-[13px] sm:text-[15px] lg:text-[18px] lg:tracking-[-0.07em]">
              currently
            </p>
            <p className="mt-2 text-[13px] leading-[1.3] sm:text-[15px] lg:mt-4 lg:text-[18px] lg:leading-[1.33] lg:tracking-[-0.07em]">
              packaging &amp; visual designer
              <br />
              @ BoomLoom Looms
            </p>
          </div>
        </div>

        <div className="order-1 col-span-2 lg:order-2 lg:col-span-9 lg:col-start-4">
          <h1 className="font-display italic leading-[0.92] tracking-[-0.02em] text-[clamp(1.6rem,min(7.5vw,8vh),72px)] lg:not-italic lg:tracking-[-0.05em]">
            <span className="not-italic">{"NOAH OH "}</span>
            <em className="italic">is a</em>
            <span className="not-italic"> VISUAL DESIGNER</span>{" "}
            <em className="italic">focused on</em>{" "}
            <span className="not-italic">
              PRODUCT, BRANDING, &amp; TYPOGRAPHY.
            </span>
          </h1>
          <p className="mt-3 font-display italic leading-[0.92] tracking-[-0.02em] text-[clamp(1.6rem,min(7.5vw,8vh),72px)] sm:mt-4 lg:mt-6 lg:not-italic">
            <em className="italic">Based at</em>{" "}
            <span className="not-italic">THE COOPER UNION, </span>
            <em className="italic">New York City</em>
            <span className="not-italic">.</span>
          </p>

          <div className="relative mt-4 aspect-[728/125] w-full overflow-hidden rounded-lg sm:mt-6 lg:mt-8 lg:rounded-2xl">
            <Image
              src="/hero-vid.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 728px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      <p className="flex-none text-[11px] tracking-[-0.02em] sm:text-[13px] lg:text-[18px] lg:tracking-[-0.07em]">
        © 2026 noah oh
      </p>
    </section>
  );
}
