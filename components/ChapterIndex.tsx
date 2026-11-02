"use client";

import { useEffect, useState } from "react";
import { FlipText } from "./Flip";
import styles from "./CaseStudy.module.css";

type Item = { id: string; title: string };

// The case study's sections. The one you're reading is selected.
export function ChapterIndex({ items, minutes }: { items: Item[]; minutes: number }) {
  const [current, setCurrent] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className={styles.index} aria-label="Sections">
      <p className={styles.indexTitle}>{minutes} min read</p>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={current === item.id ? "location" : undefined}>
              <FlipText text={item.title} />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
