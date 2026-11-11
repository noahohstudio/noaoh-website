"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FlipText, Letters } from "@/components/Flip";
import base from "./RailShell.module.css";

export type RailItem = { id: string; title: string };
export type RailStudy = { slug: string; title: string; soon?: boolean; sections: RailItem[] };
export type RailProps = { root: string; studies: RailStudy[] };

// What a rendition can ask of the shell beyond its CSS
export type RailOptions = {
  // The opacity of a section by its distance from the one being read: 1 for it, then the next, and so on to the floor
  falloff?: number[];
  // Hold the page through a jump: it fades out as the rail starts to move (`out` ms), the next page is fetched then,
  // and it fades in `arrive` ms after the jump began, once the rail has mostly landed (Stage.module.css)
  hold?: { out: number; arrive: number };
  // Between case studies, carry the block of section names from under the one to under the other, over the lists'
  // own `duration` and `easing`, each name trading text as a title passes it: the old one gone `clear` rows ahead of
  // the title, softening over `soften` rows before that; the new one resolving from `clear` rows behind it, over `soften`
  carry?: { duration: number; easing: string; clear?: number; soften?: number };
  // Fold the work list away at home, as for lab and about (Noah, Nov 9: "the work panel should close back up when you
  // go to noah oh")
  foldHome?: boolean;
  // In a case study, the crumb is the way back alone, "← back to work", with no trail (Noah, Nov 9: "top left should
  // just be "back to work" with the arrow, no breadcrumbs")
  backToWork?: boolean;
};

/*
  The indent nav without a line (Noah, Nov 8: "lets abandon, and try different ways to show the indent nav without the
  line - focusing on motion between pages and sections, and how the interactions jumping from each work"). The shared
  rail for the renditions C to E3: the same tree as the site's index (work, its case studies, the open one's sections,
  then lab and about), with no rule and no mark. It stays mounted in its rendition's layout through real page changes,
  and says what is happening as data on the rail, for each rendition's CSS to move:

  - `data-open` on a list that is open, and every list is always drawn, closed ones taking no room, so a list closing
    and another opening are two transitions that can be interrupted and turned around at any point;
  - `data-move` on the rail, the kind of jump that was made: between case studies (swap), from the work or home into
    one (in) and back (out), from one out to lab or about (away) and back in (into), between the top pages (top), or
    straight back to where a jump began before it settled (back);
  - `data-exit` on a list while it closes, which way it went: sideways to a sibling (left), or up and out (right);
  - `data-depth` on the rail, 1 inside a case study;
  - `data-at` on the section being read, and `--o` on each, its distance from it as an opacity;
  - `data-carry` on the rail while a block of sections is carried between studies (flying), and as it lands (landed).

  The sections come in as props, so the next case study's are known the moment a jump starts. Links to the site's
  pages inside the page (the work's cards, a case study's Next, the way to the lab, "noah oh") stay on this stage.
*/

type Move = "load" | "none" | "swap" | "in" | "out" | "away" | "into" | "top" | "back";
// A carried block: where it starts and how far it goes, and each row's names, their tones, and when (as fractions of
// the carry) the old name softens out and the new one resolves: [out from, out by, in from, in by]
type Carrier = {
  key: number;
  top: number;
  left: number;
  dy: number;
  rows: { a: string; b: string; ao: string; bo: string; w: [number, number, number, number] }[];
};

const SETTLE = 700; // ms, longer than any rendition's longest jump
const FALLOFF = [1, 0.5, 0.35, 0.25];
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// The time, as a fraction of a transition on a cubic-bezier curve, at which it has come a given fraction of the way
function timeAt(easing: string, progress: number) {
  const [x1, y1, x2, y2] = (easing.match(/-?[\d.]+/g) ?? ["0", "0", "1", "1"]).map(Number);
  const point = (t: number, p1: number, p2: number) => 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    if (point(mid, y1, y2) < progress) lo = mid;
    else hi = mid;
  }
  return point((lo + hi) / 2, x1, x2);
}

