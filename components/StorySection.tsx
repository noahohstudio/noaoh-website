import type { CSSProperties } from "react";
import type { Section } from "@/content/projects";
import { Media } from "./Media";
import { ReadMore } from "./ReadMore";
import { InteractiveMark } from "./InteractiveMark";
import { ZineBook } from "./boomloom/ZineBook";
import { GlyphViewer } from "./boomloom/GlyphViewer";
import { BeforeBoard } from "./boomloom/BeforeBoard";
import { TurnDot } from "./TurnDot";
import { RowControls } from "./RowControls";
import styles from "./CaseStudy.module.css";

// A caption's role ("Before:", "After:") is set in black, the rest in gray.
function Caption({ text }: { text: string }) {
  const [, role, rest] = text.match(/^([^:\s][^:]*:)\s*(.*)$/) ?? [];
  return (
    <figcaption>
      {role ? (
        <>
          <span className={styles.role}>{role}</span> {rest}
        </>
      ) : (
        text
      )}
    </figcaption>
  );
}

// Each point the page makes is one piece, in one order (Noah, Oct 26): its visual first (a loop, an interactive, the
// mockups), then its small header and the headline under it, then its paragraph, then Read more. Nothing stands
// alone: no Read more, picture or header without the rest of its piece. A grouping of mockups is one visual, with the
// text that goes with each underneath it. A change of topic opens with a chapter header, above the visual.
// The paragraph tells the piece from the start, as Rachel's do; Read more keeps the specifics, as Roy's do.
const ratio = (media: { ratio?: string }) => {
  const [w, h] = (media.ratio ?? "4 / 3").split("/").map(Number);
  return w / h;
};

export function StorySection({ section }: { section: Section }) {
  const { media = [], explorations = [], steps = [], interactive, beside, more } = section;
  // An odd number of pictures leads with a wide one, and any picture can ask for a whole row
  const wide = (i: number) => !section.row && (Boolean(media[i].wide) || (i === 0 && media.length % 2 === 1));
  const visual = Boolean(interactive || media.length || beside || explorations.length || steps.length);
  // A row of loops that take turns plays as one, so it has one pause and replay for the row
  const together = Boolean(section.turns) && steps.every((step) => step.media.video || step.media.mov);

  return (
    <section id={section.id} data-chapter={section.chapter ? "" : undefined}>
      {section.chapter && <p className={styles.chapter} data-text="statement">{section.chapter}</p>}

      {interactive && (
        <figure className={`${styles.figure} ${styles.interactive}`}>
          {interactive.kind === "zine" ? (
            <ZineBook spreads={interactive.spreads} />
          ) : interactive.kind === "glyphs" ? (
            <GlyphViewer font={interactive.font} construction={interactive.construction} />
          ) : (
            <BeforeBoard pieces={interactive.pieces} />
          )}
        </figure>
      )}

      {media.length > 0 && (
        <div className={styles.grid} data-row={section.row || undefined}>
          {media.map((item, i) => (
            <figure
              key={i}
              className={styles.figure}
              data-wide={wide(i) || undefined}
              style={section.row ? ({ "--share": ratio(item) } as CSSProperties) : undefined}
            >
              <Media media={item} sizes={wide(i) ? "100vw" : "50vw"} />
              {item.caption && <Caption text={item.caption} />}
            </figure>
          ))}
        </div>
      )}

      {beside && (
        <figure className={`${styles.figure} ${styles.beside}`}>
          <Media media={beside.media} sizes="50vw" />
          <figcaption>
            <dl>
              {beside.notes.map((note) => (
                <div key={note.label}>
                  <dt className={styles.role}>{note.label}</dt>
                  <dd>{note.text}</dd>
                </div>
              ))}
            </dl>
          </figcaption>
        </figure>
      )}

      {explorations.length > 0 && (
        <div className={styles.options}>
          {explorations.map((option) => (
            <figure key={option.title} className={styles.figure}>
              <Media media={option.media} sizes={`${Math.ceil(100 / explorations.length)}vw`} />
              <figcaption>
                <span className={styles.role}>{option.title}</span>
                <span className={styles.verdict}>{option.verdict}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {steps.length > 0 && (
        <ol
          className={styles.steps}
          data-portrait={ratio(steps[0].media) < 1 || undefined}
          style={{ "--count": steps.length, "--tall": 1 / ratio(steps[0].media) } as CSSProperties}
        >
          {steps.map((step) => (
            <li key={step.title}>
              <figure className={styles.figure}>
                <Media media={step.media} sizes={`${Math.ceil(100 / steps.length)}vw`} controls={!together} />
                <figcaption>
                  <span className={styles.role}>{step.title}</span>
                  {step.body && <span className={styles.verdict}>{step.body}</span>}
                </figcaption>
              </figure>
            </li>
          ))}
          {section.turns && <TurnDot {...section.turns} />}
          {together && <RowControls />}
        </ol>
      )}

      <div className={styles.words} data-after={visual || undefined}>
        <p className={styles.label} data-text="small">{section.label}</p>
        {interactive ? (
          <div className={styles.headRow}>
            <h2 className={styles.headline} data-text="title">{section.headline}</h2>
            <InteractiveMark how={interactive.how} />
          </div>
        ) : (
          <h2 className={styles.headline} data-text="title">{section.headline}</h2>
        )}

        {section.body && <p className={styles.text} data-text="body">{section.body}</p>}

        {more && more.length > 0 && (
          <ReadMore>
            <dl>
              {more.map((note) => (
                <div key={note.label}>
                  <dt>{note.label}</dt>
                  <dd>{note.text}</dd>
                </div>
              ))}
            </dl>
          </ReadMore>
        )}
      </div>
    </section>
  );
}
