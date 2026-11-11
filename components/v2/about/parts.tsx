"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FlipText } from "@/components/Flip";
import { ripple } from "./motion";
import type { Row } from "./rows";

// The class names a rendition gives a row's parts (AboutA.module.css, AboutB.module.css)
export type RowClasses = { row: string; title: string; meta: string; role: string; context: string; year: string };

// One row of the index: title, role, organization or context, year. Reaching it, the title's letters turn over in a
// quick wave (motion.ts, ripple), and each letter still mirrors under the pointer as everywhere on the site. On wide
// screens the role and context sit in their own columns; on phones they share a line under the title and year.
// A row with a page is a link to it.
export function IndexRow({
  row,
  cls,
  onEnter,
}: {
  row: Row;
  cls: RowClasses;
  onEnter?: (event: React.PointerEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => void;
}) {
  const title = useRef<HTMLSpanElement>(null);
  const enter = (event: React.PointerEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    ripple(title.current);
    onEnter?.(event);
  };
  const inner = (
    <>
      <span ref={title} className={cls.title}>
        <FlipText text={row.title} />
      </span>
      <span className={cls.meta}>
        <span className={cls.role}>{row.role}</span>
        <span className={cls.context}>{row.context}</span>
      </span>
      <span className={cls.year}>{row.year}</span>
    </>
  );
  return row.href ? (
    <Link href={row.href} className={cls.row} onPointerEnter={enter} onFocus={enter}>
      {inner}
    </Link>
  ) : (
    <div className={cls.row} onPointerEnter={enter}>
      {inner}
    </div>
  );
}

// A sentence split into words that come into focus one after another (motion.ts, `data-resolve="words"`)
export function Words({ text, from = 0 }: { text: string; from?: number }) {
  return text.split(/(\s+)/).map((chunk, i) =>
    /^\s+$/.test(chunk) ? (
      chunk
    ) : (
      <span key={i} data-w="" style={{ "--w": from + i / 2, whiteSpace: "nowrap" } as React.CSSProperties}>
        {chunk}
      </span>
    ),
  );
}

// Words that never break across lines, hyphenated ones included ("front-end"), as the site's letters do (Flip.tsx)
export function Keep({ text }: { text: string }) {
  return text.split(/(\s+)/).map((chunk, i) =>
    /^\s+$/.test(chunk) ? (
      chunk
    ) : (
      <span key={i} style={{ whiteSpace: "nowrap" }}>
        {chunk}
      </span>
    ),
  );
}

export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;

// A quiet button that copies the address, saying so for a moment
export function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <>
      <button type="button" className={className} onClick={copy} aria-label={copied ? "Email copied" : `Copy ${email}`}>
        <FlipText text={copied ? "Copied" : "Copy"} />
      </button>
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </>
  );
}
