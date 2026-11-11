import { projects, type Media } from "@/content/projects";
import { site } from "@/content/site";

/*
  What both v2 home renditions show (app/workshop/v2/home-a, home-b): the site's own line, Currently and Previously,
  the case studies, and the lab. The lab was placeholder gray boxes (Noah, Nov 8: "I'm going to work towards building
  new lab projects for quick looks and interactions - so for now, use blank gray boxes (varying dimensions) and
  placeholder text"); since Nov 11 the live lab's pieces stand in until those are built.
*/

// The line, split where the name ends, so the name can be set apart from the rest
const sentence = site.lander.sentence;
const cut = sentence.indexOf(" is ");
export const opening = { name: sentence.slice(0, cut), rest: sentence.slice(cut) };

export const now = [
  { label: "Currently", value: site.now.currently },
  { label: "Previously", value: site.now.previously },
];

export type Study = {
  slug: string;
  title: string;
  line: string; // the card's line: the discipline
  meta: string; // the year, or "Coming soon"
  href?: string; // none while it's coming soon
  cover: Media;
  card: string; // its card shape on the home page
};

export const studies: Study[] = projects.map((p) => ({
  slug: p.slug,
  title: p.title,
  line: p.discipline,
  meta: p.soon ? "Coming soon" : p.year,
  href: p.soon ? undefined : `/work/${p.slug}`,
  cover: p.cover,
  card: p.card,
}));

export type LabPiece = { key: string; title: string; line: string; ratio: string; video?: string; src?: string };

// The live lab's pieces, until the new lab projects are built (Noah, Nov 11, choosing "The live lab's seven" for v2's
// lab): the first six in Noah's order, two after each case study but the last; the whole lab has all seven
export const lab: LabPiece[] = site.lab
  .filter((piece) => piece.src || piece.video)
  .slice(0, 6)
  .map((piece, i) => ({
    key: `lab-${i + 1}`,
    title: piece.title,
    line: piece.context,
    ratio: piece.ratio,
    video: piece.video,
    src: piece.src,
  }));

export const contact = { email: site.email, linkedin: site.links.linkedin };
