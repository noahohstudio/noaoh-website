/*
  Case studies. Order here is the order on the home page.
  They're told the way case-studies/FORMAT.md describes, and each project's
  question sheet is in case-studies/<slug>.md. Anything in [square brackets]
  is a placeholder until its sheet is filled in.

  Media: add `src` (an image in /public/work/...) or `video` (a muted loop) to
  any frame to replace its gray placeholder. Captions start with the picture's
  role: "Before:", "Exploration:", "Decision:", "After:".
*/

export type Media = {
  ratio: string; // CSS aspect-ratio, e.g. "16 / 9"
  src?: string; // an image; with `widths`, the start of a set: `${src}-1600.avif`, `${src}-1600.webp`, …
  widths?: number[]; // the set's widths, smallest first
  video?: string; // a muted loop, as MP4; for a transparent loop, its plain fallback
  webm?: string; // the same loop as WebM, offered beside the MP4; for a transparent loop, VP9 with alpha
  mov?: string; // a transparent loop as HEVC with alpha, for Safari (components/Loop.tsx offers it by engine)
  poster?: string; // a loop's first frame, shown until it plays
  still?: string; // what a loop rests on with reduced motion, when that isn't its poster
  once?: boolean; // plays from its first frame each time it comes into view, then rests on its last
  transparent?: boolean; // sits on the page itself, whole: no gray behind it, never cropped
  alt?: string;
  caption?: string;
  wide?: boolean; // takes a whole row of a section's grid
  // Lifted just off the page with the cards' soft shadow (--shadow-card) wherever it shows, as the home cards always are:
  // for a cover whose own ground is the page's white, so it reads as a card at the top of its case study (Palit's, Noah,
  // Nov 18: "just to have a very slight shadow around the edges so that it's distinguished between that card and the page
  // itself. Only on the case study though")
  shadow?: boolean;
};

// An option you tried, with its verdict ("Ruled out: …" or "Chosen: …").
export type Exploration = { title: string; verdict: string; media: Media };

// A piece on a board you explore (components/boomloom/BeforeBoard.tsx), placed in a
// 1920 × 1080 frame so the board scales with its width.
export type BoardPiece = {
  src: string; // the real file, shown as it is
  size: [number, number]; // the file's width and height, in pixels
  crop?: [number, number, number, number]; // the part of it shown: left, top, right, bottom, in its pixels
  at: [number, number, number, number]; // where that part sits: left, top, width, height, in the frame
  page?: boolean; // a printed page: white behind it, with a hairline edge
  tag: string; // the pill under it: what was wrong
  tagY: number; // the pill's top, in the frame
  title: string; // the note's heading
  note: string; // the note, shown on hover, focus or tap
  loupe?: [number, number]; // a point in the file to show enlarged in the note, pixel for pixel
};

// A piece you play with instead of look at, built in the browser (components/boomloom, components/palette).
export type Interactive = (
  | { kind: "zine"; spreads: string[] }
  | { kind: "glyphs"; font: string; construction?: string }
  | { kind: "board"; pieces: BoardPiece[] }
  // Slides you click, tap or swipe through (components/palette/DeckStage.tsx; Palit's deck, Noah, Nov 18: "Lets make it
  // interactive, its ready to ship"). Each slide's `src` is its files' stem, served at each of `widths` in AVIF and WebP;
  // `n` is its place in the talk, which the line under the stage fills to
  | { kind: "deck"; slides: { src: string; n: number; alt: string }[]; widths: number[]; label?: string }
  // Cards you open one at a time (components/palette/SpecimenCards.tsx; Palit's specimen cards, Noah, Nov 18: "Specimen
  // card should not be video. Instead, they should just be interactive cards that depict exactly what the video is
  // depicting"). Each card's `src` is its smallest file, the rest of its set at `widths`; `label` names its button for
  // screen readers, `alt` describes the card
  | { kind: "specimens"; cards: { src: string; alt: string; label: string }[]; widths: number[] }
) & {
  how?: string; // how to use it, read to screen readers; the page shows only the Interactive mark
};

// A line in Read more: what it's about, then the reasoning.
export type Note = { label: string; text: string };

// One beat of the story, after Rachel's and Roy's: the visual that shows it, then its headline and a short
// paragraph that tells it (Rachel's way), with the specifics behind Read more (Roy's way). A change of topic opens
// with a chapter header, written by Noah. A flow shows its steps as small tiles.
export type Section = {
  id: string;
  chapter?: string; // the header for a change of topic, in Noah's words, shown big above the section
  label: string;
  headline: string;
  interactive?: Interactive;
  media?: Media[]; // two to a row; an odd number leads with a wide one
  row?: boolean; // the media on one row at one height instead: a portrait beside a landscape comes out narrower
  explorations?: Exploration[];
  steps?: {
    title: string;
    body?: string;
    media: Media;
  }[]; // small tiles, side by side
  // Tiles that take turns in one shared loop: each one's turn, [start, end] in seconds, and the dot that slides under the
  // one playing (TurnDot.tsx)
  turns?: { color: string; times: [number, number][] };
  beside?: { media: Media; notes: Note[] }; // one tile with its notes beside it, after Rachel's: a lone phone, say
  body?: string; // the piece's paragraph: 1 to 3 sentences, 60 words at most, under the headline
  more?: Note[]; // Read more: problem, decision, result, trade-off, or any labelled line
};

// Which beats a project uses. See "Three shapes" in case-studies/FORMAT.md.
export type Shape = "product" | "designathon" | "brand";

export type Project = {
  slug: string;
  title: string;
  summary: string; // one line on what it is
  shape: Shape;
  discipline: string;
  year: string;
  card: string; // card shape on the home page; cards span the lander's width, heights vary a little around 16:9
  soon?: true; // not ready yet: its card says "Coming soon" and leads nowhere, and it has no page
  cover: Media;
  slate: { label: string; value: string }[]; // Role, Team, Timeline, and one that fits
  impact: { headline: string; context: string; proof: string[]; more?: Note[] }; // `more`: what the hero can't say
  story: Section[];
  lessons: { rule: string; body: string }[];
  credits?: {
    owned: string[];
    contributed: string[];
    process: { step: string; body: string }[];
  };
  footnote?: (string | { text: string; href: string })[]; // the last line of the case study: credit to others
};

type Story = Pick<Project, "impact" | "story" | "lessons" | "credits">;

const more: Note[] = [
  { label: "Problem", text: "[What was wrong, and for whom.]" },
  { label: "Decision", text: "[What you did, specifically.]" },
  { label: "Result", text: "[What changed. A number if there is one.]" },
  { label: "Trade-off", text: "[What it cost or what you left out, and why that was OK.]" },
];

// A piece's paragraph, in the templates
const paragraph = "[The piece in 1 to 3 sentences, 60 words at most: what was wrong, what you did, what it changed.]";

const lessons = [
  { rule: "[A one-line rule you follow now.]", body: "[One sentence on where it came from.]" },
  { rule: "[What you'd do differently.]", body: "[One sentence on why.]" },
];

// Each "Owned" and "Contributed" item is 2 to 6 words, for the closing panel; the detail goes in the steps
const credits = (process: string[]) => ({
  owned: ["[Something you owned outright]", "[Another thing you owned]", "[A third thing you owned]"],
  contributed: ["[Something you helped with]", "[Another thing you helped with]"],
  process: process.map((step) => ({ step, body: "[What happened, in one line]" })),
});

// Read more, for a section whose visual says it all: the writing lives here, not under the picture (Noah, Oct 25)
const why = (label: string, text: string): Note[] => [{ label, text }];

// Shipped product: the full arc.
const product = (name: string, pieces: [string, string, string]): Story => ({
  impact: {
    headline: "[The result in one sentence, with a number if there is one.]",
    context: `[Who ${name} is, what you designed, when, and who with. Up to 60 words.]`,
    proof: ["[Number] [what it measures]", "[Number] [what it measures]"],
  },
  story: [
    {
      id: "overview",
      label: "Overview",
      headline: `[What ${name} is and who it's for, in one sentence.]`,
      media: [{ ratio: "16 / 9", caption: "Overview: [the product at a glance, on its devices]" }],
      body: paragraph,
      more: why("In short", "[A specific the paragraph leaves out.]"),
    },
    {
      id: "problem",
      chapter: "[Your header for the turn]",
      label: "Problem",
      headline: "[…but the catch: what was broken, missing or hard.]",
      media: [{ ratio: "16 / 9", caption: "Problem: [a diagram or screenshot of what was broken]" }],
      body: "[What was broken, then what you were brought in to do and how you went about it. 60 words at most.]",
      more: [
        { label: "Why it mattered", text: "[To the people using it, and to the business.]" },
        { label: "The ask", text: "[What you were brought in to do, word for word if you have it.]" },
        { label: "The approach", text: "[How you went about it, and who with.]" },
      ],
    },
    {
      id: "move-1",
      chapter: "[Your header for the work]",
      label: pieces[0],
      headline: "[The decision in one plain sentence.]",
      media: [{ ratio: "16 / 9", caption: "Before: [the piece as you found it]" }],
      explorations: [
        { title: "Exploration 1: [option]", verdict: "Ruled out: [why]", media: { ratio: "4 / 3" } },
        { title: "Exploration 2: [option]", verdict: "Chosen: [why]", media: { ratio: "4 / 3" } },
      ],
      body: paragraph,
      more,
    },
    {
      id: "move-2",
      label: pieces[1],
      headline: "[The decision in one plain sentence; say so if the brief asked for something else.]",
      media: [
        { ratio: "16 / 9", caption: "After: [the piece in use]" },
        { ratio: "4 / 5", caption: "Before: [what it replaced]" },
        { ratio: "4 / 5", caption: "After: [the same view, redesigned]" },
      ],
      body: paragraph,
      more,
    },
    {
      id: "move-3",
      label: pieces[2],
      headline: "[The decision in one plain sentence.]",
      media: [
        { ratio: "4 / 5", caption: "Before: [the piece as you found it]" },
        { ratio: "4 / 5", caption: "After: [the piece as it shipped]" },
      ],
      body: paragraph,
      more,
    },
    {
      id: "final",
      chapter: "[Your header for the result]",
      label: "Final",
      headline: "[The finished work, in the order someone meets it.]",
      steps: [
        { title: "[The first thing they see]", media: { ratio: "16 / 9" } },
        { title: "[What they do next]", media: { ratio: "16 / 9" } },
        { title: "[Where it ends]", media: { ratio: "16 / 9" } },
      ],
      body: paragraph,
      more: why("[A step]", "[What happens there, where its one line isn't enough.]"),
    },
  ],
  lessons,
  credits: credits(["Brief", "Research", "Design", "Build", "Launch"]),
});

// Designathon or concept: the idea, the product, its features, why it matters.
const designathon = (name: string): Story => ({
  impact: {
    headline: `[I designed ${name} in N hours for the event, and it placed X.]`,
    context: "[What it imagines, in one or two sentences.]",
    proof: [],
  },
  story: [
    {
      id: "idea",
      label: "The idea",
      headline: "[What you noticed that started it.]",
      media: [{ ratio: "16 / 9", caption: "Insight: [the quote, habit or gap]" }],
      body: paragraph,
      more: why("Who it's for", "[Who it's for.]"),
    },
    {
      id: "product",
      label: name,
      headline: "[What it is, in one sentence.]",
      media: [
        { ratio: "16 / 9", caption: "Product: [the whole thing, at a glance]" },
        { ratio: "4 / 5", caption: "Detail: [one screen up close]" },
        { ratio: "4 / 5", caption: "Detail: [another]" },
      ],
      body: paragraph,
      more: why("How it works", "[What someone does with it, start to finish.]"),
    },
    ...[1, 2, 3].map((n) => ({
      id: `feature-${n}`,
      label: `[Feature ${n}]`,
      headline: "[What it does, in one sentence.]",
      media: [{ ratio: "16 / 9", caption: "In use: [the feature, in motion]" }],
      body: paragraph,
      more: why("Why", "[Why it works this way.]"),
    })),
    {
      id: "why",
      label: "Why it matters",
      headline: "[Three reasons in one sentence: for people, for the business, and what no one else does.]",
      media: [{ ratio: "16 / 9", caption: "Why: [the picture that makes the case]" }],
      body: paragraph,
      more: [
        { label: "For people", text: "[The first reason.]" },
        { label: "For the business", text: "[The second.]" },
        { label: "No one else", text: "[The third.]" },
      ],
    },
  ],
  lessons: [
    { rule: "[What you'd build next, or cut.]", body: "[One sentence on why.]" },
    { rule: "[What you learned about working that fast.]", body: "[One sentence on where it came from.]" },
  ],
});

// Brand, packaging or motion: pictures first, the fewest words.
const brand = (name: string, pieces: [string, string, string]): Story => ({
  impact: {
    headline: "[The result in one sentence: units shipped, where it's sold, or who saw it.]",
    context: `[Who ${name} is, what you made, when, and who with. Up to 60 words.]`,
    proof: ["[Number] [what it measures]", "[Number] [what it measures]"],
  },
  story: [
    {
      id: "piece-1",
      label: pieces[0],
      headline: "[The one idea behind it.]",
      media: [
        { ratio: "16 / 9", caption: "Final: [the piece, whole]" },
        { ratio: "4 / 5", caption: "Process: [a sketch, test or mockup]" },
        { ratio: "4 / 5", caption: "In use: [on a shelf, in hand, in the room]" },
      ],
      body: paragraph,
      more,
    },
    {
      id: "piece-2",
      label: pieces[1],
      headline: "[The one idea behind it.]",
      media: [
        { ratio: "4 / 5", caption: "Final: [the piece]" },
        { ratio: "4 / 5", caption: "In use: [the piece, held or on the shelf]" },
      ],
      body: paragraph,
      more,
    },
    {
      id: "piece-3",
      label: pieces[2],
      headline: "[The one idea behind it.]",
      media: [{ ratio: "16 / 9", caption: "Final: [the piece, whole]" }],
      body: paragraph,
      more,
    },
  ],
  lessons,
  credits: credits(["Brief", "Concepts", "Production", "Launch"]),
});

