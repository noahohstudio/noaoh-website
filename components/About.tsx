import { site } from "@/content/site";
import { EmailLink } from "./EmailLink";
import { Media } from "./Media";
import { FlipText } from "./Flip";
import { Photos } from "./Photos";
import styles from "./About.module.css";

// The about page. What matters comes first: a few lines about you, then how to reach you. Then
// the photos, scattered down the page like an archive (Photos.tsx). Your portrait sits beside the bio. The experience is off the
// page for now (Noah, Oct 25); it's still in content/site.ts.
export function About() {
  const elsewhere = [
    { label: "LinkedIn", href: site.links.linkedin },
    { label: "Resume", href: site.links.resume },
    { label: "Read.cv", href: site.links.readcv },
    { label: "GitHub", href: site.links.github },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <>
      <div className={styles.intro}>
        <h1 className="visually-hidden">About {site.name}</h1>
        <div className={styles.bio}>
          {site.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>{site.availability}</p>
        </div>
        <figure className={styles.portrait}>
          <Media media={site.portrait} />
        </figure>
      </div>

      <div className={styles.details}>
        <section className={styles.block} aria-labelledby="contact-title">
          <h2 id="contact-title" className={styles.label}>
            Contact
          </h2>
          <ul className={styles.contact}>
            <li>
              <EmailLink email={site.email} />
            </li>
            {elsewhere.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  <FlipText text={link.label} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Photos />
    </>
  );
}
