import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex h-screen w-full flex-col justify-between overflow-hidden bg-void px-5 pb-5 text-paper sm:px-8 sm:pb-6 lg:px-12 lg:pb-8"
    >
      <div className="grid h-14 flex-none grid-cols-2 items-center gap-6 text-[13px] tracking-[-0.02em] sm:h-16 sm:text-[15px] lg:h-20 lg:grid-cols-12 lg:gap-6 lg:text-[18px] lg:tracking-[-0.07em]">
        <a
          href="mailto:hello@noaoh.com"
          className="col-span-2 hidden w-fit hover:opacity-70 sm:mx-auto sm:block lg:col-span-8 lg:col-start-5 lg:mx-0"
        >
          hello@noaoh.com
        </a>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 items-start gap-6 pt-[calc(17.375vh_-_56px)] sm:pt-[calc(17.375vh_-_64px)] lg:grid-cols-12 lg:gap-6 lg:pt-[calc(17.375vh_-_80px)]">
        <div
          id="about"
          className="order-2 col-span-2 grid scroll-mt-14 grid-cols-2 gap-6 sm:scroll-mt-16 lg:order-1 lg:col-span-3 lg:col-start-1 lg:flex lg:h-auto lg:flex-col lg:scroll-mt-20 lg:gap-[14.375vh]"
        >
          <div>
            <p className="text-[13px] sm:text-[15px] lg:text-[18px] lg:tracking-[-0.07em]">
              contact
            </p>
            <div className="mt-2 flex flex-col gap-0.5 text-[13px] leading-[1.3] sm:text-[15px] lg:mt-[51px] lg:gap-1 lg:text-[18px] lg:leading-[1.33] lg:tracking-[-0.07em]">
              <a href="#" className="w-fit hover:opacity-70">
                linkedin
              </a>
              <a
                href="mailto:hello@noaoh.com"
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
            <p className="mt-2 text-[13px] leading-[1.3] sm:text-[15px] lg:mt-[51px] lg:text-[18px] lg:leading-[1.33] lg:tracking-[-0.07em]">
              packaging &amp; visual designer
              <br />
              @ BoomLoom Looms
            </p>
          </div>
        </div>

        <div className="order-1 col-span-2 lg:order-2 lg:col-span-8 lg:col-start-5 lg:flex lg:h-full lg:flex-col lg:justify-between">
          <div>
            <div className="lg:min-h-[calc(14.375vh_+_186px)]">
              <h1 className="font-display italic leading-[0.92] tracking-[-0.02em] text-[clamp(1.6rem,min(7.5vw,8vh),72px)] lg:not-italic lg:tracking-[-0.05em]">
                <span className="not-italic">{"NOAH OH "}</span>
                <em className="italic">is a</em>
                <span className="not-italic"> VISUAL DESIGNER</span>{" "}
                <em className="italic">focused on</em>{" "}
                <span className="not-italic">
                  PRODUCT, BRANDING, &amp; TYPOGRAPHY.
                </span>
              </h1>
            </div>
            <p className="mt-3 font-display italic leading-[0.92] tracking-[-0.02em] text-[clamp(1.6rem,min(7.5vw,8vh),72px)] sm:mt-4 lg:mt-0 lg:not-italic">
              <em className="italic">Based at</em>{" "}
              <span className="not-italic">THE COOPER UNION, </span>
              <em className="italic">New York City</em>
              <span className="not-italic">.</span>
            </p>
          </div>

          <div className="relative mt-4 aspect-[728/125] w-full overflow-hidden select-none sm:mt-6 [-webkit-user-drag:none]">
            <Image
              src="/hero-vid.png"
              alt=""
              fill
              draggable={false}
              sizes="(min-width: 1024px) 728px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      <p className="absolute bottom-5 left-5 text-[11px] tracking-[-0.02em] sm:bottom-6 sm:left-8 sm:text-[13px] lg:bottom-8 lg:left-12 lg:text-[18px] lg:tracking-[-0.07em]">
        © 2026 noah oh
      </p>
    </section>
  );
}
