import { site } from "@/content/site";
import type { Pic } from "./rows";

/*
  About B2's index, made personal (Noah, Nov 9: "the entries are all personal - not work related. Hobbys, moments,
  friends, mentors, passions, and DJing! Big focus on people and mentors, so lets change up the categorization. No year
  is necessary. Maybe just a longer context line?"). The work lives in the case studies and the lab, so it's not here.
  People come first: Noah, then mentors, then friends, then the rest. Facts are only what content/site.ts has; anything
  in [square brackets] is for Noah to fill. A row with pictures shows them in place of the pointer (AboutB2.tsx); a row
  without one keeps the usual pointer until its picture is added here.
*/
export type PersonalRow = {
  id: string;
  title: string; // who or what
  kind: string; // Me, Mentor, Friend, Moment, Passion, School, Hobby; a child row leaves it to its parent ("")
  context: string; // a longer line, up to two lines on a wide screen
  pics: Pic[]; // more than one take turns while the row is hovered
  // Related entries under it, one indent step in, as a case study's sections sit under its title in the rail (Noah,
  // Nov 9: "could we implement the parent/child system for related entries? ... Both hoverable"). Always shown.
  children?: PersonalRow[];
};

const photo = (src: string): Pic => {
  const p = site.photos.find((ph) => ph.src === src);
  return { src, ratio: p?.ratio ?? "4 / 3", alt: p?.caption ?? "" };
};

// Film photography: the favorite frame on the parent, the other frames as its children
function filmRoll(): PersonalRow {
  const frames: Pic[] = [
    { src: "/about/film-cubby.jpg", ratio: "790 / 1392", alt: "A narrow brick alley, light falling in from above", caption: "Capturing light in a cubby" },
    { src: "/about/film-corner.jpg", ratio: "1584 / 1020", alt: "A red brick corner building in Chinatown, graffiti on the wall beside it", caption: "A corner, Chinatown" },
    { src: "/about/chinatown-film.jpg", ratio: "1904 / 1234", alt: "A Chinatown street seen from under an overpass", caption: "Under a tunnel, Chinatown" },
    { src: "/about/film-rooftops.jpg", ratio: "1578 / 1012", alt: "Rooftops and a streetlight against clouds, an orange light leak across the frame", caption: "Light leaking over the rooftops" },
    { src: "/about/film-royden.jpg", ratio: "1578 / 1074", alt: "Royden sitting on a row of Citi Bikes on a tree-lined street", caption: "Royden on a Citi Bike" },
    { src: "/about/film-natalie.jpg", ratio: "934 / 1386", alt: "Natalie holding a red cup in front of The Cooper Union", caption: "Natalie in front of The Cooper Union" },
    { src: "/about/film-night.jpg", ratio: "1580 / 1044", alt: "An out-of-focus food cart glowing at night", caption: "Not sure where this one is from" },
    { ...photo("/about/mattress-film.jpg"), caption: "On film, at night" },
  ];
  // [Noah: pick your favorite frame.] It's the cubby for now; set FAVORITE to the src of the one you love most and it
  // moves up to the parent, the rest staying children in their order
  const FAVORITE = "/about/film-cubby.jpg";
  const favorite = frames.find((f) => f.src === FAVORITE) ?? frames[0];
  // Each child: what's in the frame as its title, where it is as its context (from its caption)
  const where: Record<string, [string, string]> = {
    "/about/film-cubby.jpg": ["Capturing light in a cubby", "[Where this was taken]"],
    "/about/film-corner.jpg": ["A corner", "Chinatown"],
    "/about/chinatown-film.jpg": ["Under a tunnel", "Chinatown"],
    "/about/film-rooftops.jpg": ["Light leaking over the rooftops", "[Where this was taken]"],
    "/about/film-royden.jpg": ["Royden on a Citi Bike", "[Where this was taken]"],
    "/about/film-natalie.jpg": ["Natalie", "In front of The Cooper Union"],
    "/about/film-night.jpg": ["Not sure where this one is from", "[Where this was taken]"],
    "/about/mattress-film.jpg": ["On film, at night", "[Where this was taken]"],
  };
  return {
    id: "film",
    title: "Film photography",
    kind: "Passion",
    context: "[A longer line about shooting film]",
    pics: [favorite],
    children: frames
      .filter((f) => f !== favorite)
      .map((f) => {
        const [title, context] = where[f.src ?? ""] ?? [f.caption ?? "[Frame]", "[Where this was taken]"];
        return { id: `film-${f.src}`, title, kind: "", context, pics: [f] };
      }),
  };
}

