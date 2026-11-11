"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navLinks, site } from "@/content/site";
import { FlipText } from "./Flip";
import { SectionMenu } from "./SectionMenu";
import type { Branch } from "@/lib/deskTree";
import styles from "./Nav.module.css";

const HOME_SECTIONS = ["intro", "work"];

// Where you are. On the home page, it's the last section whose top has passed
// the middle of the screen, so the work once it fills more of it than not, as on the rail (Noah, Nov 11: "work should
// only open up its sections when its moreso in the viewport"); elsewhere, the page you're on.
function useSection() {
  const pathname = usePathname();
  const [section, setSection] = useState("intro");

  useEffect(() => {
    if (pathname !== "/") return;
    const pick = () => {
      const line = window.innerHeight * 0.5;
      let current = HOME_SECTIONS[0];
      for (const id of HOME_SECTIONS) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) current = id;
      }
      setSection(current);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [pathname]);

  if (pathname === "/") return section;
  // Whole path segments only, so /workshop doesn't count as /work
  return (
    site.nav.find((item) => pathname === `/${item.section}` || pathname.startsWith(`/${item.section}/`))?.section ??
    null
  );
}

// A frosted bar of plain text. The part of the site you're in is black,
// everything else gray. On a case study, the section you're reading sits in the middle; click it for the rest.
export function Nav({
  current,
  sections,
  tree,
  branch,
}: {
  current?: string;
  sections?: { id: string; title: string }[];
  tree?: Branch[]; // the desk's pages and their sections, for a cascading menu (lib/deskTree.ts)
  branch?: string; // which of them this page is
}) {
  const pathname = usePathname();
  const spotted = useSection();
  const section = current ?? spotted;

  // Easter egg: glass thrown up into the nav tints it for a moment
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    const tint = (event: Event) => {
      const el = bar.current;
      const { color, x, y } = (event as CustomEvent<{ color: string; x: number; y: number }>).detail;
      if (!el) return;
      const box = el.getBoundingClientRect();
      if (x < box.left || x > box.right || y > box.bottom || y < box.top - box.height) return;
      el.style.setProperty("--tint", color);
      el.removeAttribute("data-tint");
      void el.offsetWidth; // start the fade over if it's already running
      el.setAttribute("data-tint", "");
    };
    window.addEventListener("noaoh:tint", tint);
    return () => window.removeEventListener("noaoh:tint", tint);
  }, []);

  // Easter egg: your name, clicked while you're already on the lander
  const poke = (event: React.MouseEvent) => {
    if (pathname !== "/" || section !== "intro") return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("noaoh:egg", { detail: "name" }));
  };

  return (
    <header ref={bar} className={styles.nav} data-nav>
      <nav className={styles.inner} data-text="small" aria-label="Main">
        {/* Inside a case study, the way back out to the work, where your name sits elsewhere (Noah, Oct 29: "Can we
            make a back button for when you're inside the case studies?") */}
        {pathname.startsWith("/work/") ? (
          <Link href="/#work" className={styles.name} aria-label="Back to the work">
            <FlipText text="← work" />
          </Link>
        ) : (
          <Link
            href="/"
            className={styles.name}
            aria-current={section === "intro" ? "true" : undefined}
            onClick={poke}
          >
            <FlipText text={site.name.toLowerCase()} />
          </Link>
        )}
        {sections && <SectionMenu items={sections} tree={tree} branch={branch} />}
        <ul className={styles.links}>
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={section === item.section ? "true" : undefined}>
                <FlipText text={item.label} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
