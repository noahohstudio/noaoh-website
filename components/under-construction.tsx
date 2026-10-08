import OrbitDots from "@/components/orbit-dots";

export default function UnderConstruction() {
  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-paper px-5 text-ink">
      <div className="relative">
        <OrbitDots />
        <h1 className="relative text-center font-geist text-[clamp(1.75rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.055em]">
          <span className="block">Currently</span>{" "}
          <span className="block">under construction</span>
        </h1>
      </div>

      <a
        href="/resume.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 font-geist text-[15px] leading-none tracking-[-0.01em] text-void transition-opacity hover:opacity-70"
      >
        my resume
      </a>
    </main>
  );
}
