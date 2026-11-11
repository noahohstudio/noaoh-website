import { labOpen, site } from "@/content/site";
import { projects } from "@/content/projects";

/*
  The about page's index, for the v2 renditions (AboutA.tsx, AboutB.tsx), after sleutelaar.xyz/index: one row per piece
  of work, study or life, in four columns (title, role, organization or context, year). Every fact is from
  content/site.ts and content/projects.ts; anything not known yet is in [square brackets] for Noah to fill.
  Each row carries the pictures that come up when it's hovered. A row with no picture shows a gray placeholder.
*/

export type Pic = { src?: string; ratio: string; alt: string; caption?: string }; // no `src`: a gray placeholder; `caption`, shown with it (About B2)
export type Row = {
  id: string;
  title: string;
  role: string;
  context: string; // the organization, or the context it was made in
  year: string;
  href?: string; // its case study, or the lab
  pics: Pic[]; // more than one take turns while the row is hovered, cut, never faded
  self?: true; // the row about Noah, with the portrait (rendition B, whose portrait shows only on hover)
};

const project = (slug: string) => projects.find((p) => p.slug === slug);
const poster = (slug: string): Pic | null => {
  const p = project(slug);
  const src = p?.cover.still ?? p?.cover.poster ?? p?.cover.src;
  return src ? { src, ratio: p?.cover.ratio ?? "16 / 9", alt: p?.cover.alt ?? "" } : null;
};
const card = (slug: string): Pic[] => {
  const pic = poster(slug);
  return pic ? [pic] : [{ ratio: "4 / 3", alt: "" }];
};
const live = (slug: string) => {
  const p = project(slug);
  return p && !p.soon ? `/work/${p.slug}` : undefined;
};
const photo = (src: string): Pic => {
  const p = site.photos.find((ph) => ph.src === src);
  return { src, ratio: p?.ratio ?? "4 / 3", alt: p?.caption ?? "" };
};

// Where each lab piece came from, in the words of its note in content/site.ts
const LAB_CONTEXT: Record<string, string> = {
  "Outcome Web Tool": "Inspired by Minna No Kimochi",
  "A study of the WØRKS website": "Hand-coded HTML",
  "The Hellp + Sombr tour poster": "Pitched to management",
  "Carmelle Safdie": "Contemporary artist",
  "Día de los Muertos": "Celebration party",
  Monograms: "After a Steve Jobs research project",
  "Del's Bridge": "Local web experience",
};

// A lab piece's context line is its kind, then its year when it has one ("Web tool, 2026")
const lab: Row[] = site.lab.map((piece) => {
  const match = piece.context.match(/^(.*?),\s*(\d{4})$/);
  const still = piece.video?.replace(/\.mp4$/, "-poster.jpg") ?? piece.src;
  return {
    id: `lab-${piece.title}`,
    title: piece.title,
    role: match ? match[1] : piece.context,
    context: LAB_CONTEXT[piece.title] ?? "[Context]",
    year: match ? match[2] : "[Year]",
    href: labOpen ? "/lab" : undefined,
    pics: still ? [{ src: still, ratio: piece.ratio, alt: piece.title }] : [{ ratio: piece.ratio, alt: "" }],
  };
});

export const rows: Row[] = [
  {
    id: "self",
    self: true,
    title: site.name,
    role: "Product designer",
    context: site.now.currently,
    year: "Now",
    pics: [site.portrait],
  },
  {
    id: "palit",
    title: project("palette")?.title ?? "Palit",
    role: "Founder",
    context: "SVSD 2026 finalist",
    year: "2026",
    href: live("palette"),
    pics: card("palette"),
  },
  {
    id: "kino",
    title: project("kino")?.title ?? "Kino",
    role: "Designer and front-end developer",
    context: "Social film app",
    year: project("kino")?.year ?? "2026",
    href: live("kino"),
    pics: card("kino"),
  },
  {
    id: "boomloom",
    title: project("boom-loom-looms")?.title ?? "BoomLoom Looms",
    role: "Visual and packaging designer",
    context: "Art-tool company",
    year: project("boom-loom-looms")?.year ?? "2026",
    href: live("boom-loom-looms"),
    pics: card("boom-loom-looms"),
  },
  {
    id: "rfc",
    title: project("rfc")?.title ?? "RFC Editor",
    role: project("rfc")?.discipline ?? "Product design, web",
    context: "[Organization]",
    year: "[Year]",
    href: live("rfc"),
    pics: card("rfc"),
  },
  {
    id: "cooper",
    title: "Cooper Union School of Art",
    role: "Student",
    context: "Design and photography",
    year: "[Year]",
    pics: [{ ratio: "4 / 3", alt: "" }],
  },
  ...lab,
  {
    id: "knicks",
    title: "Knicks’ Finals parade",
    role: "DJ",
    context: "East Village",
    year: "[Year]",
    pics: [photo("/about/knicks-dj.jpg"), photo("/about/knicks-street.jpg")],
  },
  {
    id: "film",
    title: "Film photography",
    role: "Photographer",
    context: "Personal",
    year: "[Year]",
    pics: [photo("/about/chinatown-film.jpg"), photo("/about/mattress-film.jpg")],
  },
];

// The bio's first sentence, which leads, and the rest, which follows in small type
export const lead = site.about[0].split(/(?<=\.)\s+/)[0];
export const rest = [site.about[0].slice(lead.length).trim(), ...site.about.slice(1)].filter(Boolean);

// The availability line, as the big contact statement: its first sentence in ink, the rest quieter
export const [statement, ...after] = site.availability.split(/(?<=\.)\s+/);
export const invitation = after.join(" ");
