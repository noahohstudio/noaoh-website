"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { labOpen } from "@/content/site";
import { FlipText } from "./Flip";
import styles from "./IndexRail.module.css";

type Study = { slug: string; title: string; soon?: boolean };
type Item = { id: string; title: string };

// The site's index, down the left on screens wide enough for it, in place of the top bar (Noah, Oct 29: "I approve of
// the index, lets integrate that as the standard"). It came out of the formatting workshop: a side nav and everything
// centered, after Rachel Chen's, pushed until the nav was the whole index (option D in the desk's archive). Top left,
// your name, or on a case study the way back, "← work / kino". Down the left: work, with the case studies under it
// (open on the home page and in a case study), the open one's sections under its name, then lab and about. Your path
// stays in ink and the rest dims, no dot ("maybe we even just dim the index elements we aren't immediately on?"). A
// group that opens drops down, its items fading and sliding in a beat apart ("animate it so that it drops down, and
// subtly fades/slides in the children"). Lowercase, as the nav's voice. Below 1100px the top bar (Nav.tsx) stays.
export function IndexRail({ studies }: { studies: Study[] }) {
  const pathname = usePathname();
  // A case study's sections, with the page they were read from, so a list is only drawn on its own page: going from
  // one case study to the next, the last one's sections never stand in for a moment (they'd start their entrance early,
  // Noah, Oct 29: "what I learned appears faster than the rest when fading in - lets make sure it follows the order")
  const [list, setList] = useState<{ path: string; items: Item[] }>({ path: "", items: [] });
  const [at, setAt] = useState<string | null>(null);

  const slug = pathname.startsWith("/work/") ? pathname.split("/")[2] : null;
  const study = studies.find((s) => s.slug === slug);

  // A case study's sections, read off the page as it is, and the one being read
  useEffect(() => {
    if (!study) return;
    let frame = 0;
    let cleanup = () => {};
    const timer = window.setTimeout(() => {
      const sections = [...document.querySelectorAll<HTMLElement>("main article > section[id]")];
      setList({
        path: pathname,
        items: sections.map((el) => ({
          id: el.id,
          title: (el.querySelector("[class*='label']")?.textContent ?? el.id).trim(),
        })),
      });
      const pick = () => {
        frame = 0;
        const line = innerHeight * 0.4;
        let current = sections[0]?.id ?? null;
        for (const el of sections) if (el.getBoundingClientRect().top <= line) current = el.id;
        setAt(current);
      };
      const onScroll = () => (frame ||= requestAnimationFrame(pick));
      pick();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanup = () => window.removeEventListener("scroll", onScroll);
    }, 120);
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
      cleanup();
    };
  }, [study, pathname]);

  // Not on the desk, nor on the v2 workshop's nav and type renditions, which draw their own
  if (pathname.startsWith("/desk") || /^\/workshop\/v2\/(nav|type)/.test(pathname)) return null;

  const go = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Easter egg, as the top bar has it: your name, clicked on the home page, ripples the lander and pops the glass
  const poke = (event: React.MouseEvent) => {
    if (pathname !== "/") return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("noaoh:egg", { detail: "name" }));
  };
  const here = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const workOpen = pathname === "/" || Boolean(study);
  const items = list.path === pathname ? list.items : [];

  return (
    <div className={styles.rail}>
      <p className={styles.crumb}>
        {study ? (
          <>
            <Link href="/#work" aria-label="Back to the work">
              <FlipText text="← work" />
            </Link>
            <span className={styles.here}> / {study.title.toLowerCase()}</span>
          </>
        ) : (
          <Link href="/" onClick={poke}>
            <FlipText text="noah oh" />
          </Link>
        )}
      </p>

      <nav className={styles.side} aria-label="Index">
        <ul className={styles.pages}>
          <li data-at={pathname === "/" || undefined} data-path={study ? true : undefined}>
            <Link href="/">
              <FlipText text="work" />
            </Link>
            {workOpen && (
              <ul className={`${styles.studies} ${styles.drop}`} style={{ "--rows": studies.length } as React.CSSProperties}>
                {studies.map((s, i) => (
                  <li
                    key={s.slug}
                    data-at={s.slug === slug || undefined}
                    data-soon={s.soon || undefined}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    {s.soon ? (
                      <span>{s.title}</span>
                    ) : (
                      <Link href={`/work/${s.slug}`}>
                        <FlipText text={s.title} />
                      </Link>
                    )}
                    {s.slug === slug && items.length > 0 && (
                      <ul
                        key={pathname}
                        className={`${styles.sections} ${styles.drop}`}
                        style={{ "--rows": items.length } as React.CSSProperties}
                      >
                        {items.map((item, k) => (
                          <li key={item.id} data-at={item.id === at || undefined} style={{ "--i": k } as React.CSSProperties}>
                            <a href={`#${item.id}`} onClick={go(item.id)}>
                              <FlipText text={item.title} />
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
          {[
            ...(labOpen ? [{ href: "/lab", title: "lab" }] : []),
            { href: "/about", title: "about" },
          ].map((page) => (
            <li key={page.href} data-at={here(page.href) || undefined}>
              <Link href={page.href}>
                <FlipText text={page.title} />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
