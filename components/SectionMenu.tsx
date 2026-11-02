"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { Branch } from "@/lib/deskTree";
import { FlipText } from "./Flip";
import styles from "./SectionMenu.module.css";

type Item = { id: string; title: string };

const LINE = 0.35; // a section is current once its top passes this far down the screen, as on the home page

// The page's sections in the middle of the nav, one at a time (Noah, Oct 27: "instead of having the dial, lets just
// have one section show at a time. Clicking it opens a similarly styled dropdown menu, and clicking one section takes
// you there"). The section you're reading shows, and changes as you scroll; click it and a menu of the nav's glass
// drops under it with every section, the one you're in black. Escape, a click outside or a choice closes it. The arrow
// keys are left alone, since they belong to the Konami code. It replaced the dial (SectionDial.tsx, parked).
// The menu sits on the page, not in the nav, so its glass blurs the page behind it as the nav's does: inside the nav's
// own blur, it would see only the nav.
//
// Given a tree (the desk's), it's a cascading menu instead, like Photoshop's (Noah, Oct 27: "The 3 main pages are the
// first nav, then subsections of each are the next"): the pages, each with a ▸; pointing at one, or tabbing to it,
// flies its sections out beside it, and the page you're on opens its own. A page goes to its top, a section straight
// to itself. The flyout sits on the page too, beside the menu, for the same reason.
export function SectionMenu({ items, tree, branch: page }: { items: Item[]; tree?: Branch[]; branch?: string }) {
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState<{ x: number; y: number } | null>(null); // where the menu hangs, under the button
  const [fly, setFly] = useState<{ index: number; x: number; y: number } | null>(null); // a page's sections, beside it
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const flyout = useRef<HTMLUListElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useId();

  useEffect(() => {
    const pick = () => {
      const line = window.innerHeight * LINE;
      let index = 0;
      items.forEach((item, i) => {
        const top = document.getElementById(item.id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) index = i;
      });
      setCurrent(index);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [items]);

  // Hangs under the nav, centered on the button, and follows it if the window changes
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const box = button.current?.getBoundingClientRect();
      const bar = root.current?.closest("[data-nav]")?.getBoundingClientRect();
      if (box) setAt({ x: box.left + box.width / 2, y: (bar ?? box).bottom + 8 });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open]);

  // In a tree, the page you're on opens its own sections once the menu is in place
  const here = tree?.findIndex((b) => b.id === page) ?? -1;
  const branchOut = (index: number) => {
    const row = rows.current[index]?.getBoundingClientRect();
    const box = list.current?.getBoundingClientRect();
    if (row && box) setFly({ index, x: box.right + 6, y: row.top - 6 });
  };
  useEffect(() => {
    if (!open || !at || !tree) return setFly(null);
    if (here >= 0) requestAnimationFrame(() => branchOut(here));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once each time it opens and is placed
  }, [open, at]);

  // Closes on Escape, back on its button, or on a click anywhere else
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const away = (event: PointerEvent) => {
      const target = event.target as Node;
      if (![root, list, flyout].some((part) => part.current?.contains(target))) setOpen(false);
    };
    window.addEventListener("keydown", key);
    window.addEventListener("pointerdown", away);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("pointerdown", away);
    };
  }, [open]);

  const go = (index: number) => {
    setOpen(false);
    setCurrent(index);
    document.getElementById(items[index].id)?.scrollIntoView({ block: "start" });
  };

  // A section in the tree: on this page, scrolls to it; on another, goes there
  const goTo = (b: Branch, id: string) => {
    setOpen(false);
    if (b.id === page) document.getElementById(id)?.scrollIntoView({ block: "start" });
    else window.location.assign(`${b.href}#${id}`);
  };

  const section = items[current];
  const pageTitle = tree?.[here]?.title;
  const glass = (point: { x: number; y: number }) => ({ "--x": `${point.x}px`, "--y": `${point.y}px` }) as CSSProperties;

  return (
    <nav ref={root} className={styles.sections} aria-label="Sections" data-open={open || undefined}>
      <button
        ref={button}
        type="button"
        className={styles.current}
        aria-expanded={open}
        aria-controls={menu}
        onClick={() => setOpen((was) => !was)}
      >
        {/* In a tree, the page you're on leads, gray, then the section you're in */}
        {pageTitle && section && section.title !== pageTitle && <span className={styles.page}>{pageTitle}</span>}
        {/* Keyed, so a new section's name fades up in place of the last */}
        <span key={section?.id} className={styles.name}>
          {section?.title}
        </span>
        <svg className={styles.chevron} viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2.5 4l2.5 2.5L7.5 4" />
        </svg>
      </button>
      {open &&
        at &&
        createPortal(
          tree ? (
            <ul ref={list} id={menu} className={`${styles.menu} ${styles.tree}`} aria-label="Desk pages" style={glass(at)}>
              {tree.map((b, i) => (
                <li
                  key={b.id}
                  ref={(el) => {
                    rows.current[i] = el;
                  }}
                  onPointerEnter={() => branchOut(i)}
                >
                  <a
                    href={b.href}
                    aria-current={b.id === page ? "page" : undefined}
                    aria-expanded={fly?.index === i}
                    data-open={fly?.index === i || undefined}
                    onFocus={() => branchOut(i)}
                  >
                    <FlipText text={b.title} />
                    <svg className={styles.more} viewBox="0 0 10 10" aria-hidden="true">
                      <path d="M4 2.5L6.5 5 4 7.5" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ul ref={list} id={menu} className={styles.menu} aria-label="Go to a section" style={glass(at)}>
              {items.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={i === current ? "location" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      go(i);
                    }}
                  >
                    <FlipText text={item.title} />
                  </a>
                </li>
              ))}
            </ul>
          ),
          document.body,
        )}
      {open &&
        tree &&
        fly &&
        createPortal(
          <ul
            key={fly.index}
            ref={flyout}
            className={`${styles.menu} ${styles.flyout}`}
            aria-label={`Sections of ${tree[fly.index].title}`}
            style={glass(fly)}
          >
            {tree[fly.index].sections.map((s) => {
              const b = tree[fly.index];
              return (
                <li key={s.id}>
                  <a
                    href={`${b.href}#${s.id}`}
                    aria-current={b.id === page && s.id === section?.id ? "location" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      goTo(b, s.id);
                    }}
                  >
                    <FlipText text={s.title} />
                  </a>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </nav>
  );
}