// Where a page of the rail lives, and which page a path is. On a stage (app/workshop/v2/nav-e3) every page sits under
// its root; on the site itself (root "", app/layout.tsx since Nov 11) they're the real pages: each case study at
// /work/<slug>, the lab and about, and home and the work one page at / (Noah, Nov 11: "for now lets make noah oh and
// work the same - selected work doesn't need its own zone"), the work being home's Selected work, at #work. So home
// is "work" on the rail, marked with its list open only while Selected work fills most of the screen (RailShell)
export function hrefOf(root: string, page: string, studies: RailStudy[]) {
  if (root) return `${root}/${page}`;
  if (page === "home") return "/";
  if (page === "work") return "/#work";
  return studies.some((s) => s.slug === page) ? `/work/${page}` : `/${page}`;
}

export function pageOf(root: string, path: string, studies: RailStudy[]): string | null {
  if (root) return path.startsWith(`${root}/`) ? path.slice(root.length + 1).split("/")[0] : null;
  if (path === "/" || path === "/work") return "work";
  if (path === "/lab" || path === "/about") return path.slice(1);
  const slug = path.match(/^\/work\/([^/]+)\/?$/)?.[1];
  return slug && studies.some((s) => s.slug === slug) ? slug : null;
}

export function RailShell({
  root,
  studies,
  styles,
  options = {},
}: RailProps & { styles: { readonly [key: string]: string }; options?: RailOptions }) {
  const pathname = usePathname();
  const router = useRouter();
  const live = (slug: string | null) => studies.find((s) => s.slug === slug && !s.soon) ?? null;
  const cx = (...keys: string[]) => keys.flatMap((key) => [base[key], styles[key]]).filter(Boolean).join(" ");
  const { hold, carry, foldHome, backToWork } = options;
  // The pages with the work list open under "work": the work, and home unless it folds away
  const listed = (p: string | null) => p === "work" || (p === "home" && !foldHome);
  const falloff = options.falloff ?? FALLOFF;

  // The page on screen, and the one the rail shows: where a held jump is going, or else the page on screen
  const href = (to: string) => hrefOf(root, to, studies);
  const onScreen = pageOf(root, pathname, studies) ?? "home";
  const [target, setTarget] = useState<string | null>(null);
  const page = target ?? onScreen;
  const study = live(page);

  // The last jump: where it came from and what kind it was. It has settled once SETTLE has passed without another
  const [track, setTrack] = useState({ page, from: null as string | null, move: "load" as Move, n: 0 });
  const [settled, setSettled] = useState(0);
  if (track.page !== page) {
    const from = track.page;
    const back = settled !== track.n && page === track.from;
    setTrack({ page, from, move: back ? "back" : moveOf(from, page, Boolean(live(from)), Boolean(study), listed), n: track.n + 1 });
  }
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(track.n), SETTLE);
    return () => window.clearTimeout(timer);
  }, [track.n]);
  const moving = settled !== track.n;

  // Each page opens at its top. Next leaves the scroll where it was when a page's first element has no box of its
  // own, as a case study's display-face wrapper does (Display.module.css), so the stage does it, before the paint
  // A jump to a part of a page (the work, home's #work) opens there instead
  const shown = useRef(onScreen);
  const arriving = useRef("");
  useLayoutEffect(() => {
    if (shown.current === onScreen) return;
    shown.current = onScreen;
    const hash = arriving.current;
    arriving.current = "";
    const part = hash ? document.getElementById(hash.slice(1)) : null;
    if (part) part.scrollIntoView({ behavior: "instant", block: "start" });
    else if (!location.hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [onScreen]);

  // Everything starts closed and opens a frame after the rail is on screen, so the first page unfolds it too
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // On the site, the work is home's Selected work (hrefOf), so at home "work" is marked and its list open only while
  // that section fills more of the screen than not: its top above the middle (Noah, Nov 11: "work should only open up
  // its sections when its moreso in the viewport"). On the way there, it's open if the jump is to the work (#work)
  // and folded if to the top of home (your name)
  const homeWork = !root && page === "work";
  const [workInView, setWorkInView] = useState(false);
  useEffect(() => {
    if (root || onScreen !== "work") return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      const top = document.getElementById("work")?.getBoundingClientRect().top;
      setWorkInView(top !== undefined && top <= innerHeight * 0.5);
    };
    const onScroll = () => (frame ||= requestAnimationFrame(pick));
    frame = requestAnimationFrame(pick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [root, onScreen]);
  const [heading, setHeading] = useState(""); // the hash a held jump is going to, as "#work"
  const folded = homeWork && (target ? heading !== "#work" : !workInView);

  const studiesOpen = ready && ((listed(page) && !folded) || Boolean(study));
  const openSlug = ready && study ? study.slug : null;
  const left = live(track.from)?.slug ?? null;
  const studiesExit = moving && !studiesOpen && (listed(track.from) || left) ? "right" : undefined;
  const sectionsExit = (slug: string) => (moving && slug === left && slug !== openSlug ? (study ? "left" : "right") : undefined);

  // The section being read, on the page on screen: the last whose top has passed 40% of the screen. A case study the
  // rail is still on its way to opens at its top, so its first section
  const [at, setAt] = useState<{ page: string; id: string | null }>({ page: "", id: null });
  const reading = live(onScreen)?.slug ?? null;
  useEffect(() => {
    const sections = studies.find((s) => s.slug === reading)?.sections;
    if (!sections) return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      const line = innerHeight * 0.4;
      let current: string | null = null;
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el && (current === null || el.getBoundingClientRect().top <= line)) current = id;
      }
      setAt({ page: reading!, id: current });
    };
    const onScroll = () => (frame ||= requestAnimationFrame(pick));
    frame = requestAnimationFrame(pick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reading, studies]);
  const indexOf = (s: RailStudy) =>
    s.slug === reading && at.page === reading ? s.sections.findIndex((x) => x.id === at.id) : s.slug === page ? 0 : -1;
  const fade = (index: number, k: number) => (index < 0 ? 0.35 : falloff[Math.min(Math.abs(k - index), falloff.length - 1)]);

  // A held jump (options.hold): the page fades out, the next is fetched once it has, and it fades in when the rail has
  // mostly landed. The state is on <html data-stage>, for the stage's wrapper to fade (Stage.module.css)
  const want = useRef<string | null>(null);
  const pushed = useRef<string | null>(null);
  const arriveAt = useRef(0);
  const pushTimer = useRef(0);
  const arriveTimer = useRef(0);
  const screen = useRef(onScreen);
  const clear = () => {
    window.clearTimeout(pushTimer.current);
    window.clearTimeout(arriveTimer.current);
    pushTimer.current = 0;
    arriveTimer.current = 0;
  };
  const stage = (state: "out" | "in") => (document.documentElement.dataset.stage = state);
  // The page and the part of it a jump is going to: the link's own hash, not the rail's (your name and "work" are the
  // same page on the site, at its top and at #work)
  const headingRef = useRef("");
  const push = (to: string) => {
    pushed.current = to;
    arriving.current = headingRef.current;
    router.push(href(to).split("#")[0] + headingRef.current, { scroll: false });
  };

  // The carried block (options.carry)
  const sideRef = useRef<HTMLElement>(null);
  const carrierRef = useRef<HTMLUListElement>(null);
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [carrying, setCarrying] = useState<"flying" | "landed" | null>(null);
  const flying = useRef(false);

  const lift = (from: string, to: string): Carrier | null => {
    const side = sideRef.current;
    const a = side?.querySelector<HTMLElement>(`[data-list="sections"][data-study="${from}"]`);
    const b = side?.querySelector<HTMLElement>(`[data-list="sections"][data-study="${to}"]`);
    const first = a?.querySelector("li");
    const next = b?.querySelector("li");
    const was = live(from);
    const will = live(to);
    if (!side || !a || !b || !first || !next || !was || !will) return null;
    const s = side.getBoundingClientRect();
    const ra = first.getBoundingClientRect();
    // Where the next list's first name will stand once the last list has closed above it, if it is above
    const above = a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING;
    const landing = next.getBoundingClientRect().top - (above ? a.getBoundingClientRect().height : 0);
    const from0 = indexOf(was);
    const tone = (index: number, k: number, n: number) =>
      k >= n ? "transparent" : k === index ? "var(--ink)" : `rgb(0 0 0 / ${fade(index, k)})`;
    const count = Math.max(was.sections.length, will.sections.length);
    const top = ra.top - s.top;
    const dy = landing - ra.top;

    // The case study titles between the two lists cross the block on their way: up by the last list's height as it
    // closes above them, or down by the next one's as it opens above them, on the lists' own curve. Each row's old
    // name softens out just before a title reaches it, and its new name resolves just after the title has passed, so
    // a title only ever moves through empty space (Noah, Nov 9: "carry moves the title of the case study quicker than
    // the prior's sections disappear")
    const r = ra.height;
    const titles = [...side.querySelectorAll<HTMLElement>('[data-list="studies"] > div > ul > li')];
    const ia = titles.findIndex((li) => li.contains(a));
    const ib = titles.findIndex((li) => li.contains(b));
    const shift = above ? -a.getBoundingClientRect().height : (b.querySelector("ul")?.getBoundingClientRect().height ?? 0);
    const crossing = titles
      .slice(Math.min(ia, ib) + 1, Math.max(ia, ib) + 1)
      .map((li) => (li.firstElementChild as HTMLElement).getBoundingClientRect().top - s.top);
    const when = (progress: number) => timeAt(carry!.easing, Math.min(1, Math.max(0, progress)));
    const clear = carry!.clear ?? 0.75;
    const soften = carry!.soften ?? 1.45;
    const windows = (k: number): [number, number, number, number] => {
      const row = top + k * r;
      let w: [number, number, number, number] | null = null;
      for (const y of crossing) {
        // How far the title is from the row, counted down to 0 as it reaches it and on below 0 once it has passed
        const gap = y - row;
        const toward = shift - dy;
        const sense = Math.sign(gap) || 1;
        if (sense * toward >= 0) continue;
        const at = (distance: number) => when((sense * distance - gap) / toward);
        const v: [number, number, number, number] = [
          at((clear + soften) * r),
          at(clear * r),
          at(-clear * r),
          at(-(clear + soften) * r),
        ];
        w = w ? [Math.min(w[0], v[0]), Math.min(w[1], v[1]), Math.max(w[2], v[2]), Math.max(w[3], v[3])] : v;
      }
      // No title in the way: the names trade halfway, as they always did
      if (!w) return [0.15, 0.5, 0.4, 0.85];
      // Long enough to read as a soften and a resolve, never cut to a flick
      if (w[1] < 0.06) w[1] = 0.06;
      if (w[1] - w[0] < 0.12) w[0] = Math.max(0, w[1] - 0.12);
      if (w[3] - w[2] < 0.16) w[3] = Math.min(1, w[2] + 0.16);
      return w;
    };

    return {
      key: performance.now(),
      top,
      left: ra.left - s.left,
      dy,
      rows: Array.from({ length: count }, (_, k) => ({
        a: was.sections[k]?.title ?? "",
        b: will.sections[k]?.title ?? "",
        ao: tone(from0, k, was.sections.length),
        bo: tone(0, k, will.sections.length),
        w: windows(k),
      })),
    };
  };

  const settle = () => {
    carrierRef.current?.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    flying.current = false;
    setCarrier(null);
  };

  // Go to a page of the stage
  const travel = (to: string, hash = "") => {
    headingRef.current = hash;
    setHeading(hash);
    if (!hold || reduced()) {
      router.push(href(to).split("#")[0] + hash);
      return;
    }
    if (to === page && to === screen.current) return;
    clear();
    // Carried only between case studies, and not out of a carry already in flight: that one settles where it is
    const lifted = carry && !flying.current && live(page) && live(to) && ready ? lift(page, to) : null;
    if (flying.current) {
      settle();
      setCarrying(null);
    }
    if (lifted) {
      flying.current = true;
      setCarrier(lifted);
      setCarrying("flying");
    }
    want.current = to;
    setTarget(to);
    if (to === screen.current) {
      // Straight back to the page still on screen: it comes back from wherever its fade had got to, and if the next
      // page was already asked for, this one is asked for again, so that one never lands
      if (pushed.current && pushed.current !== to) push(to);
      stage("in");
      arriveTimer.current = window.setTimeout(() => {
        if (screen.current !== want.current) return;
        want.current = null;
        pushed.current = null;
        setTarget(null);
      }, hold.arrive);
      return;
    }
    stage("out");
    arriveAt.current = performance.now() + hold.arrive;
    pushTimer.current = window.setTimeout(() => {
      pushTimer.current = 0;
      push(to);
    }, hold.out);
  };

  // The page that arrived: if it is where the reader is going, it fades in on time; if they have moved on since it
  // was asked for, it stays hidden and the stage goes on to theirs
  useEffect(() => {
    screen.current = onScreen;
    const to = want.current;
    if (!hold || !to) return;
    if (onScreen !== to) {
      stage("out");
      if (pushed.current !== to && !pushTimer.current) push(to);
      return;
    }
    window.clearTimeout(arriveTimer.current);
    arriveTimer.current = window.setTimeout(
      () => {
        stage("in");
        want.current = null;
        pushed.current = null;
        setTarget(null);
      },
      Math.max(0, arriveAt.current - performance.now()),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onScreen]);

  // The browser's back and forward go straight to their page; leaving the stage leaves the page shown
  useEffect(() => {
    if (!hold) return;
    const onPop = () => {
      headingRef.current = "";
      arriving.current = "";
      clear();
      want.current = null;
      setTarget(null);
      stage("in");
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      clear();
      delete document.documentElement.dataset.stage;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The carry: the block moves with the lists, over their own time and curve, and its names trade text halfway
  useLayoutEffect(() => {
    const el = carrierRef.current;
    if (!carrier || !el || !carry) return;
    const { duration, easing } = carry;
    const move = el.animate([{ transform: "translateY(0)" }, { transform: `translateY(${carrier.dy}px)` }], {
      duration,
      easing,
      fill: "forwards",
    });
    // Each row's names trade in their own window, timed to the title passing (lift)
    el.querySelectorAll<HTMLElement>(":scope > li").forEach((li, k) => {
      const [outFrom, outBy, inFrom, inBy] = carrier.rows[k].w;
      li.querySelector("[data-a]")?.animate(
        [
          { opacity: 1, filter: "blur(0px)", offset: 0 },
          { opacity: 1, filter: "blur(0px)", offset: outFrom },
          { opacity: 0, filter: "blur(1.5px)", offset: outBy },
          { opacity: 0, filter: "blur(1.5px)", offset: 1 },
        ],
        { duration, fill: "forwards" },
      );
      li.querySelector("[data-b]")?.animate(
        [
          { opacity: 0, filter: "blur(1.5px)", offset: 0 },
          { opacity: 0, filter: "blur(1.5px)", offset: inFrom },
          { opacity: 1, filter: "blur(0px)", offset: inBy },
          { opacity: 1, filter: "blur(0px)", offset: 1 },
        ],
        { duration, fill: "forwards" },
      );
    });
    move.onfinish = () => {
      // Landed: the real names take over in the same places, at once, and the carried block goes
      flying.current = false;
      setCarrying("landed");
      setCarrier(null);
      window.setTimeout(() => setCarrying((c) => (c === "landed" ? null : c)), 60);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carrier?.key]);

  // The site's own links inside the page lead to this stage's copies of those pages; with a held jump, so do the
  // rail's own
  const travelRef = useRef(travel);
  travelRef.current = travel;
  useEffect(() => {
    const pages = ["home", "work", "lab", "about", ...studies.filter((s) => !s.soon).map((s) => s.slug)];
    const to = (path: string) => {
      if (!root) {
        const page = pageOf(root, path, studies);
        return page && pages.includes(page) ? page : null;
      }
      if (path === "/") return "home";
      if (path === "/lab" || path === "/workshop/v2/lab-c") return "lab";
      if (path === "/about") return "about";
      if (hold && path.startsWith(`${root}/`)) {
        const page = path.slice(root.length + 1);
        return pages.includes(page) ? page : null;
      }
      const slug = path.match(/^\/work\/([^/]+)$/)?.[1];
      return slug && pages.includes(slug) ? slug : null;
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const a = (event.target as Element | null)?.closest?.("a[href]");
      if (!(a instanceof HTMLAnchorElement) || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href);
      const page = url.origin === location.origin && !(url.pathname === location.pathname && url.hash) ? to(url.pathname) : null;
      if (!page) return;
      event.preventDefault();
      travelRef.current(page, url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [root, studies, hold]);

  const go = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Easter egg, as the top bar has it: your name, clicked at home, ripples the lander and pops the glass
  const poke = (event: React.MouseEvent) => {
    if (pathname !== href("home")) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("noaoh:egg", { detail: "name" }));
  };
  // "work" at home on the site: glide down to Selected work (the page's own link to its #work is left to this)
  const toWork = (event: React.MouseEvent) => {
    const [path, hash] = href("work").split("#");
    if (!hash || pathname !== path) return;
    event.preventDefault();
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const row = (n: number, i: number, extra?: Record<string, number>) => ({ "--n": n, "--i": i, ...extra }) as React.CSSProperties;

  return (
    <div className={cx("rail")}>
      <p className={cx("crumb")} data-text="small">
        {backToWork ? (
          // The way back from a case study, and your name everywhere else; each resolves as it comes
          study ? (
            <span key="back" className={cx("here")}>
              <Link href={href("work")} aria-label="Back to work">
                <FlipText text="← back to work" />
              </Link>
            </span>
          ) : (
            <span key="name" className={cx("here")}>
              <Link href={href("home")} onClick={poke}>
                <FlipText text="noah oh" />
              </Link>
            </span>
          )
        ) : study ? (
          <>
            <Link href={href("work")} aria-label="Back to the work">
              <FlipText text="← work" />
            </Link>
            <span key={study.slug} className={cx("here")}>
              {" "}
              / {study.title.toLowerCase()}
            </span>
          </>
        ) : (
          <Link href={href("home")} onClick={poke}>
            <FlipText text="noah oh" />
          </Link>
        )}
      </p>

      <nav
        ref={sideRef}
        className={cx("side")}
        data-text="small"
        aria-label="Index"
        data-move={track.move}
        data-depth={ready && study ? 1 : 0}
        data-carry={carrying ?? undefined}
      >
        <ul className={cx("pages")}>
          <li data-at={(page === "work" && !folded) || undefined} data-path={study ? true : undefined}>
            <Link href={href("work")} onClick={toWork}>
              <FlipText text="work" />
            </Link>
            <div
              className={cx("panel", "studiesPanel")}
              data-list="studies"
              data-open={studiesOpen || undefined}
              data-exit={studiesExit}
              inert={!studiesOpen}
            >
              <div className={cx("clip")}>
                <ul className={cx("studies")}>
                  {studies.map((s, i) => {
                    const open = s.slug === openSlug;
                    return (
                      <li
                        key={s.slug}
                        className={cx("item")}
                        data-at={s.slug === page || undefined}
                        data-soon={s.soon || undefined}
                        style={row(studies.length, i)}
                      >
                        {s.soon ? (
                          <span>{s.title}</span>
                        ) : (
                          <Link href={href(s.slug)}>
                            <FlipText text={s.title} />
                          </Link>
                        )}
                        {s.sections.length > 0 && (
                          <div
                            className={cx("panel", "sectionsPanel")}
                            data-list="sections"
                            data-study={s.slug}
                            data-open={open || undefined}
                            data-exit={sectionsExit(s.slug)}
                            inert={!open}
                          >
                            <div className={cx("clip")}>
                              <ul className={cx("sections")}>
                                {s.sections.map((item, k) => (
                                  <li
                                    key={item.id}
                                    className={cx("item")}
                                    data-at={(open && k === indexOf(s)) || undefined}
                                    style={row(s.sections.length, k, { "--o": fade(indexOf(s), k) })}
                                  >
                                    <a href={`#${item.id}`} onClick={go(item.id)}>
                                      <FlipText text={item.title} />
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </li>
          {["lab", "about"].map((p) => (
            <li key={p} data-at={page === p || undefined}>
              <Link href={href(p)}>
                <FlipText text={p} />
              </Link>
            </li>
          ))}
        </ul>

        {carrier && (
          <ul ref={carrierRef} className={cx("carrier")} aria-hidden="true" style={{ top: carrier.top, left: carrier.left }}>
            {carrier.rows.map((r, k) => (
              <li key={k}>
                <span data-a="" style={{ color: r.ao }}>
                  <Letters text={r.a || " "} />
                </span>
                <span data-b="" style={{ color: r.bo }}>
                  <Letters text={r.b || " "} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}

// What kind of jump it was, from one page of the stage to another
function moveOf(from: string, to: string, fromStudy: boolean, toStudy: boolean, listed: (page: string) => boolean): Move {
  if (from === to) return "none";
  if (fromStudy && toStudy) return "swap";
  if (listed(from) && toStudy) return "in";
  if (fromStudy && listed(to)) return "out";
  if (fromStudy) return "away";
  if (toStudy) return "into";
  return "top";
}
