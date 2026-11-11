"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { FlipText } from "@/components/Flip";
import { fit, useFinePointer, useTurn } from "./motion";
import { CopyEmail, Keep } from "./parts";
import { invitation, statement, type Pic } from "./rows";
import { personal, type PersonalRow } from "./personal";
import styles from "./AboutB2.module.css";
import "./pointer.css"; // hides the pointer page-wide while a picture stands in for it (PictureCursor)

/*
  v2 about, round 2 (Noah, Nov 8: "About B, but on white, with the structure of A, as I like the centred nature of my
  site. Also, the top right nav is not needed, nor is the photo section at the bottom, which is redundant").

  Refined twice. First for calm (Noah: "much more subtler ... subtler dividing lines ... functional, and easy to use"):
  rows at body size in Geist, the site's hairline, one portrait, a column header, and one hover response throughout.
  Then motion back, subtle and elevated (Noah: "bring back appearance animation for reach out lines, bring back cursor
  photos ... an animation for the appearance of the photos, along with the hover of the sections ... lighten the
  lines just a little more"):
  - reaching a row, its title eases right as the rest of the row comes up to ink; 8px since Noah's "The bump indicator
    could be a little more apparent" (Nov 9), 4px before
  - the contact's lines come into focus one after another as the section shows
  Then crisper between pictures (Noah, Nov 9: "the fluidity between each image is a little strong right now, lets loosen
  it just a little"), and the picture as the cursor itself (Noah, Nov 9: "My cursor should be replaced with the photo
  itself, and should be exactly where my cursor is. Lets loosen the appear effect just a little more too"):
  - over a row with a picture, the pointer is hidden and the picture is centered exactly on it, 1:1, no lag; over a row
    without one, and anywhere else, the pointer is the usual one
  - it appears from 98.5% and fades, and between pictures the new one fades in quickly over the old while the frame
    takes its shape; pictures are never blurred or filtered
  - with reduced motion: the usual pointer, and the picture sits still in the margin beside its row
  Then made personal (Noah, Nov 9: "The header and captions could be merged in the announcement font size, the
  portrait should be one of the entries, and the entries are all personal - not work related ... Big focus on people
  and mentors ... No year is necessary. Maybe just a longer context line?"):
  - the opening sentence and the bio are one statement, at the statement size, as written in content/site.ts
  - the index is people and life, not work (personal.ts): who or what, its kind, and a longer line of context; the
    portrait is Noah's own row
  Then (Noah, Nov 9): related entries as parents and children ("parent: djing the knicks parade, child: the crowd that
  night. Both hoverable"), in the rail's language: a child sits one indent step in, lighter, grouped under its parent
  with no rule between; the bio at the title size in Geist ("we need to make the about text smaller"); the pictures
  turning a little faster; and everything settling in fully ("the elements dont seem fully loaded in right now"): the
  entrance catches rows that arrive late or were scrolled past, and a picture shows only once it's decoded.
*/
const LIST = personal;
type Row = PersonalRow;
const FLAT: Row[] = LIST.flatMap((row) => [row, ...(row.children ?? [])]); // parents and children, in reading order
const AT = new Map(FLAT.map((row, i) => [row.id, i]));
type Hover = { i: number; el: HTMLElement; top: number }; // the row (in FLAT), and its middle within the index (for the margin)
const TURN_MS = 1100; // a row with more than one picture cross-fades between them this often (1.4s until Noah's "flip
// through a little faster. Just a little!", Nov 9)

// Pictures are fetched and decoded once the page has settled, and one shows only when it's decoded, so the picture by
// the pointer never comes up blank or drawing itself in (the JPEGs are progressive: unloaded, they paint coarse first)
const decoded = new Set<string>();
const decoding = new Map<string, Promise<void>>();
function decode(src: string) {
  let job = decoding.get(src);
  if (!job) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    job = img
      .decode()
      .then(() => void decoded.add(src))
      .catch(() => undefined); // a picture that fails stays unready: its row keeps the usual pointer
    decoding.set(src, job);
  }
  return job;
}
// A row stands in for the pointer once its first picture is ready; until then it keeps the usual one
const ready = (row: Row) => Boolean(row.pics[0]?.src && decoded.has(row.pics[0].src));
function useDecoded() {
  const [, setVersion] = useState(0);
  return useCallback((src: string) => decode(src).then(() => setVersion((v) => v + 1)), []);
}

