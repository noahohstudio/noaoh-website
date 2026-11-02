"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { site, visitorRoles } from "@/content/site";
import type { Credit } from "@/lib/store";
import { EmailLink } from "./EmailLink";
import styles from "./Credits.module.css";

const SPEED = 34; // px per second, a slow end-credits pace
let visitCounted = false;

type Status = { state: "idle" | "saving" | "saved" | "error"; message?: string };

export function Credits() {
  const [entries, setEntries] = useState<Credit[] | null>(null);
  const [visits, setVisits] = useState<number | null>(null);
  const [mine, setMine] = useState<string[]>([]);
  const [rolling, setRolling] = useState(true);
  const [inView, setInView] = useState(false);
  const [canRoll, setCanRoll] = useState(false);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  const sectionRef = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const rollRef = useRef<HTMLDivElement>(null);

  // Load the credits and count this visit once per session
  useEffect(() => {
    let counted = visitCounted;
    try {
      counted ||= sessionStorage.getItem("noaoh:counted") === "1";
    } catch {}
    visitCounted = true;

    const visit: Promise<number | null> = counted
      ? Promise.resolve(null)
      : fetch("/api/visits", { method: "POST" })
          .then((r) => r.json())
          .then((d) => {
            try {
              sessionStorage.setItem("noaoh:counted", "1");
            } catch {}
            return typeof d.visits === "number" ? d.visits : null;
          })
          .catch(() => null);

    fetch("/api/credits")
      .then((r) => r.json())
      .then(async (d) => {
        setEntries(Array.isArray(d.credits) ? d.credits : []);
        const counted = await visit;
        setVisits(counted ?? (typeof d.visits === "number" ? d.visits : null));
      })
      .catch(() => setEntries([]));

    try {
      setMine(JSON.parse(localStorage.getItem("noaoh:mine") ?? "[]"));
    } catch {}
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setRolling(false);
  }, []);

  // Roll only while the credits are on screen
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Distance and duration of the roll follow the length of the list
  useEffect(() => {
    const win = windowRef.current;
    const roll = rollRef.current;
    if (!win || !roll) return;
    const measure = () => {
      // Matches .window[data-rolling] height in the CSS
      const windowH = Math.min(window.innerHeight * 0.62, 560);
      const rollH = roll.scrollHeight;
      win.style.setProperty("--window-h", `${windowH}px`);
      win.style.setProperty("--roll-h", `${rollH}px`);
      win.style.setProperty("--roll-duration", `${((windowH + rollH) / SPEED).toFixed(1)}s`);
      win.style.setProperty("--roll-delay", `${(-windowH / SPEED).toFixed(1)}s`);
      setCanRoll(rollH > windowH);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(roll);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [entries, visits, rolling]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus({ state: "saving" });
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Your name wasn't saved. Try again in a minute.");
      if (body.credit) {
        const credit = body.credit as Credit;
        const nextMine = [credit.id, ...mine];
        setMine(nextMine);
        try {
          localStorage.setItem("noaoh:mine", JSON.stringify(nextMine.slice(0, 20)));
        } catch {}
        setEntries((current) => [credit, ...(current ?? [])]);
        setRolling(false);
        requestAnimationFrame(() =>
          document.getElementById(`credit-${credit.id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }),
        );
      }
      form.reset();
      setStatus({ state: "saved", message: "Signed. Your name is in the credits." });
    } catch (error) {
      setStatus({ state: "error", message: (error as Error).message });
    }
  };

  const isRolling = rolling && canRoll;

  return (
    <section id="credits" ref={sectionRef} className={styles.credits} aria-labelledby="credits-title">
      <div className={`shell ${styles.inner}`}>
        <div className={styles.head}>
          <h2 id="credits-title" className={styles.title}>
            Credits
          </h2>
          <p className={styles.lede}>Every visit is counted. Sign your name and it rolls with the rest.</p>
        </div>

        <div
          ref={windowRef}
          className={styles.window}
          data-rolling={isRolling}
          data-playing={isRolling && inView}
        >
          <div ref={rollRef} className={styles.roll}>
            <dl className={styles.block}>
              {site.credits.map((credit) => (
                <div key={credit.role} className={styles.row}>
                  <dt>{credit.role}</dt>
                  <dd>{credit.name}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.block}>
              <p className={styles.blockTitle}>Signed by visitors</p>
              {entries === null ? (
                <p className={styles.empty}>Loading names…</p>
              ) : entries.length === 0 ? (
                <p className={styles.empty}>No one has signed yet. Be the first name in the credits.</p>
              ) : (
                <dl>
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      id={`credit-${entry.id}`}
                      className={styles.row}
                      data-mine={mine.includes(entry.id) || undefined}
                    >
                      <dt>{entry.role}</dt>
                      <dd>
                        {entry.name}
                        {entry.note && <span className={styles.note}>{entry.note}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {visits !== null && visits > 0 && (
              <p className={styles.final}>
                And {visits.toLocaleString("en-US")} {visits === 1 ? "person" : "people"} who stopped by.
              </p>
            )}
          </div>
        </div>

        {canRoll && (
          <div className={styles.rollControls}>
            <button type="button" onClick={() => setRolling((r) => !r)}>
              {isRolling ? "Show all credits" : "Roll the credits"}
            </button>
          </div>
        )}

        <form className={styles.form} onSubmit={submit}>
          <h3 className={styles.formTitle}>Add your name to the credits</h3>
          <div className={styles.fields}>
            <label className={styles.field}>
              <span>Name</span>
              <input name="name" required minLength={2} maxLength={40} autoComplete="name" />
            </label>
            <label className={styles.field}>
              <span>Role</span>
              <select name="role" defaultValue={visitorRoles[0]}>
                {visitorRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <label className={`${styles.field} ${styles.noteField}`}>
              <span>Note, optional</span>
              <input name="note" maxLength={140} placeholder="Say something nice, or useful" />
            </label>
            <label className={styles.trap} aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <button className={styles.submit} type="submit" disabled={status.state === "saving"}>
              {status.state === "saving" ? "Signing…" : "Sign the credits"}
            </button>
          </div>
          <p className={styles.message} role="status" data-state={status.state}>
            {status.message}
          </p>
        </form>

        <footer className={styles.footer}>
          <p>
            © {new Date().getFullYear()} {site.name}
          </p>
          <EmailLink email={site.email} tone="house" />
          <a href="#top">Back to top</a>
        </footer>
      </div>
    </section>
  );
}
