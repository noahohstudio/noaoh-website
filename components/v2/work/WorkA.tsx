import Link from "next/link";
import { projects, type Media as MediaType } from "@/content/projects";
import { Media } from "@/components/Media";
import { FlipText } from "@/components/Flip";
import { Reveal } from "@/components/Reveal";
import { CardLift } from "@/components/CardLift";
import styles from "./WorkA.module.css";

/*
  v2's work page, rendition A: a library bento of the case studies alone, no lab (Noah, Nov 9: "lets make sure selected
  work is found when you click on noah oh, and a separate library bento of case studies are found when you click
  work"). Four tiles on the site's twelve columns: Kino large, BoomLoom tall beside it, Palit and RFC Editor, still to
  come, smaller under them. Each is its picture, lifted off the page as the home's cards are, then its name in the
  display face, one line, and the year or "Coming soon". Pictures and their tiles come in with the site's quiet
  entrance (Reveal), and a tile you rest on lifts a little (CardLift).
*/

type Size = "lead" | "tall" | "half";

// BoomLoom's tall tile can't be its card: the wordmark loop is wide, and a tall crop cuts the wordmark. It's the
// case study's own photo of the manual instead, the 4 : 5 one, read from its page so there's one source.
const manual = projects.find((p) => p.slug === "boom-loom-looms")?.story.find((s) => s.id === "manual")?.media?.[0];

const TILES: Record<string, { size: Size; ratio?: string; media?: MediaType }> = {
  kino: { size: "lead", ratio: "16 / 10" },
  "boom-loom-looms": { size: "tall", media: manual },
  palette: { size: "half", ratio: "16 / 9" },
  rfc: { size: "half", ratio: "16 / 9" },
};

const tiles = projects.map((p) => {
  const tile = TILES[p.slug] ?? { size: "half" as Size };
  return {
    slug: p.slug,
    title: p.title,
    line: p.discipline,
    meta: p.soon ? "Coming soon" : p.year,
    href: p.soon ? undefined : `/work/${p.slug}`,
    size: tile.size,
    media: tile.media ?? p.cover,
    ratio: tile.ratio,
  };
});

export function WorkA() {
  return (
    <main id="main" className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.heading} data-text="title">
          Work
        </h1>
        <p className={styles.sub} data-text="small">
          Case studies in product design, front-end development, packaging and visual design. Palit and RFC Editor are
          coming soon.
        </p>
      </header>

      <section id="work" aria-labelledby="work-library">
        <h2 id="work-library" className="visually-hidden">
          Case studies
        </h2>
        <CardLift />
        <ul className={styles.bento}>
          {tiles.map((tile) => {
            const caption = (
              <div className={styles.caption} data-text="small">
                <p className={styles.name}>
                  <span className={styles.title}>{tile.href ? <FlipText text={tile.title} /> : tile.title}</span>
                  <span className={styles.line}>{tile.href ? <FlipText text={tile.line} /> : tile.line}</span>
                </p>
                <p className={styles.meta}>{tile.meta}</p>
              </div>
            );
            const picture = (
              <div className={styles.frame}>
                <Media media={tile.media} ratio={tile.ratio} shadow controls={false} sizes="(min-width: 760px) 66vw, 100vw" />
              </div>
            );
            return (
              <li key={tile.slug} className={`${styles.tile} ${styles[tile.size]}`}>
                <Reveal className={styles.reveal}>
                  {tile.href ? (
                    <Link href={tile.href} className={styles.card} data-card>
                      {picture}
                      {caption}
                    </Link>
                  ) : (
                    <div className={styles.card} data-soon>
                      {picture}
                      {caption}
                    </div>
                  )}
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
