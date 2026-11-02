import { site } from "@/content/site";
import styles from "./Now.module.css";

// Where you are and where you've been, in one glance, after Rachel's. `center`: in the grid's two middle columns, a
// lander option for Review (Noah, Oct 28: "potentially move the current and previously closer to the center columns")
export function Now({ center = false }: { center?: boolean }) {
  return (
    <section className={styles.now} aria-label="Currently and previously">
      <dl className={styles.list} data-center={center || undefined}>
        <div>
          <dt>Currently</dt>
          <dd>{site.now.currently}</dd>
        </div>
        <div className={styles.wide}>
          <dt>Previously</dt>
          <dd>{site.now.previously}</dd>
        </div>
      </dl>
    </section>
  );
}
