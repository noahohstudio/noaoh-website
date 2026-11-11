import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, nextProject, published } from "@/content/projects";
import { Nav } from "@/components/Nav";
import { Media } from "@/components/Media";
import { StorySection } from "@/components/StorySection";
import { ReadMore } from "@/components/ReadMore";
import { FlipText } from "@/components/Flip";
import { Reveal } from "@/components/Reveal";
import { Footer } from "@/components/Footer";
import styles from "@/components/CaseStudy.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return published.map((project) => ({ slug: project.slug })); // the ones coming soon have no page
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = getProject((await params).slug);
  return project ? { title: project.title, description: project.summary } : {};
}

// Told the way case-studies/FORMAT.md describes: impact first, then the story
// in headlines, then what was learned and who did what.
export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { impact, story, lessons, credits } = project;
  const next = nextProject(slug);
  const index = [
    { id: "impact", title: "Impact" },
    ...story.map((section) => ({ id: section.id, title: section.label })),
    { id: "looking-back", title: "What I learned" },
  ];

  const cover = (
    <div className={styles.cover}>
      <Media media={project.cover} priority />
    </div>
  );

  // The summary stays for search and sharing, not on the page: the title and the hero say it. The
  // sections are listed once, in the nav's dial; the index that sat under the hero went (Noah, Oct 25)
  return (
    <>
      <Nav current="work" sections={[{ id: "main", title: project.title }, ...index]} />
      <main id="main" className={styles.page}>
        {/* The title, then its facts in one quiet line, each label beside its value, after Roy's (Noah kept this of
            three options, Oct 27) */}
        <header className={styles.head}>
          <h1 className={styles.title} data-text="display">{project.title}</h1>
          <dl className={styles.slate} data-text="small">
            {project.slate.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </header>
        {cover}

        <div className={styles.body}>
          <article className={styles.story}>
            <section id="impact">
              <p className={styles.label} data-text="small">
                Impact
              </p>
              <h2 className={styles.headline} data-text="title">
                {impact.headline}
              </h2>
              <p className={styles.text} data-text="body">
                {impact.context}
              </p>
              {impact.proof.length > 0 && (
                <ul className={styles.proof}>
                  {impact.proof.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              )}
              {impact.more && impact.more.length > 0 && (
                <ReadMore>
                  <dl>
                    {impact.more.map((note) => (
                      <div key={note.label}>
                        <dt>{note.label}</dt>
                        <dd>{note.text}</dd>
                      </div>
                    ))}
                  </dl>
                </ReadMore>
              )}
            </section>

            {story.map((section) => (
              <StorySection key={section.id} section={section} />
            ))}

            {/* The close, in one panel (Noah, Oct 25): the lessons as short numbered rules, then what I
                owned and contributed to, a line each. The reasoning and the brief-to-launch steps wait
                behind Read more, after Roy's. */}
            <section id="looking-back">
              <h2 className={styles.label} data-text="small">
                What I learned
              </h2>
              <ol className={styles.rules} data-text="title" style={{ "--count": lessons.length } as CSSProperties}>
                {lessons.map((lesson, i) => (
                  <li key={lesson.rule}>
                    <span className={styles.count}>{i + 1}.</span>
                    {lesson.rule}
                  </li>
                ))}
              </ol>
              {credits && (
                <dl className={styles.roles}>
                  <div>
                    <dt>Owned</dt>
                    <dd>{credits.owned.join(", ")}</dd>
                  </div>
                  {credits.contributed.length > 0 && (
                    <div>
                      <dt>Contributed</dt>
                      <dd>{credits.contributed.join(", ")}</dd>
                    </div>
                  )}
                </dl>
              )}
              <ReadMore>
                <dl>
                  {lessons.map((lesson, i) => (
                    <div key={lesson.rule}>
                      <dt>{i + 1}.</dt>
                      <dd>{lesson.body}</dd>
                    </div>
                  ))}
                </dl>
                {credits && credits.process.length > 0 && (
                  <>
                    <p className={styles.moreHead}>Brief to launch</p>
                    <dl>
                      {credits.process.map((item) => (
                        <div key={item.step}>
                          <dt>{item.step}</dt>
                          <dd>{item.body}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
              </ReadMore>
            </section>

            {project.footnote && (
              <div>
                <p className={styles.footnote} data-text="small">
                  {project.footnote.map((part, i) =>
                    typeof part === "string" ? (
                      part
                    ) : (
                      <a key={i} href={part.href}>
                        <FlipText text={part.text} />
                      </a>
                    ),
                  )}
                </p>
              </div>
            )}
          </article>
        </div>

        <section className={styles.next} aria-label="Next case study">
          <Reveal>
            <Link href={`/work/${next.slug}`} className={styles.nextLink}>
              <Media media={next.cover} ratio={next.card} shadow controls={false} />
              <p className={styles.nextCaption} data-text="small">
                <span className={styles.nextLabel}>
                  <FlipText text="Next" />
                </span>{" "}
                <FlipText text={next.title} />
              </p>
            </Link>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