const rows: PersonalRow[] = [
  { id: "me", title: site.name, kind: "Me", context: "[A longer line about me]", pics: [site.portrait] },
  { id: "mentor-1", title: "[Mentor's name]", kind: "Mentor", context: "[What they taught me, and how we met]", pics: [] },
  { id: "mentor-2", title: "[Mentor's name]", kind: "Mentor", context: "[What they taught me, and how we met]", pics: [] },
  // Noah, Nov 9: "this is me and my bestfriend natalie! ... i think bestfriend would be more professional, and maybe
  // even sweeter?" Best friend first among the friends
  {
    id: "natalie",
    title: "Natalie",
    kind: "Friend",
    context: "My best friend",
    pics: [{ src: "/about/natalie-1.jpg", ratio: "2000 / 1256", alt: "Noah and Natalie in a sunny selfie, Natalie puffing her cheeks" }],
  },
  // Noah, Nov 9: "Kaya is a product designer friend of mine, and a great inspiration. This is us playing around with
  // funny filters." Three selfies that take turns while the row is hovered, the black and white one first (Noah: "for
  // Kaya and I, lets start with the B+W first")
  {
    id: "kaya",
    title: "Kaya",
    kind: "Friend",
    context: "Two product designers playing with filters", // Noah, Nov 9
    pics: [
      { src: "/about/kaya-3.jpg", ratio: "2000 / 1328", alt: "Noah and Kaya in black and white, each with a hand on their chin" },
      { src: "/about/kaya-1.jpg", ratio: "2000 / 1326", alt: "Noah and Kaya in a selfie, cartoon bluebirds circling their heads" },
      { src: "/about/kaya-2.jpg", ratio: "2000 / 1333", alt: "Noah and Kaya pulling faces through a warping filter" },
    ],
  },
  // A parent and its child (Noah, Nov 9: "the knicks game, me DJing could be a parent, with the crowd that night being a
  // child"). In Noah's own words (Nov 2): "me DJ'ing at a parade when the Knicks won the NBA finals, in the east village"
  {
    id: "djing",
    title: "DJing the Knicks’ Finals parade",
    kind: "DJing",
    context: "A parade in the East Village the night the Knicks won the NBA Finals",
    pics: [photo("/about/knicks-dj.jpg")],
    children: [
      { id: "djing-crowd", title: "The crowd that night", kind: "", context: "East Village", pics: [photo("/about/knicks-street.jpg")] },
    ],
  },
  // Noah's rolls (Nov 9), in Noah's order and words: "Capturing light in a cubby. A corner, Chinatown. Under a tunnel,
  // Chinatown. Royden on a citibike. Natalie in front of The Cooper Union. I'm not sure where this one is from!" The
  // rooftops frame came without a caption, so its line is a description for Noah to confirm. The parent shows Noah's
  // favorite frame; the rest are its children, one per place (Noah: "parent is my favorite of the bunch, children are
  // the different locations").
  filmRoll(),

  {
    id: "cooper",
    title: "Cooper Union School of Art",
    kind: "School",
    context: "Studying design and photography, [a longer line]",
    pics: [],
  },
  { id: "hobby", title: "[Hobby]", kind: "Hobby", context: "[A line]", pics: [] },
];

// What the page shows: only what's filled in (Noah, Nov 11, choosing "Hide what's unfilled" for tonight's About). A row
// whose name is still in [square brackets] stays off; a line that is, or the bracketed part of one, comes off and the
// row stays. Each comes back by itself once its brackets above are replaced with the real words.
const open = (text: string) => /\[[^\]]*\]/.test(text);
const fill = (text: string) => text.replace(/,?\s*\[[^\]]*\]/g, "").trim();
function filled(list: PersonalRow[]): PersonalRow[] {
  return list
    .filter((row) => !open(row.title))
    .map((row) => ({ ...row, context: fill(row.context), children: row.children && filled(row.children) }));
}

export const personal = filled(rows);
