import type { CSSProperties } from "react";
import { site } from "@/content/site";
import { Media } from "./Media";
import { Reveal } from "./Reveal";
import styles from "./Photos.module.css";

// The photos as an archive, after sleutelaar.xyz/archief: scattered down the page on twelve
// columns, each at its own place, so no two line up. Each comes in quietly as it shows, like
// the project cards (Reveal.tsx).
// Where each sits, in order: the column it starts on (`from`) or ends on (`to`), whether it's one
// of the big ones, and whether it sits lower than the one beside it. The pattern repeats after eight.
const PLACES: { from?: number; to?: number; big?: boolean; low?: boolean }[] = [
  { from: 2 },
  { to: 12, big: true, low: true },
  { from: 1, big: true },
  { to: 11, low: true },
  { from: 5, big: true },
  { from: 1 },
  { from: 7, big: true, low: true },
  { to: 12 },
];

// Tall photos take fewer columns than wide ones, so none towers over the rest
function span(ratio: string, big?: boolean) {
  const [w, h] = ratio.split("/").map(Number);
  if (w / h < 0.9) return big ? 4 : 3;
  if (w / h <= 1.2) return big ? 5 : 3;
  return big ? 6 : 4;
}

export function Photos() {
  // Only real photos: a placeholder never goes live, and with none the archive isn't there at all
  const photos = site.photos.filter((photo) => photo.src);
  if (photos.length === 0) return null;
  return (
    <section className={styles.photos} aria-label="Photos">
      <ul className={styles.archive}>
        {photos.map((photo, i) => {
          const place = PLACES[i % PLACES.length];
          const width = span(photo.ratio, place.big);
          const col = place.from ?? (place.to ?? 12) - width + 1;
          return (
            <li key={i} style={{ "--col": col, "--span": width } as CSSProperties} data-low={place.low || undefined}>
              <Reveal>
                <figure className={styles.photo}>
                  <Media media={{ ratio: photo.ratio, src: photo.src, alt: photo.caption }} />
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
