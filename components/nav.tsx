const navRight = [
  { label: "work", href: "#work" },
  { label: "play", href: null },
  { label: "about", href: "#about" },
];

export default function Nav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-x-6 gap-y-2 bg-void px-5 text-[13px] tracking-[-0.02em] text-paper sm:h-16 sm:px-8 sm:text-[15px] lg:h-20 lg:px-12 lg:text-[18px] lg:tracking-[-0.07em]">
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
  );
}
