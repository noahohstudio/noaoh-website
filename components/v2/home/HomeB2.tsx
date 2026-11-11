import Link from "next/link";
import type { CSSProperties } from "react";
import { Media } from "@/components/Media";
import { FlipText } from "@/components/Flip";
import { Reveal } from "@/components/Reveal";
import { CardLift } from "@/components/CardLift";
import { lab, now, studies, type LabPiece, type Study } from "./data";
import { Keep } from "./Keep";
import { JokeLead, type JokeMode } from "./JokeLead";
import styles from "./HomeB2.module.css";

/*
  Home, rendition B, round 2 (Noah, Nov 8, of round 1: "Lets work upon Home B, super interesting way of combining labs
  and case studies. Maybe a selected work section? Main?"). The line, small, with a screen's worth of air; then the
  woven scroll as one titled section, Selected work: the case studies as large lifted cards, each with its name and
  one line, and the lab between them as flat boxes marked only "Lab" and a title, so the two read apart at a glance.
  The section closes on the way into the whole lab. Pictures come in with the site's own quiet entrance (Reveal);
  only the words resolve from a soft blur.
*/

// The whole lab: rendition C, the still grid that opens a piece over the page (Noah's direction for the lab since Nov 8)
const LAB_HREF = "/lab";

// Where each lab piece sits on the twelve columns (six on a phone), and how far it drops below its row's top
const SLOTS = [
  { col: "1 / span 5", phone: "1 / span 5", drop: "0px" },
  { col: "8 / span 5", phone: "2 / span 5", drop: "168px" },
  { col: "2 / span 4", phone: "1 / span 4", drop: "96px" },
  { col: "8 / span 4", phone: "3 / span 4", drop: "0px" },
  { col: "1 / span 7", phone: "1 / span 6", drop: "0px" },
  { col: "10 / span 3", phone: "2 / span 4", drop: "136px" },
];

type Item = { kind: "study"; study: Study } | { kind: "lab"; piece: LabPiece; slot: (typeof SLOTS)[number] };

// Lab pieces between the case studies: off until Noah has a set ready to share (Nov 11: "I honestly don't like having
// the lab pieces in selected work, especially because right now they're not very great lab pieces. Maybe we build that
// after I kind of have a set, a few lab pieces that I'm ready to share, but for now let's just remove that"). Set to
// true to bring them back: two after each case study but the last, the line about them, and the way into the lab.
const LAB_IN_WORK = false;

// A case study, then (with the lab on) two lab pieces, and so on; the last case study closes the list
const items: Item[] = studies.flatMap((study, i): Item[] => [
  { kind: "study", study },
  ...(LAB_IN_WORK
    ? lab.slice(i * 2, i * 2 + 2).map((piece, k): Item => ({
        kind: "lab",
        piece,
        slot: SLOTS[i * 2 + k],
      }))
    : []),
]);

// A case study: the lifted card, then its name and one line, with the year (or "Coming soon") at the far edge
function StudyCard({ study }: { study: Study }) {
  const caption = (
    <div className={styles.caption} data-text="small">
      <p className={styles.name}>
        <span className={styles.title}>{study.href ? <FlipText text={study.title} /> : study.title}</span>
        <span className={styles.line}>{study.href ? <FlipText text={study.line} /> : study.line}</span>
      </p>
      <p className={styles.meta}>{study.meta}</p>
    </div>
  );
  return study.href ? (
    <Link href={study.href} className={styles.card} data-card>
      <Media media={study.cover} ratio={study.card} shadow controls={false} />
      {caption}
    </Link>
  ) : (
    <div className={styles.card} data-soon>
      <Media media={study.cover} ratio={study.card} shadow controls={false} />
      {caption}
    </div>
  );
}

// `joke`: how the line's hover joke runs (JokeLead.tsx), in two steps or one
export function HomeB2({ joke = "two" }: { joke?: JokeMode }) {
  return (
    <main id="main" className={styles.page}>
      <header className={styles.opening}>
        <JokeLead className={styles.lead} mode={joke} />
        <dl className={styles.now} data-text="small">
          {now.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>
                <Keep text={fact.value} />
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <section id="work" className={styles.work} aria-labelledby="selected-work">
        <CardLift />
        <Reveal className={styles.head}>
          <h2 id="selected-work" className={styles.heading} data-text="title">
            Selected work
          </h2>
          <p className={styles.sub} data-text="small">
            {LAB_IN_WORK
              ? "Case studies, with experiments and side projects from the lab in between."
              : "Case studies in product design, front-end development, packaging and visual design."}
          </p>
        </Reveal>

        <ul className={styles.list}>
          {items.map((item) =>
            item.kind === "study" ? (
              <li key={item.study.slug} className={styles.study}>
                <Reveal className={styles.item}>
                  <StudyCard study={item.study} />
                </Reveal>
              </li>
            ) : (
              <li
                key={item.piece.key}
                className={styles.lab}
                style={
                  {
                    "--col": item.slot.col,
                    "--col-phone": item.slot.phone,
                    "--drop": item.slot.drop,
                  } as CSSProperties
                }
              >
                <Reveal className={styles.item}>
                  <div className={styles.box} style={{ aspectRatio: item.piece.ratio }}>
                    <Media
                      media={{
                        ratio: item.piece.ratio,
                        src: item.piece.src,
                        video: item.piece.video,
                        alt: item.piece.title,
                      }}
                      sizes="(min-width: 720px) 40vw, 80vw"
                      controls={false}
                    />
                  </div>
                  <p className={styles.labCaption} data-text="small">
                    <span className={styles.mark}>Lab</span>
                    <span>{item.piece.title}</span>
                  </p>
                </Reveal>
              </li>
            ),
          )}
        </ul>

        {LAB_IN_WORK && (
          <Reveal className={styles.foot}>
            <Link href={LAB_HREF} className={styles.more} data-text="small">
              <FlipText text="All lab pieces" />
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </Reveal>
        )}
      </section>
    </main>
  );
}