// BoomLoom's pictures, copied from the BoomLoom handoff into public/work/boomloom (see case-studies/boom-loom-looms.md).
// Each still is a set of AVIF and WebP files, 1600 px wide and 2x.
const BOOMLOOM = "/work/boomloom";
const still = (name: string, widths: number[], media: Omit<Media, "src" | "widths">): Media => ({
  src: `${BOOMLOOM}/${name}`,
  widths,
  ...media,
});

export const projects: Project[] = [
  // In the order the home page shows them (Noah, Nov 18: "Let's reorder so that Palit is at the top, then Kino, then
  // Gouache, then Boomloomlooms."; before that Kino first and BoomLoom after it, Oct 28); the ones still to come last
  {
    slug: "palette",
    soon: true, // Not live yet: Noah has not cleared Palit to ship (the push of Nov 19 cleared Gouache only)
    // On locally to see the layout (Noah, Nov 16: "turn it on locally now just to see the layout - the copy i will refine
    // later"). Not to ship like this: `soon: true` goes back before any push unless Noah says otherwise
    title: "Palit", // its real name (Noah, Oct 29)
    // Written from case-studies/palette.md (Palit's own record, read-only at newer projects/palette); every fact as the
    // record states it, [?] still open. The copy is a draft for Noah to rewrite. The pictures are in public/work/palette,
    // made in case-studies/palette-workshop (each picked in Review, Nov 15 and 16).
    summary: "A Mac color picker that keeps where colors came from.",
    shape: "designathon",
    discipline: "Product design, designathon",
    year: "2026",
    card: "15 / 8",
    cover: {
      ratio: "16 / 9",
      shadow: true, // a card at the top of the page, not a band of the page's own white (Noah, Nov 18; Media above)
      // Round 3 of Noah's wordmark loop (Nov 2): the wordmark, its card sliding level into the prototype's Spectrum fan
      // (design/v3) as the cards rise opaque from below, one softly eased full turn through all 105 colors, then back.
      // It lands on a color with a name, Tenmoku rust, which the mark takes ("we should land on a color that has a name").
      // Its still is the wordmark, the loop's first frame.
      video: "/work/palette/video/palit-card-r3.mp4",
      webm: "/work/palette/video/palit-card-r3.webm",
      poster: "/work/palette/video/palit-card-r3-poster.jpg",
      alt: "Palit's wordmark, a rust-colored card beside the name, slides into a fan of colors; the fan spins once through every hue and comes back to Tenmoku rust, and the card slides back beside the name",
    },
    slate: [
      { label: "Role", value: "[? Founder, or product design and creative direction]" },
      { label: "Team", value: "[? Daeun Chung and me, or our roles]" },
      { label: "Timeline", value: "Q4 2026" },
      { label: "Result", value: "SVSD 2026 finalist" },
    ],
    impact: {
      headline: "Daeun and I designed Palit in five days for SVSD 2026, and it made the finals.",
      context:
        "Palit is a quiet Mac menu bar tool for visual designers. A keystroke picks a color from anything on screen and keeps it in an archive, with where it came from. The brief asked for a product one group would love, centered on storytelling; we answered with a film, then a live demo at the finals in New York.",
      // Both from the record: the brief on Oct 16 and the film on Oct 21 (entry 290); 386 decisions counted Nov 7 (entry 393)
      proof: ["5 days from the brief to the film", "386 decisions logged, each with its reason"],
    },
    story: [
      {
        id: "idea",
        chapter: "[Your header …]",
        label: "The idea",
        headline: "Designers keep the colors they find, but lose where they found them.",
        // Round 5 (Nov 17, Noah: "can we use the same slide speed as kino's screens?"): the slides measured from Kino's
        // problem loop (ease-in-out, 0.9 s out, 1.0 s in). After round 3 (Nov 15): the pickers, two notes on what's wrong,
        // then Palit at its full width with three on what's better, after Kino's problem (Noah: "slides the prior
        // screens... then we start showing and annotating")
        media: [
          {
            ratio: "16 / 9",
            video: "/work/palette/video/idea.mp4",
            webm: "/work/palette/video/idea.webm",
            poster: "/work/palette/video/idea-poster.jpg",
            alt: "Sip and ColorSlurp side by side, noted as keeping only the color and an automatic name, with no record of where it came from; they slide away and Palit's Days comes in, noted as keeping the app and the page, when you found it, and your name for it first",
          },
        ],
        body: "Visual designers pull color from photos, pages and references all day, and a hex code keeps none of that. Of 17 creatives we surveyed, 11 couldn't easily say where their last color came from, and only 1 kept colors and references in one place.",
        more: [
          {
            label: "Who it's for",
            text: "Visual designers in the ideation phase, with an emphasis on people who work mostly on the desktop: broad enough to cover product, design systems and brand, niche enough to mean something.",
          },
          {
            label: "The survey",
            text: "17 creatives, Nov 1 and 2, nine questions about the field that never name Palit. 82% say color is important to their process; 76% find color in their own photos; 71% say documenting every color with where they found it would be productive. [? the final count, if the survey ran on]",
          },
          {
            label: "The field",
            text: "Of the 11 color pickers among the 23 tools we reviewed, one keeps any trace of where a color came from. Sip, the closest to Palit, keeps the color and an automatic name.",
          },
        ],
      },
      {
        id: "found",
        label: "Found, never made",
        headline: "Palit has no generator: every color in it is one you found.",
        // Round 2 (Nov 15): Palit's empty first open on Kino's M5 MacBook Pro 14 (Good Mockups' template), over a Mac
        // desktop. [? the wallpaper is Apple's iMac Silver]
        media: [
          {
            ratio: "16 / 9", // the laptop whole, padded with clear space to the system's ratio
            src: "/work/palette/found-macbook",
            widths: [1600, 2740],
            transparent: true,
            alt: "A MacBook Pro with Palit open over most of the screen, empty, reading: Every color in Palit is one you found. Press option, shift, C, then click any color on your screen",
          },
        ],
        body: "There's no hex field, no color wheel and no AI: a color you don't have yet, you go out and find. It's the brief's \"even if others might hate it\": Palit isn't for anyone who wants a palette handed to them.",
        more: [
          {
            label: "The opinion",
            text: "No palette generation and no AI assistance: you sift through your own collection for the colors you own and love, and if one doesn't exist yet, you go out of your way to find it.",
          },
          { label: "Who it isn't for", text: "Palit isn't one click." },
          { label: "Not generative", text: "Palit runs algorithms (Spectrum sorts by hue; Similar measures how close two colors are), but it never makes a color, a palette or a name." },
        ],
      },
      {
        id: "pick",
        chapter: "[Your header …]",
        label: "The pick",
        headline: "One keystroke takes a color from anything on screen, and keeps where it came from.",
        // Round 6 (Nov 18, Noah: "Can we have more dynamic camera movement, following whats in focus? With more of an ease
        // too"): five eased camera moves following the loupe, the palette, the copy and the keys.
        // Round 5 (Nov 17, Noah on round 4: "the motion should not be a top slide in, instead moreso a bump. Can we make it
        // more elevated and friendly?"): the strip nudges down and the new color bumps up in place, lifted with a soft
        // shadow. Round 4 (Nov 17): no ring ("instead of having a black border when it bumps, lets let the motion show that"). After
        // round 3 (Nov 15): the Mac's own loupe, which Palit.app picks with ("my lens", entry 387), the film's white keys
        media: [
          {
            ratio: "16 / 9",
            video: "/work/palette/video/pick.mp4",
            webm: "/work/palette/video/pick.webm",
            poster: "/work/palette/video/pick-poster.jpg",
            alt: "Over a photo of crocoite open in Preview, the Mac's loupe glides across the crystals and keeps a red; it bumps into Palit's palette at the screen's edge, lifting softly before it settles, and a click copies it; then option, shift and C are pressed and the loupe returns",
          },
        ],
        body: "⌥⇧C opens the Mac's own loupe. The color you click is kept with the app, the window, the page's address and a small picture of the spot, and the card in the menu bar takes it. Hold ⇧ to keep a palette, or ⌥ to name the color as you pick.",
        more: [
          { label: "What's kept", text: "The color, the app under the pick, the window's title, a browser tab's title and address, and, with Screen Recording already allowed, a picture of the spot and the eight colors around it. It never asks for Screen Recording." },
          { label: "Quiet", text: "No Dock icon: one keystroke, then out of the way. The palette waits at the screen's edge, and a click copies a color." },
        ],
      },
      {
        id: "card",
        label: "The specimen card",
        headline: "Each color opens as a specimen card: where you found it, when, and your name.",
        // Nov 18, Noah: "Specimen card should not be video. Instead, they should just be interactive cards that depict exactly
        // what the video is depicting": the loop's board as the piece itself (components/palette/SpecimenCards.tsx), round
        // 4's four whole cards, two by two; click or Enter lifts one to the middle as the others blur and dim inside the box
        // (Noah's ask), its ×, Esc or a click outside puts it back. The loop's files stay in public/work/palette/video/cards.*.
        // [? its Similar rows come from v3's sample archive] [? the teal's and the yellow's names and times are v3's drafts]
        interactive: {
          kind: "specimens",
          widths: [880, 1760],
          cards: [
            { src: "/work/palette/cards/teal-880.webp", label: "Teal from Preview, not named yet, found in Grand Prismatic Spring.jpg", alt: "Palit's specimen card for a teal not named yet, #2d9793: the Grand Prismatic Spring's turquoise water and orange rim it was picked from, its chip, and its story. Found: Preview, Grand Prismatic Spring.jpg. Kept: November 3, 10:12 AM. Values: #2d9793; 45 151 147; 61.7% 0.094 191°. Reads as: Cool, Mid value, Saturated." },
            { src: "/work/palette/cards/hyacinth-880.webp", label: "Hyacinth red, found in Crocoite from the Dundas extended mine.jpg", alt: "Palit's specimen card for Hyacinth red, #c53f00: the crocoite specimen it was picked from, its chip, and its story. Found: Preview, Crocoite from the Dundas extended mine.jpg. Kept: November 14, 2:20 PM. Values: #c53f00; 197 63 0; 55.6% 0.180 39°. Reads as: Warm, Mid value, Saturated." },
            { src: "/work/palette/cards/yellow-880.webp", label: "Light yellow from Preview, not named yet, found in Jardin Majorelle.jpg", alt: "Palit's specimen card for a light yellow not named yet, #ffb001: the blue villa's yellow curtains it was picked from, its chip, and its story. Found: Preview, Jardin Majorelle.jpg. Kept: November 1, 4:06 PM. Values: #ffb001; 255 176 1; 81.2% 0.170 76°. Reads as: Warm, Light, Saturated." },
            { src: "/work/palette/cards/prussian-880.webp", label: "Prussian blue, found in Under the Wave off Kanagawa.jpg", alt: "Palit's specimen card for Prussian blue, #1e5b8a: the wave it was picked from, its chip, and its story. Found: Preview, Under the Wave off Kanagawa.jpg. Kept: November 4, 7:40 PM. Values: #1e5b8a; 30 91 138; 45.6% 0.098 246°. Reads as: Cool, Mid value, Saturated." },
          ],
          how: "click a card, or press Enter on it, to open it; its ×, Escape or a click outside puts it back.",
        },
        body: "Specimen cards keep a sample with everything known about it, and so does Palit's. Your name for a color comes first; until you name it, it's named for where you found it. Similar shows the colors you've kept like it, with where and when you found them.",
        more: [
          { label: "Where it came from", text: "Pantone's chips and the mineral specimen cards on our Are.na board." },
          { label: "Similar", text: "A distance in OKLab under 2 is nearly identical, under 5 close, and under 7 shows in Kept before." },
        ],
      },
      {
        id: "dial",
        label: "The dial",
        headline: "One dial turns the archive from only color to the whole hunt.",
        // Dial B, round 3 (Nov 15), chosen: "after that I think it's ready to ship"
        media: [
          {
            ratio: "16 / 9",
            video: "/work/palette/video/dial.mp4",
            webm: "/work/palette/video/dial.webm",
            poster: "/work/palette/video/dial-poster.jpg",
            alt: "Palit's Days steps through its four zoom stops, only color, your names, and where, and the hunt with each place's picture, and back, each change a wave down the days, with command minus and plus pressed below",
          },
        ],
        body: "− and + step through four stops: only color, your names, where you found each, and each day's whole hunt. Before the dial, a day showed only 2 of the 9 parts of a color's story without a click.",
        more: [
          { label: "The audit behind it", text: "In v2, Days showed 2 of a color's 9 parts before a click, and Pinned was 11% color." },
          { label: "Timeless", text: "The same dial serves a first day and a fourth year: from only color to the whole hunt, and back." },
        ],
      },
      {
        id: "table",
        label: "The table",
        headline: "On the table, a palette sits on white, gray or black before you use it.",
        // Round 7 (Nov 18, Noah: "Can we add another color? And make the placements look a little more experimental and
        // worked"): a fifth real pick, the Great Wave's cream, and a composed layout. [? the cream's name is v3's placeholder]
        // Round 6 (Nov 18, Noah: "lets put light blue and yellow closer together, and put yellow a little lower").
        // Round 5 (Nov 17, Noah: "Lets make the colors rectangular vertically, and make the shadows way less noticeable"),
        // after round 4 (Nov 15): four colors, only the ground changing (Noah: "just a feature"). [? the keys 1 to 4 are a proposal]
        media: [
          {
            ratio: "16 / 9",
            video: "/work/palette/video/table.mp4",
            webm: "/work/palette/video/table.webm",
            poster: "/work/palette/video/table-poster.jpg",
            alt: "Five tall color swatches set out by hand on Palit's table, a red alone and two pairs, while the ground behind them changes from white to mid gray to black to all three",
          },
        ],
        body: "Take any palette to the table, arrange its colors by hand, and set them on white, mid gray, black or all three. The gray behind two colors alone can change how different they look by up to eight times.",
        more: [{ label: "The research", text: "Xin, Lam and Luo, Color Research & Application, 2004, across 38 gray pairs; Josef Albers' Interaction of Color." }],
      },
      {
        id: "versions",
        chapter: "[Your header …]",
        label: "Three versions in a day",
        headline: "In one day we rebuilt the archive three times, each time from a measurement.",
        // Round 6 (Nov 17, Noah on round 5: "This is terrible - can we find a smoother, more satisfying way to transform the
        // screens?"): rendition A, a wave, on the page for now; B, a stack of versions, waits in Review. No more morphing:
        // the version leaves in the dial's wave, the empty window reshapes, the next arrives row by row.
        // Round 5 (Nov 17, Noah on round 4: "morph looks terrible … the shrink effect on some of the disappearing pieces …
        // not enjoying how all the text just appears without order"): no shrinking, pieces fade at full size and neighbors
        // widen into the gaps, text in reading order. Round 4 (Nov 17, Noah on round 3: "this is ugly, especially when
        // elements pass through eachother … could we have blocks just change colors"): blocks reshape in place and change
        // color, nothing crosses; v1, v2 and v3
        media: [
          {
            ratio: "16 / 9",
            video: "/work/palette/video/versions.mp4",
            webm: "/work/palette/video/versions.webm",
            poster: "/work/palette/video/versions-poster.jpg",
            alt: "Palit's archive morphs from version 1's identical tiles to version 2's wall of color to version 3's days: each version leaves in a wave down the page, the window reshapes, and the next arrives row by row, each date, then its colors left to right, then their words",
          },
        ],
        body: "On Oct 18 the first prototype felt \"stagnant and boring\", the second hid most of each color's story, and the third had grown to 29 controls. Each time we measured what was wrong, workshopped it and rebuilt; v3 came out at 16 controls and 23 words.",
        more: [
          { label: "Version 1", text: "Color filled 43% of the window, boxed into identical tiles." },
          { label: "Version 2", text: "A wall of color, but a day showed 2 of a color's 9 parts before a click." },
          { label: "Version 3", text: "Type at 11, 13, 17 and 26, one gray, one 20 px edge, nothing on the colors, 240 ms on one ease." },
        ],
      },
      {
        id: "deck",
        label: "The deck",
        headline: "[A claim about the deck, once its visual is picked]",
        // The film's place (Noah, Nov 15: "Instead of the film, we can just include the slide deck"). F, on stage, chosen
        // (Noah, Nov 18: "Honestly this is probably the way to go about it"), then made interactive (Noah, Nov 18: "Lets make
        // it interactive, its ready to ship"), clicked, swiped or keyed through on the loop's stage
        // (components/palette/DeckStage.tsx). Nov 18, Noah: "we could touch on more technical and research-heavy slides
        // within": the Spotify study (30), and from the appendix the market worked out (73), Doshi & Hauser (91), the 23
        // tools (93), Xin, Lam & Luo (105), the v2 audit (115), how Palit reads a color (120) and how Palit.app is built (121). The loop's files stay in public/work/palette/video/deck.* in case it
        // comes back. [? the moodboard slide shows three references by others, credited on the slide]
        interactive: {
          kind: "deck",
          label: "Palit's finals deck",
          widths: [1600, 2560],
          slides: [
            { src: "/work/palette/deck/s010-1600.webp", n: 10, alt: "The system: A palette for a tool that collects color" },
            { src: "/work/palette/deck/s011-1600.webp", n: 11, alt: "Where the look came from: a specimen and collection feel, clean, functional and considered. Three references from our moodboards: Núria García's business cards, the color is the paper itself; crocoite, catalogue no. 725.2, one template, many specimens; a Pantone collage, text set on the color" },
            { src: "/work/palette/deck/s012-1600.webp", n: 12, alt: "The system, condensed: Display Pro and SF Pro, both light; paper, shell, ink and one gray; square in the heart, round in the shell; 240 ms, one ease" },
            { src: "/work/palette/deck/s014-1600.webp", n: 14, alt: "Our workflow" },
            { src: "/work/palette/deck/s018-1600.webp", n: 18, alt: "Our dashboard on Logs: every decision with its reason" },
            { src: "/work/palette/deck/s023-1600.webp", n: 23, alt: "So we asked creatives ourselves" },
            { src: "/work/palette/deck/s024-1600.webp", n: 24, alt: "76% of them find color in their own photos. 13 of 17 creatives we asked, our survey, November 2026" },
            { src: "/work/palette/deck/s027-1600.webp", n: 27, alt: "What they told us, and what Palit does: 76% find color in their own photos, so pick from anything on your screen; 65% couldn't trace their last color, so every pick keeps where and when; 71% would document every color, so it's kept in one keystroke, named by you; 1 of 17 keep it all in one place, so there's one archive, found again by day" },
            { src: "/work/palette/deck/s029-1600.webp", n: 29, alt: "Palit is not generative" },
            { src: "/work/palette/deck/s030-1600.webp", n: 30, alt: "What users found themselves was almost always more varied than what an algorithm chose. Over 100 million Spotify listeners: Anderson et al., The Web Conference, 2020" },
            { src: "/work/palette/deck/s034-1600.webp", n: 34, alt: "Under 10% of the color pickers we studied keep where a color came from: 1 of 11, and only as a screenshot" },
            { src: "/work/palette/deck/s039-1600.webp", n: 39, alt: "Palit is inherently long term" },
            { src: "/work/palette/deck/s059-1600.webp", n: 59, alt: "Where Palit could live next" },
            { src: "/work/palette/deck/s063-1600.webp", n: 63, alt: "Palit in Figma: a palette added as variables, each with where it was found" },
            { src: "/work/palette/deck/s073-1600.webp", n: 73, alt: "What it's worth: 385,800 graphic, web and UI designers in the US (BLS, 2026), times $29.99, what designers pay for a seat of Sip, is $11.6 million, the ceiling at what a color tool already costs; times 71%, who say documenting where they found a color would be productive, is $8.2 million, the market Palit serves in the US" },
            { src: "/work/palette/deck/s091-1600.webp", n: 91, alt: "+10.7% more alike to one another: stories people wrote with AI's ideas. 293 writers, 600 judges: Doshi & Hauser, Science Advances, 2024" },
            { src: "/work/palette/deck/s093-1600.webp", n: 93, alt: "The 23 tools we studied. Pickers, 11: Sip, ColorSlurp, Pick, Digital Color Meter, Pastel, Figma eyedropper, Adobe Capture, Pantone Connect, Coolors, ColorZilla, Pika. Collections, 7: Are.na, Cosmos, Pinterest, mymind, Eagle, Savee, Milanote. Generators with AI, 5: Khroma, Colormind, Coolors AI and Color Bot, Adobe Firefly Generative Recolor, Huemint" },
            { src: "/work/palette/deck/s105-1600.webp", n: 105, alt: "8x as different, the same two colors can look on a different gray. Xin, Lam & Luo, 2004" },
            { src: "/work/palette/deck/s115-1600.webp", n: 115, alt: "2 of 9 things Palit keeps about a color showed before a click. Our audit of v2, October 18" },
            { src: "/work/palette/deck/s120-1600.webp", n: 120, alt: "How Palit reads a color: warm, a hue under 110\u00b0 or over 330\u00b0; cool, a hue from 150\u00b0 to 300\u00b0; neutral, chroma under 0.03 and no temperature; dark, mid and light, lightness under 0.42, under 0.72, or above; muted, chroma under 0.09; similar, under 7 apart in OKLab, and under 2 is nearly identical. OKLab and OKLCH, after Bj\u00f6rn Ottosson; every threshold is Palit's own" },
            { src: "/work/palette/deck/s121-1600.webp", n: 121, alt: "How Palit.app is built: the menu bar, where the mark holds the last color you kept; \u2325\u21e7C, where the Mac's own loupe picks one pixel; where it came from, the app and the window's title; the archive, Palit's dashboard in its own window; the palette, docked at the screen's edge or floating; your colors, which stay on this Mac. Palit.app, a Swift package with the command line tools, November 2026" },
            { src: "/work/palette/deck/s067-1600.webp", n: 67, alt: "Go find a color." },
          ],
          how: "click or tap the right of the slide for the next one and the left for the one before, swipe, or use the arrow keys.",
        },
        body: "[The piece in 1 to 3 sentences.]",
        more: [{ label: "The finals", text: "The crit was on Nov 7 in New York; the talk opened on a live demo of Palit.app, a native Mac shell around the prototype. [? the critique]" }],
      },
      {
        id: "horizon",
        label: "On the horizon",
        headline: "[A claim about where Palit goes next, with Noah]",
        // Round 4 (Nov 16): the deck's phone mockup, still, in Apple's iPhone 17 (Apple Design Resources; the notice is
        // beside the files). The photos are v3's desk photos standing in for a camera, and the places' names are drafts
        media: [
          {
            ratio: "16 / 9",
            src: "/work/palette/horizon-iphones",
            widths: [1600, 2560],
            transparent: true,
            // Round 8 (Nov 17, Noah on round 7: "lens should be center, and noticeable"), from round 7 ("use this instead"):
            // Noah's own photo of a stone corner building under a deep blue sky
            // (case-studies/palette-workshop/from-noah/horizon-building-nov17.webp) as the camera's view, the loupe at the
            // screen's center on the sunlit stone; Days' first place and its colors from it, their Chinatown corner second.
            // [? the first place's name, "A stone facade", and the times]
            alt: "Two iPhones: one points its camera at a sunlit stone corner building under a deep blue sky, a large loupe at the center of the screen magnifying the stone with its color below, Palit's card as the shutter; the other shows Palit's Days keeping that stone first, with the sky's blue and a tree's dark green beside it, and a red brick corner in Chinatown below",
          },
        ],
        body: "[The piece in 1 to 3 sentences.]",
        more: [{ label: "Where it stands", text: "Noah: \"Currently trying to build Palette into an actual scalable tool or product that people are looking for.\"" }],
      },
    ],
    lessons: [
      { rule: "[? Noah's first rule]", body: "[? one sentence on where it came from]" },
      { rule: "[? Noah's second rule]", body: "[? one sentence on where it came from]" },
    ],
    credits: {
      owned: ["[? product design and creative direction]", "[? the system and prototypes]", "[? the film's script and motion]"],
      contributed: ["[? the logo and brand, with Daeun]", "[? the research and the survey]"],
      process: [
        { step: "The brief", body: "Oct 16: a product one group would love, centered on storytelling." },
        { step: "The system", body: "Oct 17: a native shell with a raw, archival heart." },
        { step: "Three versions", body: "Oct 18: v1, v2 and v3, each rebuilt from a measurement." },
        { step: "The film", body: "Oct 19 to 21: 9:18, submitted Oct 21." },
        { step: "The finals", body: "Oct 25 to Nov 7: finalist, Palit.app, and the crit in New York." },
      ],
    },
    // [? Daeun's credit line, in Noah's words]
    footnote: [
      "Made with Daeun Chung (brand and visual imagery). The photos inside Palit's screens: crocoite by JJ Harrison (CC BY-SA 2.5), Harlem brownstones by Paul Lowry (CC BY 4.0), Jardin Majorelle by Viault (CC BY-SA 4.0), Grand Prismatic Spring by Jim Peaco, National Park Service (public domain), via Wikimedia Commons; Under the Wave off Kanagawa, The Met (public domain). Sip and ColorSlurp as shown on their own sites. Laptop mockup: Good Mockups. iPhone frames: Apple Design Resources.",
    ],
  },
  {
    // Written from the Kino handoff (case-studies/kino/) and Noah's page calls on Oct 25; every fact as written
    // there, with the sheet in case-studies/kino.md. [?] is still open. The pictures are in public/work/kino.
    slug: "kino",
    title: "Kino",
    summary: "A design language and system for a social film app.",
    shape: "product",
    discipline: "Product designer, front-end dev", // the card's line, Noah's words (Oct 29)
    year: "2026",
    card: "5 / 3",
    cover: {
      ratio: "16 / 9",
      // The hero, round 11 (case-studies/kino-workshop, rounds 18–20): Noah, Nov 11: "I want to revisit the Kino overview
      // card - I want to make it a little more mature and component/screen focused". Two renditions went up; Noah took A, then:
      // "Lets make it a little more dynamic - like our prior one, just losing the numbers going up, the groups coming together,
      // the unnecessary animations that dont show the product. The header and kino splash was cool to include though"; then
      // "honestly, we could lose the section with the three phones showing their work. Ship afterwards". So round 10's splash,
      // its four versions of Home and its closing line, without the people, the match or the scores. 6.1 s. Made by the Kino
      // session. Round 10 (hero-r10.*) stays in public/work/kino/video.
      video: "/work/kino/video/hero-r11-a-r3.mp4",
      webm: "/work/kino/video/hero-r11-a-r3.webm",
      poster: "/work/kino/video/hero-r11-a-r3-poster.jpg", // the four versions, all in
      alt: "Kino's splash gathers its dots into the wordmark; Home in four versions on iPhones, from a colorless sketch to the final; then the line Vertical Network for Film Lovers",
    },
    slate: [
      { label: "Role", value: "Designer and frontend developer: language and system" },
      { label: "Team", value: "Founder, iOS developer and designer (me)" }, // roles, not names (Noah, Oct 28)
      { label: "Timeline", value: "Q4 2026" },
      { label: "Platforms", value: "iOS and the web, from one system" },
    ],
    impact: {
      headline: "Kino's live app runs on the design language, systems and interactions I built.",
      context:
        "On Oct 5, 2026, I set aside Kino's initial design system and started over, atoms first, reflecting its core principles in the new one. I then built coded prototypes, rapidly iterating and engineering new features and interactions. The founder ported my final screens from my personal branch into the live app by Oct 12.",
      proof: [
        // Dated from the git history (Noah, Oct 28: "Look through my git files"): the first survey on Oct 5, and the
        // founder's "Bring Kino UI and flows into prototype parity" on the live app's main branch on Oct 12
        "8 days from the first survey to the system in the live app",
        "21 publishes of the coded prototype in four days, then frontend work on the live app, from my own branch",
      ],
    },
    story: [
      {
        id: "overview",
        label: "Overview",
        headline: "Kino is a vertical social network.",
        // One picture of the two (Noah, Oct 26, approved): the phone at about 0.78 of the laptop's lid, on one floor,
        // and the laptop's feed showing friends' takes and scores before a trailer cut off at the bottom
        // (case-studies/kino-workshop/README.md). The two stills it replaced are kept in public/work/kino.
        media: [
          {
            ratio: "16 / 9",
            src: "/work/kino/home-pair-r2",
            widths: [1600, 3200],
            transparent: true,
            alt: "Kino's Home on an iPhone beside the same Home on the web in a laptop: Movie night, Dani?, then friends' takes with their scores and replies, and a trailer running off the bottom of the screen",
          },
        ],
        body: "You rank the films you've watched through quick head-to-head comparisons, see how your taste matches your friends', and pick films together as a group, on iOS and the web.",
        more: [
          {
            label: "iOS and the web",
            text: "Home on a 402-point iPhone, and the same Home on the web, with a left rail and a side column that scrolls on its own.",
          },
          {
            label: "Where it sits",
            text: "Closest relatives are Letterboxd and Goodreads, both individual and journal-centered. Kino is social and friendly, with just as much credibility and functionality in its critique features.",
          },
          {
            label: "Who it's for",
            text: "Kino is a tool that creates special experiences, then provides a platform for sharing them. Kino is for film enthusiasts and casual watchers alike.",
          },
        ],
      },
      {
        id: "problem",
        chapter: "Why redesign?",
        label: "Problem",
        headline: "Kino is meant to reflect a night-in with friends, but the earlier designs didn't carry that.",
        // V0 states the problem, and the new Home slides in beside it as the solve (Noah, Oct 27: "State our problem… the
        // lack of visual language correlates to the lack of purpose and functionality. Lets then show our solve beside,
        // sliding the rightmost phone downwards and replacing it with our new homescreen"). Made by the Kino session.
        media: [
          {
            ratio: "16 / 9",
            // Round 2 (Noah, Oct 27: "slide all 3 initial phones, then have the new version follow… simple annotations that
            // connect to different components on the new screen"; then softer slides, time to read, highlights that fade,
            // middle first; then quicker notes, “Tomato color”, a quiet Before and After, and tidy status bars; then "a
            // little less time on the white screens", about 2 s, 12.2 s in all): the three main changes, one at a time
            video: "/work/kino/video/problem-annot-r5.mp4",
            webm: "/work/kino/video/problem-annot-r5.webm",
            poster: "/work/kino/video/problem-annot-r5-poster.jpg",
            still: "/work/kino/video/problem-annot-r5-still.jpg", // the new Home, all three notes showing
            alt: "V0's Groups, My films and Home on iPhones slide away, Kino's new Home comes in, and three notes appear in turn beside its greeting, its group card and its Vote for Friday button",
          },
        ],
        // My role was a header-only piece of its own right after this one; it folded in here (Noah, Oct 26)
        body: "Without a visual language or system, the screens had no clear purpose or emotion; the app didn't feel like what Kino stood for. With each pass, I critiqued and workshopped the atoms to re-align them with Kino's principles.",
        more: [
          {
            label: "V0's issues",
            text: "Labels in all caps, and one red for buttons, links, icons, scores and the active tab alike: Kino was just as bland as it was unintuitive. The group's night was a single list row with a generic icon; Home opened on “Worth watching” and “Make Kino yours”, with just one friend's post below.",
          },
          {
            label: "Where it started",
            text: "The founder built V0 and began the real app at the end of September 2026, and it took the name Kino on Oct 1.",
          },
          {
            label: "The brief",
            text: "The founder asked me for a redesign, with the brief focused on making Kino more fun, user-friendly and elevated.",
          },
          {
            label: "The approach",
            text: "I made rapid decisions before committing to any changes: an experiment or workshop always happened beforehand, followed by stress-testing. Every decision was archived in a shared Figma file, then signalled for integration through a custom-coded dashboard.",
          },
        ],
      },
      {
        id: "language",
        chapter: "Pinpointing the principles.",
        label: "The language",
        headline: "People are the dots: I turned the signature of the wordmark into the whole language.",
        media: [
          {
            ratio: "1 / 1",
            video: "/work/kino/video/splash.mp4",
            webm: "/work/kino/video/splash.webm",
            poster: "/work/kino/video/splash-poster.jpg",
            still: "/work/kino/video/splash-still.jpg", // the crowd's dots round yours
            alt: "Kino opening on an iPhone in a dim room with posters: friends' colored dots gather around a Tomato dot, then the wordmark and Home",
          },
          {
            ratio: "1 / 1",
            // Round 2 (Noah, Oct 28: "the explosion is off center slightly"): the burst centered on the poster where it
            // comes to rest. Made by the Kino session.
            video: "/work/kino/video/its-settled-r2.mp4",
            webm: "/work/kino/video/its-settled-r2.webm",
            poster: "/work/kino/video/its-settled-r2-poster.jpg", // It's settled., with everyone's dots
            alt: "Locking the group's pick on an iPhone in a TV-lit room: It's settled. bursts, with each voter's dot on the poster's edge",
          },
        ],
        body: "A social app needs to show who did what, everywhere, without noise. So your dot is Tomato, every friend owns one identity color, and people show up as dots wherever they act together; everything else stays quiet.",
        more: [
          {
            label: "Where it came from",
            text: "Before I even touched a design, I was conceptualizing. On Oct 5, I immediately noticed the dot on the Kino wordmark, used to symbolize a camera. I began experimenting with different ways it could be pushed, and eventually landed on a color-coded friend network.",
          },
          {
            label: "Decision",
            text: "The Tomato dot is you, and nothing else: as a fill, Tomato is only for commit actions, at most one per screen. A group is a bundle of its members' dots, and votes are dots on a poster's edge.",
          },
          {
            label: "Even waiting",
            text: "Loading, offline and empty states keep the dots and the color: the splash gathering the dots on every open, loading dots never gray, and a hollow dot when you're offline, awaiting connection to commit your vote.",
          },
          {
            label: "In the films",
            text: "The splash gathers the crowd's dots around yours every time Kino opens; locking a pick for a movie night bursts with everyone's dots.",
          },
        ],
      },
      {
        id: "vote",
        label: "The vote",
        // Why it's here (Noah, Oct 27: "Why is this section important?"): the one place a rule of the language was decided
        // by trying it on a real vote
        // One example of the careful decisions behind the language (Noah, Oct 27: "we're going to have to do a stellar
        // job writing our header and contextual texts for this to make it make sense - as one example of the careful
        // decisions we made with this project")
        headline: "Small decisions were tested like big ones: no feature was unconsidered.",
        // The three placements as three phones side by side, each the live vote screen whole, with the signature dot
        // sliding under the one whose turn it is, as the flow tiles have it (Noah, Oct 28: "looks a little rough - can we
        // instead convert the style to the dot formatting for the other visuals? No need to blur or fade then"). It was
        // one sequenced film, its rounds 3 to 12 with pills, greying, a fade, then a blur; before that, three tiles.
        // Each loop is the whole 10.1 s cycle, its own beat in its slot (SLOTS 180 each at 60 fps after a 0.7 s lead, the
        // Kino session's numbers): your vote moves to The Odyssey and back. Made by the Kino session.
        turns: {
          color: "#CF421D",
          times: [
            [0.7, 3.7],
            [3.7, 6.7],
            [6.7, 9.7],
          ],
        },
        steps: [
          {
            title: "Under the poster",
            body: "Felt disconnected.",
            media: {
              ratio: "9 / 16",
              mov: "/work/kino/video/vote-tile-01-under.mov",
              webm: "/work/kino/video/vote-tile-01-under.webm",
              video: "/work/kino/video/vote-tile-01-under-preview.mp4",
              poster: "/work/kino/video/vote-tile-01-under-poster.webp",
              transparent: true,
              alt: "Thursday film club's vote on an iPhone, voters' dots under each poster; your vote moves to The Odyssey and back",
            },
          },
          {
            title: "On the poster",
            body: "Felt cluttered.",
            media: {
              ratio: "9 / 16",
              mov: "/work/kino/video/vote-tile-02-on.mov",
              webm: "/work/kino/video/vote-tile-02-on.webm",
              video: "/work/kino/video/vote-tile-02-on-preview.mp4",
              poster: "/work/kino/video/vote-tile-02-on-poster.webp",
              transparent: true,
              alt: "The same vote with voters' dots on each poster, over the art; your vote moves to The Odyssey and back",
            },
          },
          {
            title: "On the edge",
            body: "Touches the poster, never covers it.",
            media: {
              ratio: "9 / 16",
              mov: "/work/kino/video/vote-tile-03-edge.mov",
              webm: "/work/kino/video/vote-tile-03-edge.webm",
              video: "/work/kino/video/vote-tile-03-edge-preview.mp4",
              poster: "/work/kino/video/vote-tile-03-edge-poster.webp",
              transparent: true,
              alt: "The same vote with voters' dots on each poster's bottom edge; your vote moves to The Odyssey and back",
            },
          },
        ],
        body: "People are dots in Kino, so a vote is dots on posters, and they have to show who wants what without hiding the films. I tried three placements on a real vote: under the poster felt disconnected, on it felt cluttered. On the edge, the dots touch the poster and never cover it, so that's where they stayed.",
        more: [
          {
            label: "First idea",
            text: "It took much experimentation to finalize this screen alone. On Oct 7, I motioned toward integrating the dots into the voting system, and asked “What if dots cover the card they are voting for?”",
          },
          {
            label: "The test",
            text: "During a workshop on Oct 8, I put three different renditions of the voting prototypes side by side. I gained feedback, and took steps forward developing polished screens.",
          },
          {
            label: "My call",
            text: "The edge was the perfect middle ground: touching the poster ties each dot to its film, and staying off it keeps the film in view. Your own choice is the largest poster, and when the host locks the pick, It's settled. bursts from the poster's edges with everyone's dots, and Watch now follows.",
          },
        ],
      },
      {
        id: "web",
        label: "The web",
        // Why it's here (Noah, Oct 27: "lets really nail down why we're including this"): the web isn't a phone made wide
        headline: "The web isn't a stretched phone.",
        body: "The system I built runs both iOS and the web, but a cursor can do what a thumb can't. After experimenting with different web interactions, Explore became piles of movies that burst as you hover, and spread out when you click. Piles add intentional friction, introducing an exploratory, functional interaction to an otherwise stagnant grid system.",
        media: [
          {
            ratio: "16 / 9",
            // Round 5 (Noah, Oct 26: the cursor "doesn't fully align… change the cursor into the native macos one, in
            // white"; "One at a time"; Oct 27: none clips as it bursts, a bigger window, and the cards frosted by the
            // prototype's own header glass as they pass under the filters)
            video: "/work/kino/video/web-piles-r5.mp4",
            webm: "/work/kino/video/web-piles-r5.webm",
            poster: "/work/kino/video/web-piles-r5-poster.jpg",
            still: "/work/kino/video/web-piles-r5-still.jpg", // the piles at rest
            alt: "Explore on the web, in a browser window over a blurred room: piles of posters burst under the cursor, and one opens into a grid of films",
          },
        ],
        more: [
          {
            label: "The web's own",
            text: "The phone has no piles: Explore on the web is built for a cursor, from the same cards, dots and type as the rest of Kino.",
          },
          {
            label: "The piles",
            text: "Up to seven solid cards in a pile, representing a category; click one, and Kino deals them into a grid of the films within the category.",
          },
        ],
      },
      {
        id: "flows",
        label: "The rest of Kino",
        headline: "Every initial feature has a place in the new system.",
        // The full screens in the hero's black iPhone, uncropped, transparent, playing one at a time (Noah, Oct 27: "A,
        // one at a time, but why not just use the full screens, on the iphones"), in 9 / 16 tiles tight to the phones, so
        // they stand bigger and close together ("the phone could be a little closer to eachother", then "still closer"),
        // and the key moments slower ("The interactions happen a little too fast"). Each loop is the whole 31.1 s cycle, its
        // own beat in its slot, so the four keep step when they start together. Round 5: no black sections ("a section
        // here is still black"); round 6: no fade on the phones waiting, the dot below shows whose turn it is; round 7: the
        // status bar floats over the page, so what scrolls passes under the time instead of being cut flat ("theres a bar
        // of black at the top of the screen, which cuts off the ui whenever it scrolls"); round 8: no soft edge under the time
        // at all, and Profile rests with Edit profile off the top ("the black bar cuts some ui off, and is a
        // distraction"); round 9: every head-to-head picks, as Rank's always did, in Onboarding and Taste match too
        // (Noah, Nov 1: "only the second phone has an animation for cards getting picked - the rest just sift through
        // ... adding a subtle choose animation to each screen whenever a head-to-head occurs"): the chosen poster steps
        // forward, the other dims and steps back, the next pair 270ms later, each phone's slot unchanged. Made by the
        // Kino session.
        // The fade on the phones waiting their turn "is not working" (Noah, Oct 27): "Instead, why don't we just have the
        // signature dot at the very bottom of the screen, and it just kind of slides". Kino's Tomato, as on white (the
        // fill, tomato-600); the turns from the render's own slots (SLOTS 540, 468, 480, 312 frames at 60 fps after a 0.7 s
        // lead, the Kino session's numbers).
        turns: {
          color: "#CF421D",
          times: [
            [0.7, 9.7],
            [9.7, 17.5],
            [17.5, 25.5],
            [25.5, 30.7],
          ],
        },
        steps: [
          {
            title: "Onboarding",
            body: "Taste first.",
            media: {
              ratio: "9 / 16",
              mov: "/work/kino/video/flow-phone-01-onboarding-r9.mov",
              webm: "/work/kino/video/flow-phone-01-onboarding-r9.webm",
              video: "/work/kino/video/flow-phone-01-onboarding-r9-preview.mp4",
              poster: "/work/kino/video/flow-phone-01-onboarding-r9-poster.webp",
              transparent: true,
              alt: "Kino's taste-first onboarding on an iPhone: tap the films you've seen, three head-to-heads, then your top 3",
            },
          },
          {
            title: "Rank a film",
            body: "You decide how it made you feel, then head-to-heads place it.",
            media: {
              ratio: "9 / 16",
              mov: "/work/kino/video/flow-phone-02-rank-r9.mov",
              webm: "/work/kino/video/flow-phone-02-rank-r9.webm",
              video: "/work/kino/video/flow-phone-02-rank-r9-preview.mp4",
              poster: "/work/kino/video/flow-phone-02-rank-r9-poster.webp",
              transparent: true,
              alt: "Ranking Interstellar on an iPhone: Loved it, three head-to-heads, then it's your #1 at 9.7",
            },
          },
          {
            title: "Taste match",
            body: "A big percentage between you and a friend sparks conversation.",
            media: {
              ratio: "9 / 16",
              mov: "/work/kino/video/flow-phone-03-match-r9.mov",
              webm: "/work/kino/video/flow-phone-03-match-r9.webm",
              video: "/work/kino/video/flow-phone-03-match-r9-preview.mp4",
              poster: "/work/kino/video/flow-phone-03-match-r9-poster.webp",
              transparent: true,
              alt: "Maya's invite on an iPhone: three of her favorites, then your match counts up to 86%",
            },
          },
          {
            title: "Your profile",
            body: "Your top 3 as big numerals, immediately scannable.",
            media: {
              ratio: "9 / 16",
              mov: "/work/kino/video/flow-phone-04-profile-r9.mov",
              webm: "/work/kino/video/flow-phone-04-profile-r9.webm",
              video: "/work/kino/video/flow-phone-04-profile-r9-preview.mp4",
              poster: "/work/kino/video/flow-phone-04-profile-r9-poster.webp",
              transparent: true,
              alt: "Your profile on an iPhone, scrolling down to your top 3",
            },
          },
        ],
        body: "On Oct 10, I workshopped all 60 of the original's features, mapping them against the new Kino; on Oct 11 the list closed with nothing left to design. Four of them make one path, from joining to your profile, each interaction playing in turn.",
        more: [
          {
            label: "Saying no",
            text: "Six explorations for shelves, all cut: spines, a stack, a mosaic, a diary timeline, a taste map and year shelves. Anything that wasn't a blend of intentional and functional was cut.",
          },
          {
            label: "The podium",
            text: "The first pass's podium became the big top 3 numerals. Multiple iterations were made to ensure Kino's top 3 podium didn't feel basic or recycled.",
          },
        ],
      },
      {
        id: "process",
        chapter: "The workflow.",
        label: "How we worked",
        headline: "Prototypes were key: real code, branches and links.",
        media: [
          {
            ratio: "16 / 9",
            // Round 5 (Noah, Oct 26: "could we have the transformation from the change animated, instead of just faded in
            // and out?"; Oct 27: subtler bounces, no fades on what moves, more time between the stages, lighter shadows,
            // its cards' copy "a little more professional", and the note about the rail in Noah's words: "Lets integrate a left
            // rail navigation instead, for functionality"):
            // the top bar lifts away piece by piece, the page's pieces move and resize, the rail slides in
            mov: "/work/kino/video/one-change-r6.mov",
            webm: "/work/kino/video/one-change-r6.webm",
            video: "/work/kino/video/one-change-r6-preview.mp4",
            poster: "/work/kino/video/one-change-r6-poster.webp",
            still: "/work/kino/video/one-change-r6-still.webp", // the page after the change
            transparent: true,
            alt: "One change, start to finish: V.2's web Home and my note on it; its top bar lifts away piece by piece, the page's pieces move and resize into V.2.3's places, and the left rail slides in; then Live on the prototype, and the founder porting it to the live app",
          },
        ],
        body: "Every round of feedback ran through review pages I hosted, and passed rounds went straight to a live link: public from Oct 8, and published 21 times in four days. The founder audited the real app against specific prototype commits and closed the gaps. I'm happy to share that all of my designs were integrated and committed.",
        more: [
          {
            label: "Crits",
            text: "26 documented rounds of workshops, 2 surveys and 24 feedback sessions, each saved word for word on the custom dashboard: about 13,000 words of my notes exist, all targeted toward making Kino better.",
          },
          {
            label: "The live link",
            text: "Each publish came with a README file for review and notes for the developer, alongside handoff files that were regularly updated, offering context for separate sessions.",
          },
          {
            label: "The archive",
            text: "Figma was our library: 120 variables in four collections, 14 text styles, a components library, 22 flows and 14 animated moments, each color named the same as in code.",
          },
          {
            label: "Where AI fit",
            text: "Rapid prototyping and iteration were done with the help of Claude Code, the dashboard was hosted locally, and Figma's MCP put the system into Figma when it was ready to share with the iOS developer. I set the direction, critiqued every pass and made every call; when passes had the right concepts but poor execution, they were rebuilt.",
          },
          {
            label: "In the film",
            // Git dates it: the rail published at 9:20 PM on Oct 8, then ?nav=top for the top-bar version at 9:33 PM
            text: "One change, start to finish: the top bar giving way to a left rail, then the founder porting it to the live app. The rail went live at 9:20 PM on Oct 8, with the top bar kept one link away, so we could A/B test both on the same Home within the team. The rail won.",
          },
        ],
      },
      {
        id: "real-app",
        chapter: "Delivering.",
        label: "The real app",
        // The drift and its fix, from the foundations up (Noah, Oct 27: "every section has to earn its place"; then "A - so
        // good. Re-visiting how we started from the foundations, redesigning the system and atoms that build up the pages
        // from the core"). Made by the Kino session from the app review's real frames (Oct 13).
        headline: "The live app had over 80 control looks, so I locked them down to just a few.",
        media: [
          {
            ratio: "16 / 9",
            video: "/work/kino/video/realapp-atoms-r4.mp4",
            webm: "/work/kino/video/realapp-atoms-r4.webm",
            poster: "/work/kino/video/realapp-atoms-r4-poster.jpg",
            still: "/work/kino/video/realapp-atoms-r4-still.jpg", // the five rebuilt pages
            // Round 3 (Noah, Oct 27: "one more iteration of the pills evolving, starting from V0, to the inital, to the
            // current"; the captions "Before my designs", "Prototyping", "Finalized"; the screens' shapes shown by the
            // background turning white, not by grey outlines)
            alt: "Kino's controls before my designs, while prototyping, and finalized; then the background turns white and five rebuilt pages fill in their dark screen shapes",
          },
        ],
        body: "Before me, 65 of Kino's 170 buttons set their own sizes. So I started where the system does: the controls first, just one set of them. I then built the pages from them, from the navigation around every screen to entire user flows. 21 commits in one day, reviewed by the team and greenlit.",
        more: [
          {
            label: "What else",
            text: "Paging jumped to the top and its buttons weren't Kino's; share and settings didn't line up; pages rubber-banded past their edges. The branch fixed those too, and the changes were applied to every flow.",
          },
          {
            label: "Result",
            text: "128 files, with 2,058 lines added and 1,273 removed, 126 unit tests passing, and before/after frames for 13 screens.",
          },
        ],
      },
    ],
    lessons: [
      // Noah's rules (Oct 28); the reasoning behind each is the page's own, in their voice ("fill in with my tone of
      // voice, and reasoning we've stated, concisely")
      {
        rule: "Start with the atoms.",
        body: "Kino had over 80 control looks because every screen made its own. Once the atoms were one set, every page built from them came out consistent, on iOS and the web alike.",
      },
      {
        rule: "Aligning designs with the product is key.",
        body: "A design only counts once it's in the live app. Prototyping in real code let the founder audit the app against exact commits and close the gaps, and my own branch closed the rest.",
      },
    ],
    credits: {
      // Short items for the closing panel; the detail lives in the sections' Read more and the steps below
      owned: [
        "The direction and design language",
        "The design system, iOS and web",
        "The coded prototype engineering built from",
        "The Figma library",
        "The custom workshop dashboard",
        "Branch pushes into the live app",
      ],
      contributed: ["Bug fixes, through branch pushes", "Reviews of every version"],
      // A caption for each stage instead of its date (Noah, Oct 28: "cut all the dates, replace with a timeline caption
      // instead"), ending on greenlit
      process: [
        { step: "Surveys", body: "Two surveys settled the feel, color, type and the dot before any screen." },
        { step: "Versions", body: "Seven versions, V.1 to V.2.3, each critiqued in writing and frozen as it passed." },
        { step: "The prototype", body: "The coded prototype went public: 21 publishes in four days." },
        { step: "The port", body: "The founder ported it into the live app: the V.2.1 system first, then V.2.3 parity." },
        { step: "My branch", body: "21 commits on my branch of the live app, reviewed and greenlit." },
      ],
    },
    footnote: [
      "Built with Jason Zhang and Michael Kolkov. Laptop mockup: ",
      { text: "Good Mockups", href: "https://goodmockups.com" },
      ". The iPhone frames are from ",
      { text: "Apple Design Resources", href: "https://developer.apple.com/design/resources/" },
      ", whose license allows them only in mockups of apps for Apple platforms; here they hold only Kino's iOS app. The rooms behind the motion were generated with Figma AI and are used only blurred and dimmed. Posters belong to their studios, shown for a non-commercial design study.",
    ],
  },
  // Gouache, after Kino (Noah, Nov 18; first placed after Palit, Nov 16: "After Palit"). Written from case-studies/gouache.md, whose source is the
  // project's own folder (newer projects/AI agents designathon/); every fact as written there. Its visuals are made in
  // case-studies/gouache-workshop/. Live since Nov 19 (Noah, Nov 19: "Push live with Gouache"); until then a production
  // guard kept it on the local dev server only.
  ...([
        {
          slug: "gouache",
          title: "Gouache",
          summary: "A rail that paints AI agents' work onto your page.",
          shape: "designathon",
          discipline: "Product designer, designathon",
          year: "2026",
          card: "16 / 9",
          cover: {
            ratio: "16 / 9",
            // The MacBook (Noah, Nov 18: "Why aren't we shipping the MacBook mockup version? I thought that's the one we were going
            // to use for the hero card"; Nov 18: "we place the centered side rail inside the macbook mockup, and move the macbook
            // mockup as it takes full screen - keeping the side rail locked in the middle"; "zoom in a little more ... crop the mack
            // book where appropriate from the button"): the rail stays at the frame's center inside the MacBook's screen, beside
            // Juniper with its agents drawing their rings; as it opens into the full-screen dashboard the laptop moves around it.
            // Round 4 (Noah, Nov 19: "I would like for the Mac mockup to show the bottom of its model more, maybe just slightly
            // zoomed out"): about an eighth smaller, with the base and its feet in view; round 3 is kept in superseded/hero-mac-r3.*.
            // Round 5 (Noah, Nov 19: "It doesn't fit the entire screen, and I'd like it to"): the screen fills the whole display,
            // edge to edge, with the camera in its notch (laptop/scenes/hero-mac3.html); round 4 is kept in superseded/hero-mac-r4.*.
            // The rail-and-dashboard version is kept in case-studies/gouache-workshop/superseded/hero-r8.*. 21.5 s
            video: "/work/gouache/video/v2-hero.mp4",
            webm: "/work/gouache/video/v2-hero.webm",
            poster: "/work/gouache/video/v2-hero-poster.jpg",
            alt: "A MacBook running Gouache: the dashboard, every job as watercolor paint in pencil loops by agent, folds into the side rail, which stays centered while the laptop slides to show Juniper beside it, its agents drawing pencil rings on the parts they're changing; then the rail opens back into the full-screen dashboard",
          },
          slate: [
            { label: "Role", value: "Product designer" }, // Noah, Nov 16
            { label: "Team", value: "Two product designers (Kaya Sasaki and me)" }, // Noah, Nov 16: Kaya as co-designer of the concept
            { label: "Timeline", value: "Q4 2026" },
            { label: "Context", value: "Fig Make-a-thon, Track 1" },
          ],
          impact: {
            headline: "Kaya and I designed Gouache in five days: it paints each AI agent's work onto your page.",
            context:
              "The Fig Make-a-thon's Track 1 asked how people can understand, monitor and trust AI that works on its own. Our answer is a browser rail and plugin for designers, juniors most of all, that makes agents visible, legible and collaborative, in paint and pencil on the page you're designing.",
            proof: ["An 8:59 film of the working prototypes, voiced by me", "198 decisions, each dated, in our own words"],
          },
          story: [
            {
              id: "problem",
              label: "The problem",
              headline: "Designers now build with agents, but the agents work out of sight.",
              // Round 3 (Noah's note, Nov 17): the laptop still, on white, no camera moves. An unbranded agent app takes an ask and works
              // silently; three fingers up to the spread of windows; in the browser Juniper changes with no signal; back to the agent. Round 5
              // (Noah, Nov 17): no swipe; the browser overlapped, barely peeking out; the agent a black box you can't match to the
              // page. 19.1 s
              media: [
                {
                  ratio: "16 / 9",
                  video: "/work/gouache/video/v2-s1-problem.mp4",
                  webm: "/work/gouache/video/v2-s1-problem.webm",
                  poster: "/work/gouache/video/v2-s1-problem-poster.jpg",
                  alt: "A laptop on white: an agent app sits in front of a browser that barely peeks out behind it. The ask make the signup page friendlier is typed and sent; three helpers work under nothing but file names, then fold to 3 helpers, edited 7 files and Done, while in the sliver of page behind it the button, corners and cards change with nothing to match them to",
                },
              ],
              body: "An agent hands the job to helpers you never see and changes your page with no name on it. What it did is in a log written for developers, and people stop reading it.",
              more: [
                {
                  label: "Designers build",
                  text: "41% of designers take part in development, double the year before (Figma, 2026). Half have pushed AI-generated code to production (Designer Fund and Foundation Capital, 2026).",
                },
                {
                  label: "The log",
                  text: "A 2026 study took its title from a participant: “I'm Not Reading All of That.” In Anthropic's tests, a model's written reasoning mentioned the hint it actually used only 25% of the time.",
                },
                {
                  label: "People still watch",
                  text: "63% of technologists rarely or never let agents run on autopilot (Stack Overflow, 2026). But on the page, there's nothing to see.",
                },
              ],
            },
            {
              id: "first-takes",
              chapter: "[Your header: where we started]",
              label: "First takes",
              headline: "We first imagined a visualizer that only watched, before moving beside the page itself.",
              // Round 3 (Noah, Nov 17: "can we just animate a short reel with annotations of different things we tried? Can be lofi and
              // hyperbolated, and simple representations"; "with of course, the captions very concisely explaining why they didnt work"). Round 4
              // (Noah, Nov 17: "I don't want this to look generated ... No crossouts"): redrawn with care, each take fading to gray as its
              // reason comes in on its own line. 16.2 s
              media: [
                {
                  ratio: "16 / 9",
                  video: "/work/gouache/video/v2-s2-first-takes.mp4",
                  webm: "/work/gouache/video/v2-s2-first-takes.webm",
                  poster: "/work/gouache/video/v2-s2-first-takes-poster.jpg",
                  alt: "Clean line drawings of Gouache's first takes, each fading to gray as its reason appears: a visualizer that could only watch, a dashboard of its own away from the work, a rewrite behind your words that changed as you typed; then the rail beside the page, chosen",
                },
              ],
              body: "Our first answer was a visualizer that only watched and answered. On Nov 9 it moved beside the page itself, called from the agent you already use, and the rewrite of your ask moved from behind your typing to when you're ready to send.",
              more: [
                {
                  label: "The turn",
                  text: "“We're making basically Rivet for AI agents. It's browser native. It runs on any agent you might have it plugged into as a command.” (Kaya and me, Nov 9)",
                },
                {
                  label: "What stayed",
                  text: "Gouache can still approve what an agent is waiting on, while risky technical requests go back to the agent's own tool.",
                },
              ],
            },
            {
              id: "ones-who-look",
              chapter: "[Your header: the ones who look]",
              label: "The ones who look",
              headline: "Juniors look rather than read, so Gouache rewrites their ask in design words, in plain sight.",
              // Round 3 (Noah, Nov 17: buttery smooth; underlines fade in with the words; Claude's orange the whole way; the other
              // words only lightly blurred): a close-up of the real rail on white, 16 / 9. Round 4 (Noah, Nov 17: "Why does the chatbox
              // shift in a weird way when the line breaks? Make that much smoother"): the field grows a line in one eased move before
              // the next word, and the welcome above it holds still. Round 5 (Noah, Nov 17): the pointer at its true size; the click
              // lands, then the ask is typed a beat later in quick chunks, with one small typo fixed. 20.5 s
              media: [
                {
                  ratio: "16 / 9",
                  video: "/work/gouache/video/v2-s3-ask.mp4",
                  webm: "/work/gouache/video/v2-s3-ask.webm",
                  poster: "/work/gouache/video/v2-s3-ask-poster.jpg",
                  alt: "Close on Gouache's rail in Claude's orange: an ask typed after @Claude is rewritten in place into design words, each new one underlined as it fades in; pointing at corner radius opens its meaning while the other words soften, and the ask is sent",
                },
              ],
              body: "One of us reads every reply; the other only watches the page. Beginners are the second kind, and they don't have the design words yet. So Enter rewrites your ask with the new words underlined, each one's meaning a hover away, and you send it yourself.",
              more: [
                {
                  label: "Why juniors",
                  text: "Jobs for 22 to 25 year olds in AI-exposed work sit 19% below trend (Stanford, 2026), and 73% of hiring managers want AI tool skills (Figma, 2026).",
                },
                {
                  label: "The words",
                  text: "Fewer than one in five people write well enough to prompt, by Jakob Nielsen's estimate, and silent rewrites can undo the gains (Jahani et al., 2026). So ours happens in plain sight, and it can be switched off.",
                },
                {
                  label: "Asking why",
                  text: "Mostly junior engineers coding with AI scored 50% against 67% by hand; those who asked conceptual questions kept 65% or more (Anthropic, 2026). So every new design word opens its meaning.",
                },
                { label: "Tried first", text: "A fuller prompt that grew behind your words as you typed. It moved to after you're ready to send." },
              ],
            },
            {
              id: "tried",
              chapter: "[Your header: how do you draw an agent]",
              label: "What we tried",
              headline: "We drew agents as heat, pebbles and ink before we found paint.",
              // Round 3 (Noah, Nov 17: "short reel that shows the evolution of our dot, simply, with very concise annotations"). Round 4 (Noah,
              // Nov 17): no crossouts; each try fades to gray, then its reason comes in on its own line; the dots varied and spaced out;
              // the pebbles flat, with no shadows or light. Round 5 (Noah, Nov 17: "Maybe we just take a snapshot of stills of each thing we
              // tried and then just fade in and out of them. Maybe pastel and pencil is one of the only ones that's animated"): real 2x
              // captures of the project's sketches, a word or two each; only pastel and pencil moves. Round 7 (Noah, Nov 18: "lets just
              // show the specimens of what we tried, no the desktop view"): the specimens alone, with only color and state labels. 23.9 s
              media: [
                {
                  ratio: "16 / 9",
                  video: "/work/gouache/video/v2-s4-dot.mp4",
                  webm: "/work/gouache/video/v2-s4-dot.webm",
                  poster: "/work/gouache/video/v2-s4-dot-poster.jpg",
                  alt: "Each try's specimen alone on white, one at a time, named above it: blobs of light, a heat map, dots, pebbles in each state, ink on paper in each agent's color, and realistic watercolor in each state; then pastel and pencil, the one that moves, a soft droplet with a pencil ring drawing round it",
                },
              ],
              body: "Heat maps of who worked where came first, then dots, pebbles and ink on paper. The heat maps painted over the designer's own work, so the first rule became: nothing covers your page.",
              more: [
                {
                  label: "Rule one",
                  text: "Nothing covers your page. Paint sits at the corner of the part being changed, with a light pencil line round it while it changes.",
                },
                { label: "Analog", text: "The pebbles had a lit, 3D look. I wanted them analog and tactile, like the rest of the brand." },
              ],
            },
            {
              id: "representational",
              label: "The paint",
              headline: "Watercolor got so real it looked like blood, so I pulled it back to pastel and pencil.",
              media: [
                {
                  ratio: "16 / 9",
                  video: "/work/gouache/video/v2-s5-paint.mp4",
                  webm: "/work/gouache/video/v2-s5-paint.webm",
                  poster: "/work/gouache/video/v2-s5-paint-poster.jpg",
                  alt: "Two watercolor marks side by side and still: on the left a realistic orange splotch with a rough edge and flung drops, on the right a soft blue droplet; a pencil ring draws around each, with a pencil arrow from the old to the new",
                },
              ],
              body: "The paint is simulated, not drawn: pigment drifts in wet paper, gathers at the edge and dries to a tide line. At full strength it read as blood. Thinner paint, kinder hues and a smooth outline keep the eye on the work, not the paint.",
              more: [
                {
                  label: "The simulator",
                  text: "The paper is a grid. Pigment afloat follows slow currents and never enters dry paper, so it piles up at a wash's edge as it dries, and two agents' colors mix the way real washes do.",
                },
                { label: "Why pull back", text: "Too real distracted from what juniors came to see: which agent is changing which part of their page." },
              ],
            },
            {
              id: "states",
              label: "Wet and dry",
              headline: "A droplet's life is the whole state system: working, waiting on you, then dry.",
              media: [
                {
                  ratio: "16 / 9",
                  video: "/work/gouache/video/v2-s6-states.mp4",
                  webm: "/work/gouache/video/v2-s6-states.webm",
                  poster: "/work/gouache/video/v2-s6-states-poster.jpg",
                  alt: "One watercolor droplet arrives; color drifts inside it as a pencil ring draws around it, the ring turns amber and waits, then closes in red as the paint dries and fades, with a line under it for each state",
                },
              ],
              body: "Color drifts inside while an agent works, and a pencil ring fills as the work goes. When it needs you, the ring turns amber. When it's done, the paint dries to its tide line and the ring closes in the agent's own color.",
              more: [
                { label: "A ring each", text: "Each helper gets its own ring, not a line joining them, because the work doesn't happen in a line." },
                { label: "Amber", text: "Amber is only ever for waiting on you." },
                { label: "Agents don't travel", text: "They drop onto what they're working on and dry where they are." },
              ],
            },
            {
              id: "colors",
              label: "Colors",
              headline: "Every agent arrives in Gouache's purple, then takes its own colors, and they mix where they meet.",
              media: [
                {
                  ratio: "16 / 9",
                  video: "/work/gouache/video/v2-s7-colors.mp4",
                  webm: "/work/gouache/video/v2-s7-colors.webm",
                  poster: "/work/gouache/video/v2-s7-colors-poster.jpg",
                  alt: "One orange watercolor droplet, close up and working; a blue droplet arrives beside it, and their wet paint runs together where they meet, then both fade",
                },
              ],
              body: "Claude paints in reds and oranges, Codex in blues, Gemini in greens and Cursor in teals, so you always know whose paint it is. A new model joins with one command and arrives in our lilac before it takes its own.",
              more: [
                {
                  label: "Open to any agent",
                  text: "/gouache in Claude Code, @gouache in Codex or other tools. Onboarding happens with that command, for the agent as much as for you.",
                },
                { label: "Within a family", text: "Each agent's three hues differ in lightness, so its helpers can be told apart too." },
              ],
            },
            {
              id: "dashboard",
              label: "The dashboard",
              headline: "The dashboard took 60 versions to stop reading like a log and become a picture.",
              media: [
                {
                  ratio: "16 / 9",
                  // Round 3 (Noah, Nov 17: "one screen at a time, in desktop view, blank background, version numbers at top"): the real v1,
                  // v3, v4 and v23, each in a browser window on white with its number above, dipping from one to the next; on v23,
                  // pointing at Codex's bundle fades the rest back. Round 4 (Noah, Nov 17): v23 is titled "final". Round 5: v1 drawn as a
                  // lo-fi mockup ("more so like a prototype or something that's a very lo-fi mockup"). 15.8 s
                  video: "/work/gouache/video/v2-s8-versions.mp4",
                  webm: "/work/gouache/video/v2-s8-versions.webm",
                  poster: "/work/gouache/video/v2-s8-versions-poster.jpg",
                  alt: "Gouache's dashboard in a browser window, one version at a time, v1, v3, v4 and the final one, from columns of text to a canvas of watercolor paint, where pointing at Codex's bundle fades every other agent back",
                },
              ],
              body: "Three columns of text read like another LLM tool, and your page drawn large in the middle was redundant. On the open canvas every job is paint, grouped by agent: look at one and the rest blur but keep running.",
              more: [
                {
                  label: "Focus plus context",
                  text: "The way you hold one thought with others at the back of your mind, after George Furnas's fisheye views (1986).",
                },
                { label: "The technical view", text: "One switch shows every agent's thinking in its own words, for when you want to read." },
              ],
            },
            {
              id: "product",
              chapter: "[Your header: what it does]",
              label: "On your page",
              headline: "Gouache lives in the browser beside your page, and the work shows up as paint.",
              media: [
                // v2 (Nov 17): the working prototypes at 2x: the whole laptop (Good Mockups render) with all three agents at work, then the
                // dashboard and its technical view front-on, all 16 / 9 (case-studies/gouache-workshop/v2/laptop)
                {
                  ratio: "16 / 9",
                  src: "/work/gouache/v2-product-page",
                  widths: [1600, 3200],
                  transparent: true, // Round 3 (Noah, Nov 17): no background
                  alt: "A laptop running Juniper with Gouache's rail open and Claude, Codex and Gemini at work: a droplet and a pencil line at each part they're changing (the headline, the Reminders card, the button), and the rail's bundles, rings and notes",
                },
                {
                  ratio: "16 / 9",
                  // Round 4 (Noah, Nov 17: "maybe an animation with them quietly working"): the dashboard in its browser window on
                  // white, its droplets moving and its loops breathing on the product's own beat, Codex waiting on you. 10.8 s
                  video: "/work/gouache/video/v2-s9-dashboard.mp4",
                  webm: "/work/gouache/video/v2-s9-dashboard.webm",
                  poster: "/work/gouache/video/v2-s9-dashboard-poster.jpg",
                  alt: "Gouache's dashboard in a browser window, quietly working: every job as watercolor paint on an open canvas, grouped in pencil loops by agent, with a small drawing of Juniper in the corner",
                },
                {
                  ratio: "16 / 9",
                  // Round 4 (Noah, Nov 17: "maybe just a loop of the agents working? Then restarting. Thats it"): the technical view
                  // in its browser window on white, Claude's and Gemini's words coming in a line at a time, then starting over. 14.8 s
                  video: "/work/gouache/video/v2-s9-technical.mp4",
                  webm: "/work/gouache/video/v2-s9-technical.webm",
                  poster: "/work/gouache/video/v2-s9-technical-poster.jpg",
                  alt: "Gouache's technical view in a browser window: four columns, one per agent, with Claude's and Gemini's thinking coming in a line at a time",
                },
              ],
              body: "It's a tool and a plugin, with no new app. A droplet waits in the corner of your page; open it and the rail slides in. Each agent's paint appears on the part it's changing, and the dashboard shows every job at once.",
              more: [
                {
                  label: "Nothing covers your page",
                  text: "Paint sits at the corners. Notes are pencil, one line, and blur everything else only when you open one.",
                },
                { label: "Quiet type", text: "Figtree throughout, in three sizes (11, 13 and 15) and three tones." },
                {
                  label: "Juniper",
                  text: "The page the agents work on is a made-up habit tracker, kept quiet so the paint is the most colorful thing on screen.",
                },
              ],
            },
            {
              id: "journey",
              label: "User journey",
              headline: "Call it, watch it work, answer it, and see what changed.",
              // Round 6 (Noah, Nov 18: "I think this visualization could just be a long video with a caption at the top or the bottom,
              // subtly just flipping through call it, watch, answer, and then seeing what changed"; this replaces the four tiles
              // taking turns): one take of the real rail and page on white, the camera moving calmly from step to step, with a small
              // Geist caption below naming each one (Call it, Watch, Answer, What changed). 35.3 s
              media: [
                {
                  ratio: "16 / 9",
                  video: "/work/gouache/video/v2-s10-journey.mp4",
                  webm: "/work/gouache/video/v2-s10-journey.webm",
                  poster: "/work/gouache/video/v2-s10-journey-poster.jpg",
                  alt: "One take of Gouache at work, captioned step by step: Call it, /gouache is typed and the rail opens; Watch, Claude's droplet lands at the headline's corner inside a pencil box as the headline changes; Answer, soften the form is asked, the helper asks to round the form's corners to 14px, and the check is pressed; What changed, a dried droplet opens what it set, Undo is pressed, and its paint fades away",
                },
              ],
              body: "Type /gouache where your agent lives, and a rail slides in beside your page. You ask with an @, watch each helper's paint land on its part, answer with a check or an X, and undo any change in one click.",
              more: [{ label: "Like a notification", text: "Your ask goes up like a notification: heard, then working, then done." }],
            },
            {
              id: "gap",
              label: "The gap",
              headline: "Nothing showed which agent changed what, on your own page.",
              media: [
                {
                  ratio: "16 / 9",
                  // v2 (Nov 17): pencil axes and the tools as pills; then Gouache's own droplet, at the size the rail draws it, arrives
                  // in the empty corner inside a pencil ring (no splatter: Noah, Nov 17). Words in a visual, as pills: waiting on Noah's OK. 14.8 s
                  video: "/work/gouache/video/v2-s11-gap.mp4",
                  webm: "/work/gouache/video/v2-s11-gap.webm",
                  poster: "/work/gouache/video/v2-s11-gap-poster.jpg",
                  alt: "A pencil map of agent tools by audience and place; every tool sits on the developers' side or in another window, while Gouache's small lilac droplet arrives alone at the far top right, on your page, for designers, inside a pencil ring",
                },
              ],
              body: "Agent dashboards are lists and logs for developers, in another window. Codex Pets shows one agent, Cursor's Design Mode tells the agent where to go, and a cursor is gone when it's done. Gouache sits in the empty corner.",
              more: [
                { label: "Dashboards", text: "GitHub names the problem itself: “more context-switching, more babysitting.”" },
                { label: "Our judgment", text: "Where each tool sits on the map is our own reading of it." },
                {
                  label: "Next",
                  text: "More places to see agents, like the Figma canvas. One rule stays: nothing covers your page, and you can always see who did what.",
                },
              ],
            },
          ],
          // Noah's rules, in their words [?]
          lessons: [
            { rule: "[Your first rule]", body: "[Where it came from, in a sentence.]" },
            { rule: "[Your second rule]", body: "[Where it came from, in a sentence.]" },
          ],
          credits: {
            // Noah, Nov 16: "I did all of the visual work, Kaya was moreso a voice of reason"
            owned: ["The visual language", "The simulated watercolor paint", "The sidebar and dashboard prototypes", "The film, animated and voiced"],
            contributed: ["The concept and framing, with Kaya"],
            process: [
              { step: "The brief", body: "A brainstorm, then a new direction: a rail beside your page, called from your agent." },
              { step: "The paint", body: "Heat maps, pebbles and ink, then simulated watercolor, pulled back to pastel and pencil." },
              { step: "The prototypes", body: "The sidebar and the dashboard, rebuilt on one design system, version after version." },
              { step: "The film", body: "Every section a scene, filmed from the working prototypes and voiced by me." },
            ],
          },
          footnote: [
            "Made with Kaya Sasaki, who shaped the concept and framing with me. Gouache is a concept: its paint and screens are working prototypes, filmed and captured for this page. Focus plus context after George W. Furnas, ",
            { text: "Generalized Fisheye Views", href: "https://cspages.ucalgary.ca/~saul/581/exer.eps/4furnas86.pdf" },
            " (1986). Laptop mockup: Good Mockups.",
          ],
        },
      ] satisfies Project[]),
  {
    // Written from the BoomLoom copy and Noah's answers; every fact as written there. [?] is still open.
    slug: "boom-loom-looms",
    title: "BoomLoom Looms",
    summary: "Analog product design for a small art-tool company.",
    shape: "product",
    discipline: "Packaging + visual designer, product strategy", // the card's line, Noah's words (Oct 29)
    year: "2026",
    card: "12 / 7",
    cover: {
      ratio: "16 / 9",
      video: `${BOOMLOOM}/video/1-splash.mp4`,
      webm: `${BOOMLOOM}/video/1-splash.webm`,
      poster: `${BOOMLOOM}/video/1-splash-poster.jpg`,
      still: `${BOOMLOOM}/video/1-splash-poster-end.jpg`, // the card at rest
      once: true, // Noah: plays from the start each time the card comes into view, then stays on the card
      alt: "The BoomLoom wordmark as a fine outline over the lines it was built on, then filled white on Signature Blue",
    },
    slate: [
      { label: "Role", value: "Visual and packaging designer" },
      { label: "Team", value: "Me and the founder" },
      { label: "Timeline", value: "Q2 – Q4 2026" },
      { label: "Shipped", value: "Logo suite, typeface, guidelines, packaging, product inserts, instruction manual, zine" },
    ],
    impact: {
      headline: "One system, used daily by the founder.",
      context:
        "BoomLoom is an art-tool company whose prized product, The Boss, is a handheld patternmaking loom. I built the company's first design system, then used it to design the moment a customer opens the box: the systems, flows and components I'd bring to a digital product, built in paper.",
      proof: [
        "28 pages of brand guidelines, shipped in two weeks",
        "Since the system shipped: affiliated with educators, the Brooklyn Public Library and other institutions. Currently in contact with the MoMA Design Store.",
      ],
      // The Overview was a text piece of its own, right under this one; it folded in here (Noah, Oct 26: never two
      // text sections together)
      more: [
        {
          label: "The Boss",
          text: "Turn the pattern bar and it lifts the threads for you, so techniques such as plain weave, twill, diamond, monk's belt and krokbragd come out of two simple pieces.",
        },
        {
          label: "Who it's for",
          text: "It's an artist's tool, not a craft toy: easy for beginners, deep enough for professional textile artists. This was a core principle in the design process.",
        },
      ],
    },
    story: [
      {
        id: "problem",
        chapter: "Before me, the brand was a .png", // the file's name, lowercase, its dot in front (Noah, Oct 28)
        label: "Problem",
        headline: "When I joined, there was no system: every project was a guessing game.",
        // The before board (#2), the real files placed as in the workshop's prototype; its still is 2-before-board
        interactive: {
          kind: "board",
          pieces: [
            {
              src: `${BOOMLOOM}/before/logo-before-wordmark.png`,
              size: [2000, 1000],
              crop: [58, 290, 1955, 766],
              at: [50, 194.25, 540, 135.5],
              tag: "A PNG, never vectorized",
              tagY: 452,
              title: "Wordmark",
              note: "Only ever a PNG, never vectorized. Up close, its curves are pixels.",
              loupe: [472, 522],
            },
            {
              src: `${BOOMLOOM}/before/logo-before-monogram.png`,
              size: [1350, 1350],
              crop: [196, 135, 1282, 1220],
              at: [822, 124.13, 276, 275.75],
              tag: "Doesn't match the wordmark",
              tagY: 452,
              title: "Monogram",
              note: "Four stripes to the wordmark's two: two different languages.",
            },
            {
              src: `${BOOMLOOM}/before/logo-before-illustration.png`,
              size: [996, 832],
              crop: [0, 42, 996, 771],
              at: [1410, 122.93, 380, 278.13],
              tag: "Outdated, with its own font",
              tagY: 452,
              title: "Illustrated logo",
              note: "A typeface of its own, unrelated to the wordmark.",
            },
            {
              src: `${BOOMLOOM}/before/card-maple-before.png`,
              size: [1159, 1500],
              at: [546.24, 560, 307.52, 398],
              page: true,
              tag: "Script type, hard to read",
              tagY: 990,
              title: "Maple loom card",
              note: "Script headings that are hard to read, and three typefaces on one card.",
            },
            {
              src: `${BOOMLOOM}/before/manual-before-p1.jpg`,
              size: [900, 1390],
              at: [1091.15, 560, 257.7, 398],
              page: true,
              tag: "Stapled, all typewriter type",
              tagY: 990,
              title: "Manual, page 1",
              note: "A printed, stapled PDF, all in typewriter type, so nothing leads.",
            },
          ],
          how: "hover over a piece or tap it to read what was wrong with it.",
        },
        // My role was a header-only piece of its own right after this one; it folded in here (Noah, Oct 26)
        body: "Nothing around the loom connected: the logo, packaging, merch and the product each pointed a different way, and the first five minutes with it weren't designed. Before anything, the founder and I pinpointed the principles of the brand, and I pushed a brand guideline and a typeface to lock in the language.",
        more: [
          {
            label: "The box",
            text: "A customer got a plain cardboard box, crumpled brown paper, the loom, and a manual printed from a PDF and stapled together.",
          },
          {
            label: "At fairs",
            text: "The founder had no consistent visual language to sell with, and the audience was simply “artists.”",
          },
          {
            label: "The system first",
            text: "A guideline and a typeface first meant BoomLoom would understand its own visual language before showing it to anyone else. Once the founder and I were on board, every piece after it started from the system instead of from scratch.",
          },
        ],
      },
      {
        id: "marks",
        chapter: "A system, for paper.",
        label: "Marks",
        headline: "I traced and vectorized the marks, and their shapes informed my next steps.",
        media: [
          {
            ratio: "16 / 9",
            // Round 9 (Noah, Oct 28: "not loving the lens' movement… Just on one example, instead of visiting two… a
            // little more eased in and eased out"): the lens traces one stretch of the L's curve, its centre on the
            // outline, easing in and out, and goes quicker; 15.2 s. Source: case-studies/boomloom-workshop/source/3-marks.
            video: `${BOOMLOOM}/video/3-marks-r9.mp4`,
            webm: `${BOOMLOOM}/video/3-marks-r9.webm`,
            poster: `${BOOMLOOM}/video/3-marks-r9-poster.jpg`,
            alt: "A round glass lens traces the curve of the bL brandmark's L, its pixels stepped along the edge; then the mark is redrawn as clean geometry on its construction rings, and four BoomLoom Display letters grow from its pieces",
          },
        ],
        body: "The wordmark and the “bL” brandmark only existed as raster images. I explored a dozen versions; the founder chose the direction, and I refined it into the final suite, every curve and counter on the same geometry.",
        more: [
          { label: "The suite", text: "Wordmark, brandmark, clear space and color versions." },
          {
            label: "In the film",
            text: "Looking closely at bL's PNG shows its pixels. I traced the mark and broke it apart into the pieces that build BoomLoom Display.",
          },
        ],
      },
      {
        id: "typeface",
        label: "BoomLoom Display",
        headline: "The letters existed nowhere else, so I built a typeface.",
        interactive: {
          kind: "glyphs",
          font: `${BOOMLOOM}/BoomLoomDisplay-Regular.otf`, // outlines simplified to the fewest nodes (Oct 24)
          construction: `${BOOMLOOM}/BoomLoomDisplay-construction.otf`, // the letters as first drawn, for the rings
          how: "pick a letter. In Outline, pull a point with the pen and let go; Fill shows the finished letter.",
        },
        body: "Before the typeface, the logo felt disconnected from everything around it. BoomLoom Display became the piece that made the rest of the language click: every chapter of the guidelines, and of the manual, opens with one of its letters. It's used across our projects and marketing, and has become a staple in the BoomLoom ecosystem.",
        more: [
          { label: "The face", text: "The 26 lowercase letters, drawn in Glyphs." },
          {
            label: "Its job",
            text: "A hero face for headlines, drop caps and section markers, paired with Neue Haas Grotesk for reading.",
          },
        ],
      },
      {
        id: "guidelines",
        label: "Guidelines",
        headline: "28 pages of guidelines as a design system.",
        media: [
          {
            ratio: "16 / 9",
            video: `${BOOMLOOM}/video/7-guidelines-reel.mp4`,
            webm: `${BOOMLOOM}/video/7-guidelines-reel.webm`,
            poster: `${BOOMLOOM}/video/7-guidelines-reel-poster.jpg`,
            alt: "All 28 pages of the brand guidelines in a grid, a row per chapter, the camera stopping on each chapter's opening page and on the pages that move",
          },
        ],
        body: "Color, type, lockups, pattern tiles and a page of common mistakes. The founder uses them day to day, and every piece that followed was built from them: the label, the paper, the cards, the manual and the zine. Projects on the horizon rely heavily on the guidelines.",
        more: [
          {
            label: "Wayfinding",
            text: "Each chapter opens with a letter from BoomLoom Display, so the typeface does the wayfinding. It's no longer just type.",
          },
          {
            label: "Foundations",
            text: "Four signature colors (Pink, Blue, Red and Green) and four neutrals; type roles and a 64/48/36/24 scale.",
          },
          {
            label: "Components",
            text: "Logo lockups and clear space, decorative pattern tiles built from the logo's shapes, a hand-drawn yarn line.",
          },
          { label: "Rules", text: "Placement, color pairings and a “common mistakes” page." },
          { label: "Timing", text: "The guidelines were shipped in two weeks. The impact lasts much longer." },
        ],
      },
      {
        id: "unboxing",
        chapter: "The user journey.",
        // The unboxing as a journey map (Noah, Oct 27: "lets re-introduce the user journey, with the mockups as context
        // for the map - I think the map we provide should be a little more elaborate than our first rendition"). It was
        // a flow picture, then pills over the tiles (Oct 26), then the tiles alone. Now each step's verb is over a pill
        // naming the piece, joined by chevrons and hairlines to its mockup; the wrap and the loom, where the colour is,
        // wear Signature Blue and Pink, as in the first map. A user flow chart was tried over it on Oct 27, then abandoned
        // (Noah: "let's just abandon this. Let's just keep the mockups with the very simple pills on top of them. We can
        // even just lose the arrows and the additionals"): now each verb and pill sits over its mockup, nothing else.
        // Then the pills went too (Noah, Oct 28: "Honestly, we could lose the pills"): the tiles alone, each with its
        // verb and line under it.
        label: "User journey",
        headline: "I mapped the unboxing as a flow, and gave every step one job.",
        steps: [
          {
            title: "Read",
            body: "A single label on a plain cardboard box: honest, affordable to print, in the brand's analog, hands-on voice.",
            media: still("box-label-1", [1600, 3200], {
              ratio: "4 / 3",
              alt: "A kraft mailer box with The Boss label, seen from three-quarters in hard sunlight",
            }),
          },
          {
            title: "Unfold",
            body: "The packaging paper takes the founder's “woven structure” request literally. Inspired by the woven pieces produced by The Boss.",
            media: still("5-unwrap", [1600, 3200], {
              ratio: "4 / 3",
              alt: "An open kraft mailer box seen from above, the loom wrapped inside in the blue BoomLoom packaging paper, one red row running across it",
            }),
          },
          {
            title: "Discover",
            body: "Insert cards: one template with variants, like a component with props.",
            media: still("10-discover", [1600, 2880], {
              ratio: "4 / 3",
              alt: "A hand holding the Pattern Picker insert card, with its QR code and link to the web tool, against a beige wall",
            }),
          },
          {
            title: "Learn",
            body: "The manual, rebuilt as a booklet in eight clear chapters.",
            media: still("9-learn", [1600, 2290], {
              ratio: "4 / 3",
              alt: "The manual lying open to its warping spread: “Warping your loom” and “The Pattern Bar,” with the founder's drawings",
            }),
          },
          {
            title: "Weave",
            body: "The paper system leads up to the product itself. The loom is the centerpiece.",
            media: still("6-meet-the-loom", [1600, 3200], {
              ratio: "4 / 3",
              alt: "The Boss lying across its open box, the wrapping paper curled up around it and drooping over the edges, the instruction manual and the Pattern Picker card on the table beside it",
            }),
          },
        ],
        body: "Unboxing is onboarding. Each piece is an interface, and together they are a flow that caters to the specific customer, whether through extensions of the product or a card that directs visual learners to videos online. Color is used intentionally and carefully, shifting focus to certain elements while keeping print costs down.",
        more: [
          { label: "Analog first", text: "Paper, print, hands-on materials. Nothing glossy, plasticky or overly retail." },
          { label: "Show the weave", text: "Every graphic echoes the loom's nature." },
          { label: "Learnable in order", text: "Each piece prepares you for the next one, the loom being the last thing you access." },
          {
            label: "Read",
            text: "The founder had researched what a retail label needs and made a prototype. I kept her content and gave it hierarchy: product name, a one-line promise, what's in the kit, a photo of the loom. It had to work within printer and budget limits, and travel internationally.",
          },
          {
            label: "Unfold",
            text: "I set the wordmark in rows that shift like a twill, then ran color through it the way weft runs through warp: row by row, left to right and back again. I explored six colorways; the paper now wraps every loom.",
          },
          {
            label: "Discover",
            text: "What's inside depends on what you ordered: extensions such as the older maple loom model, extra pattern bars and yarn kits. A card for the Pattern Picker web tool, along with how-to videos, is always included. A new feature only needs a new card, not a new design, and black and white keeps the print cost low and the system calm.",
          },
          {
            label: "Weave",
            text: "After a sequence of paper, mostly black and white with color in the wrap, the loom's bright pattern bars are the payoff.",
          },
        ],
      },
      {
        id: "manual",
        label: "The manual",
        // It claimed to be "the most important piece I designed"; the typeface was (Noah, Oct 26)
        headline: "From PDF printout to designed booklet.",
        // One shoot, closed then open, on purpose. One row at one height (Noah, Oct 26: the closed booklet "smaller,
        // and more like the one to its right"): the closed one as a portrait, so it comes out narrower and its booklet
        // reads at about the open one's size. The photo has nothing beyond its edges to frame it looser with.
        row: true,
        media: [
          still("8-manual-closed-4x5", [1600, 2832], {
            ratio: "4 / 5",
            alt: "Hands holding the instruction manual shut, its Signature Blue cover facing up",
          }),
          still("8-manual-open-4x3", [1600, 3200], {
            ratio: "4 / 3",
            alt: "The manual held open to its first spread: the inside of the blue cover, and “Welcome to your new boss.”",
          }),
        ],
        body: "The founder's teaching sequence, where each skill builds on the last, now reads as eight clear chapters. Her hand-drawn illustrations stay: the authenticity is hers, the friction and lack of hierarchy are gone.",
        more: [
          { label: "Before", text: "Typewriter type, inconsistent headers, and a lot to read before you could start." },
          {
            label: "The booklet",
            text: "A cover, a consistent grid, Neue Haas Grotesk for reading and BoomLoom Display drop caps marking each chapter.",
          },
          {
            label: "The chapters",
            text: "Welcome, warping, the pattern bar, weaving, tidy tips, shapes, two colors, inlay and finishing. Further techniques are explored in the zine series.",
          },
        ],
      },
      {
        id: "zine",
        chapter: "Thinking outside the box.",
        label: "The zine",
        headline: "The manual teaches you to walk; the zine teaches you to fly.",
        interactive: {
          kind: "zine",
          spreads: ["p01-02", "p03-04", "p05-06", "p07-08", "p09-10", "p11-12", "p13-14"].map(
            (spread) => `${BOOMLOOM}/zine/${spread}.png`,
          ),
          how: "click or swipe to turn the pages.",
        },
        body: "I designed a full-color edition: editorial titles, product photography and the brand palette at full volume. Issue No.1 covers plain weave, unique methods and inspiration; the series is meant for libraries, educators and institutions to adopt as they integrate BoomLoom into a curriculum and practice.",
        more: [
          {
            label: "Where it's going",
            text: "In time, the series is meant to merge with the manual. We envision every box including a full zine issue relating to the product purchased.",
          },
          {
            label: "Built to last",
            text: "I'm also building layouts and formats the founder can fill herself, so a new issue can happen whenever someone invents a new technique, with or without a designer.",
          },
          {
            label: "Variants",
            text: "Later black-and-white variants and alternate layouts, driven by print cost and format, all descend from the color edition.",
          },
        ],
      },
    ],
    lessons: [
      {
        rule: "Constraints are the interface.",
        body: "The print budget pushed us to black and white, and we accepted the look with open arms. BoomLoom is about honesty and authenticity, not about looking flashy as a product.",
      },
      {
        rule: "Build lasting systems before the surfaces.",
        body: "Every piece after the guidelines started from them, and the brand finally looks like one company.",
      },
      {
        rule: "Design for whoever maintains it.",
        body: "The founder will make the next zines without me, so the formats had to be simple enough to run alone, yet elaborate enough to encourage creative thinking and techniques.",
      },
    ],
    credits: {
      owned: [
        "Logo vectorization and refinement",
        "BoomLoom Display",
        "Brand guidelines",
        "Box label",
        "Packaging paper",
        "Insert cards",
        "Manual redesign",
        "Zine design and formats",
        "Print and promo explorations",
      ],
      // Short items for the closing panel; the detail moved into the steps below
      contributed: ["Direction, with the founder each week"],
      process: [
        {
          step: "Weekly",
          body: "Every week I visited the Jersey City studio, and we worked through problems on paper before anything went digital; the founder chose between the options I designed, and I elaborated from them.",
        },
        {
          step: "Explorations",
          body: "Business card, show banner, Pattern Picker promos, type posters and pattern studies.",
        },
        {
          step: "On paper",
          body: "Sessions ran up to several hours: sketches, flows, scans of weaves, photography, lists and decisions, made together at a table.",
        },
        {
          step: "By hand",
          body: "Nothing in the work itself was generated: every color pairing, composition and glyph came from sketching and iteration by eye in Illustrator, Affinity, Photoshop and Glyphs.",
        },
      ],
    },
    // Only the Paper Mono line (Noah, Oct 28: "Lets just keep The way this case study shows the work…"). The mockup
    // credits were a courtesy, none of their licences asks for one (case-studies/boom-loom-looms.md)
    footnote: [
      "The way this case study shows the work, the zine's page-turn and the glyph viewer for BoomLoom Display, is inspired by ",
      { text: "Paper Mono", href: "https://paper.design/mono" },
      " by ",
      { text: "Paper", href: "https://paper.design" },
      ".",
    ],
  },
  {
    slug: "rfc",
    soon: true, // "Coming soon" on its card, with no page yet (Noah, Oct 28)
    title: "RFC Editor", // Noah, Nov 2: "Lets rename RFC editor redesign into simply RFC Editor" (was "RFC editor redesign", Oct 29)
    summary: "[One line on what it is, up to 10 words.]",
    shape: "product",
    discipline: "Product design, web",
    year: "[Year]",
    card: "16 / 9",
    cover: {
      ratio: "16 / 9",
      // Round 4 of Noah's wordmark loop (Nov 2): the wordmark, the system from atoms up, the lists cascading, and back,
      // moving like a product reel. Round 4 ("shadows are a little too strong - the blurs too ... The atoms appearing and
      // banding into organisms could be more fluid"): half the shadow and blur, the atoms as one wave on gentle arcs, each
      // molecule growing out of the atoms before it. Round 5 ("Not liking how the organisms slide to reveal ... make that fade
      // slighter"): each organism resolves in place around its molecule, and nothing fades while it moves. The live build's
      // own markup and data (20261015-2219). Round 6 (a fixed frame, cuts) misread Noah's note and went back. Round 7 ("I'd
      // rather just have them appear whole ... we could lean into it more"): every component fades in whole, never revealed
      // edge by edge, and round 5's eased motion and camera drift return, softer and longer.
      // Round 8, a still placeholder for a while (Noah, Nov 11: "not liking the RFC overview card - can we have a static
      // placeholder for a bit instead? Maybe the dots change colors within their positions - no movement"): round 7's
      // wordmark frame, nothing moving; two dots at a time, never side by side, trade colors in a 500ms crossfade every
      // 1.6s, three trades out and three back, 9.6s round. Drawn by scripts/rfc-card-r8 over rfc-card-r7-poster.jpg.
      video: "/work/rfc/video/rfc-card-r8.mp4",
      webm: "/work/rfc/video/rfc-card-r8.webm",
      poster: "/work/rfc/video/rfc-card-r8-poster.jpg",
      alt: "The RFC Editor wordmark: six colored dots beside the name, two at a time trading colors in place",
    },
    slate: [
      { label: "Role", value: "[Product designer]" },
      { label: "Team", value: "[Who you worked with]" },
      { label: "Timeline", value: "[Quarter, year: Q4 2026]" },
      { label: "Stage", value: "[Company stage]" },
    ],
    ...product("RFC", ["[Homepage]", "[Navigation]", "[Design system]"]),
  },
];

// The case studies with pages, in order: the ones coming soon have none
export const published = projects.filter((p) => !p.soon);

export const getProject = (slug: string) => published.find((p) => p.slug === slug);

export const nextProject = (slug: string) => {
  const i = published.findIndex((p) => p.slug === slug);
  return published[(i + 1) % published.length];
};