export function AboutB2() {
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const contact = useRef<HTMLElement>(null);
  useSettle(root);
  useShowOnce(contact);
  const fine = useFinePointer();
  const still = useStill();
  const [hover, setHover] = useState<Hover | null>(null);

  const reach = (i: number) => (event: React.SyntheticEvent<HTMLElement>) => {
    const item = event.currentTarget.closest("li");
    const box = list.current?.getBoundingClientRect();
    if (!item || !box) return;
    const at = item.getBoundingClientRect();
    setHover({ i, el: item, top: at.top - box.top + at.height / 2 });
    for (const pic of FLAT[i].pics) if (pic.src && !decoded.has(pic.src)) void warm(pic.src);
  };

  // Every picture, fetched and decoded once the page has settled (after the loader, when the browser is idle), in
  // reading order; a row that's reached before its turn jumps the queue
  const warm = useDecoded();
  useEffect(() => {
    if (!fine) return;
    let cancelled = false;
    const run = async () => {
      for (const row of FLAT) for (const pic of row.pics) if (pic.src && !cancelled) await warm(pic.src);
    };
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    const id = window.setTimeout(() => (idle ? idle(() => void run(), { timeout: 800 }) : void run()), 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [fine, warm]);

  return (
    <div ref={root} className={styles.page}>
      <h1 className="visually-hidden">About {site.name}</h1>

      <section className={styles.statement} data-text="lead" aria-label="Bio">
        {site.about.map((paragraph) => (
          <p key={paragraph} data-resolve="">
            <Keep text={paragraph} />
          </p>
        ))}
      </section>

      <section id="index" className={styles.index} aria-labelledby="index-title">
        <h2 id="index-title" className="visually-hidden">
          Index
        </h2>
        <div className={styles.head} data-text="small" aria-hidden="true" data-resolve="">
          <span>Who or what</span>
          <span>Kind</span>
          <span>Context</span>
        </div>
        <div ref={list} className={styles.list} data-cursor={(fine && !still) || undefined}>
          <ul
            className={styles.rows}
            data-text="small"
            onPointerLeave={() => setHover(null)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHover(null);
            }}
          >
            {LIST.map((r) => (
              <li key={r.id} data-resolve="" data-parent={r.children?.length ? "" : undefined}>
                <IndexRow row={r} onEnter={reach(AT.get(r.id)!)} />
                {r.children?.length ? (
                  <ul className={styles.children}>
                    {r.children.map((c) => (
                      <li key={c.id} data-resolve="">
                        <IndexRow row={c} child onEnter={reach(AT.get(c.id)!)} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          {fine && still && <Margin hover={hover} />}
        </div>
      </section>

      <section ref={contact} id="contact" className={styles.contact} aria-labelledby="contact-title">
        <h2 id="contact-title" className={styles.say} data-text="statement">
          <span className={styles.line} style={{ "--line": 0 } as React.CSSProperties}>
            {statement}
          </span>{" "}
          <span className={styles.line} style={{ "--line": 1 } as React.CSSProperties}>
            {invitation}
          </span>
        </h2>
        <p className={`${styles.email} ${styles.line}`} data-text="statement" style={{ "--line": 2 } as React.CSSProperties}>
          <a href={`mailto:${site.email}`} data-exact="">
            <FlipText text={site.email} />
          </a>
        </p>
        <p className={`${styles.elsewhere} ${styles.line}`} data-text="small" style={{ "--line": 3 } as React.CSSProperties}>
          <CopyEmail email={site.email} />
          <a href={site.links.linkedin} target="_blank" rel="noreferrer">
            <FlipText text="LinkedIn" />
          </a>
        </p>
      </section>

      {fine && !still && <PictureCursor hover={hover} />}
    </div>
  );
}

// One row: who or what, its kind, and a longer line of context. Reached, its name eases 8px right as the rest comes
// up to ink; its letters mirror under the pointer as everywhere on the site. A child sits one indent step in, lighter.
function IndexRow({
  row,
  child = false,
  onEnter,
}: {
  row: Row;
  child?: boolean;
  onEnter: (event: React.SyntheticEvent<HTMLElement>) => void;
}) {
  return (
    <div
      className={child ? `${styles.row} ${styles.child}` : styles.row}
      data-pic={ready(row) || undefined}
      onPointerEnter={onEnter}
    >
      <span className={styles.title}>
        <FlipText text={row.title} />
      </span>
      <span className={styles.kind}>{row.kind}</span>
      <span className={styles.context}>{row.context}</span>
    </div>
  );
}

// The entrance (motion.ts's resolve, made sure): text comes into focus from a soft blur as it enters, a beat apart. This
// version can't leave anything half-in: rows that mount later (a child, or a row added while the page is open) are
// watched as they arrive, and anything already scrolled past when it's first seen (a reload partway down the page,
// a jump to #contact) is simply shown, without waiting to be scrolled back to.
const LOADER_CLEARS = 1400; // ms into the page's load (Loader.module.css: clears from 1380ms)
function useSettle(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ready = performance.now() >= LOADER_CLEARS;
    const waiting = new Set<HTMLElement>();
    const show = (items: HTMLElement[]) =>
      items
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
        .forEach((item, i) => {
          item.style.setProperty("--resolve-i", String(Math.min(i, 8)));
          item.setAttribute("data-shown", "");
        });
    const watcher = new IntersectionObserver(
      (entries) => {
        const entering: HTMLElement[] = [];
        for (const entry of entries) {
          const item = entry.target as HTMLElement;
          if (entry.isIntersecting) entering.push(item);
          else if (entry.boundingClientRect.bottom <= 0) {
            item.setAttribute("data-instant", ""); // scrolled past: there at once, no entrance
            item.setAttribute("data-shown", "");
          } else continue;
          watcher.unobserve(item);
        }
        if (ready) show(entering);
        else entering.forEach((item) => waiting.add(item));
      },
      { rootMargin: "0px 0px -4% 0px" },
    );
    const watch = () =>
      el.querySelectorAll<HTMLElement>("[data-resolve]:not([data-shown])").forEach((item) => {
        if (still) item.setAttribute("data-shown", "");
        else watcher.observe(item);
      });
    watch();
    const arrivals = new MutationObserver(watch);
    arrivals.observe(el, { childList: true, subtree: true });
    const timer = window.setTimeout(() => {
      ready = true;
      show([...waiting]);
      waiting.clear();
    }, Math.max(0, LOADER_CLEARS - performance.now()));
    return () => {
      watcher.disconnect();
      arrivals.disconnect();
      window.clearTimeout(timer);
    };
  }, [root]);
}

function useStill() {
  const [still, setStill] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setStill(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return still;
}

// The contact's lines come in together once a fifth of the section is on screen, so they're seen arriving, one after
// another (AboutB2.module.css, `.line`)
function useShowOnce(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-shown", "");
      return;
    }
    const watcher = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0) return;
        if (!entry.isIntersecting) el.setAttribute("data-instant", ""); // scrolled past: there at once
        el.setAttribute("data-shown", "");
        watcher.disconnect();
      },
      { threshold: 0.2 },
    );
    watcher.observe(el);
    return () => watcher.disconnect();
  }, [ref]);
}

// The hovered row's picture as the pointer itself (Noah, Nov 9): over a row with a picture the pointer is hidden, at
// once by CSS (AboutB2.module.css, `[data-cursor] .row[data-pic]`) and then page-wide for as long as the picture is up
// (pointer.css), so it never shows through the hairlines between rows, a cross-fade, or a row that scrolls under a
// still pointer; it comes back over a row without a picture or outside the index, once the picture has faded. The picture's center sits exactly
// on the pointer, moved straight from
// each pointermove by transform, with no lag. At the screen's edges it runs partly off rather than shifting, so it never
// leaves the pointer. It appears from 98.5% and fades in over 180ms, and leaves the same way. Between rows, and between
// a row's own pictures, the new one fades in over the old (170ms) while the frame takes its shape (140ms). A picture
// with a caption carries it underneath on a strip of the page's white, like a print's; the caption cross-fades with the
// picture. Opacity, scale and size only: the picture itself is never blurred, filtered or tinted, and nothing sits on it.
const MAX = 400; // px, the longer side (Noah, Nov 9: "the images could be a little larger"; it was 320, and 200 before
// that). Every source is at least 850px on its longer side, so they stay sharp at 2x.
const FADE_MS = 240; // how long the pictures stay after the frame has gone, so it fades out whole
const HANDOFF_MS = 170; // the pointer comes back as the picture's 180ms fade ends
let layerId = 0;

function PictureCursor({ hover }: { hover: Hover | null }) {
  const box = useRef<HTMLDivElement>(null);
  const hovered = hover ? FLAT[hover.i] : null;
  const row = hovered && ready(hovered) ? hovered : null;
  const turn = useTurn(row?.pics.length ?? 0, row?.id, TURN_MS);
  const wanted = row ? row.pics[turn] : null;
  // A picture whose turn has come but isn't decoded yet waits, and the one before stays until it's ready
  const warm = useDecoded();
  const pic = wanted && wanted.src && !decoded.has(wanted.src) ? null : wanted;
  useEffect(() => {
    if (wanted?.src && !decoded.has(wanted.src)) void warm(wanted.src);
  }, [wanted, warm]);
  const [layers, setLayers] = useState<{ id: number; pic: Pic }[]>([]);
  const shownPic = pic ?? layers[layers.length - 1]?.pic;
  const size = fit(shownPic?.ratio ?? "4 / 3", MAX);
  const [steady, setSteady] = useState(false); // already showing: the frame eases between shapes

  // The pictures, newest last, fading in over the ones before it (two are kept underneath, whole)
  useEffect(() => {
    if (!pic && wanted) return; // waiting on a decode: hold what's showing
    if (!pic) {
      const id = window.setTimeout(() => setLayers([]), FADE_MS);
      return () => window.clearTimeout(id);
    }
    setLayers((prev) => (prev[prev.length - 1]?.pic === pic ? prev : [...prev.slice(-2), { id: ++layerId, pic }]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pic]);

  useEffect(() => {
    if (!row) {
      setSteady(false);
      return;
    }
    const id = window.requestAnimationFrame(() => setSteady(true));
    return () => window.cancelAnimationFrame(id);
  }, [row]);

  // The pointer stays hidden page-wide for as long as the picture is up (pointer.css). Leaving, the pointer comes back
  // only once the picture has faded, so the two never show at once, and passing quickly over a row without a picture
  // (Cooper Union) never flashes it
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (row) {
      root.setAttribute("data-picture-cursor", "");
      return;
    }
    if (!root.hasAttribute("data-picture-cursor")) return;
    const id = window.setTimeout(() => root.removeAttribute("data-picture-cursor"), HANDOFF_MS);
    return () => window.clearTimeout(id);
  }, [row]);
  useEffect(() => () => document.documentElement.removeAttribute("data-picture-cursor"), []);

  // Exactly where the pointer is, always, so it's already there when it appears
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const el = box.current;
      if (el) el.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // The caption under the picture, like a print's: only while the picture showing has one, never an empty strip
  const top = layers[layers.length - 1];

  return (
    <div ref={box} className={styles.pointer} aria-hidden="true">
      <div className={styles.frame} data-on={row ? "" : undefined} data-steady={(row && steady) || undefined}>
        <div className={styles.picture} style={{ width: size.width, height: size.height }}>
          {layers.map((layer, i) =>
            layer.pic.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={layer.id}
                className={styles.layer}
                src={layer.pic.src}
                alt=""
                decoding="sync"
                data-out={i < layers.length - 1 || undefined}
              />
            ) : null,
          )}
        </div>
        {top?.pic.caption && (
          <p className={styles.caption} data-text="small">
            {layers.map((layer, i) =>
              layer.pic.caption ? (
                <span key={layer.id} className={styles.captionText} data-out={i < layers.length - 1 || undefined}>
                  {layer.pic.caption}
                </span>
              ) : null,
            )}
          </p>
        )}
      </div>
    </div>
  );
}

// With reduced motion: the hovered row's picture sits still in the margin to the right of the index, level with the
// row, and changes without fading; a row with two pictures holds on its first. Its caption, when it has one, sits under it.
function Margin({ hover }: { hover: Hover | null }) {
  const row = hover ? FLAT[hover.i] : null;
  const pic = row?.pics[0];
  const size = fit(pic?.ratio ?? "4 / 3", 152, 184);
  if (!hover || !pic) return null;
  return (
    <div className={styles.margin} style={{ top: hover.top, width: size.width }} aria-hidden="true">
      <div className={styles.marginPicture} style={{ height: size.height }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {pic.src && <img src={pic.src} alt="" />}
      </div>
      {pic.caption && <p className={styles.marginCaption} data-text="small">{pic.caption}</p>}
    </div>
  );
}
