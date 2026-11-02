import Link from "next/link";
import { projects } from "@/content/projects";
import { Media } from "./Media";
import { FlipText } from "./Flip";
import { Reveal } from "./Reveal";
import { CardLift } from "./CardLift";
import styles from "./Work.module.css";

// One column, big images, a title under each. Each card comes in quietly as it
// first shows (Reveal). A case study still to come says "Coming soon" where its
// discipline goes, and isn't a link (Noah, Oct 28). Resting on a card lifts it a little (CardLift).
export function Work() {
  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <CardLift />
      <h2 id="work-title" className="visually-hidden">
        Selected work
      </h2>
      <ul className={styles.list}>
        {projects.map((project) => (
          <li key={project.slug}>
            <Reveal>
              {project.soon ? (
                <div className={styles.card} data-soon>
                  <Media media={project.cover} ratio={project.card} shadow controls={false} />
                  <p className={styles.caption}>
                    {project.title} <span className={styles.discipline}>Coming soon</span>
                  </p>
                </div>
              ) : (
                <Link href={`/work/${project.slug}`} className={styles.card} data-card>
                  <Media media={project.cover} ratio={project.card} shadow controls={false} />
                  <p className={styles.caption}>
                    <FlipText text={project.title} />{" "}
                    <span className={styles.discipline}>
                      <FlipText text={project.discipline} />
                    </span>
                  </p>
                </Link>
              )}
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
