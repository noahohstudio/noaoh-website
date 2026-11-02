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

// A piece you play with instead of look at, built in the browser (components/boomloom).
export type Interactive = (
  | { kind: "zine"; spreads: string[] }
  | { kind: "glyphs"; font: string; construction?: string }
  | { kind: "board"; pieces: BoardPiece[] }
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
  // In the order the home page shows them (Noah, Oct 28: "lets move kino to the top of the project cards, with boomloom
  // following it"); the ones still to come last
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
      // The hero, round 10 (case-studies/kino-workshop): round 7 with its last line reading "Vertical Network for Film
      // Lovers" (Noah, Oct 28: "social commerce for film lovers isn't accurate. Vertical network for film lovers is much
      // better"). Round 9: no bumps; the numbers stretch a little as they count and spring back as they land ("Like a rubber
      // band being pulled, then let go"). Round 10 ("the phones are a little crowded - the kino brandmark seems to be cut
      // off"): smaller phones with twice the gap, and each Home under its own status row, so the wordmark clears the
      // corner. Made by the Kino session.
      video: "/work/kino/video/hero-r10.mp4",
      webm: "/work/kino/video/hero-r10.webm",
      poster: "/work/kino/video/hero-r10-poster.jpg", // the wordmark, from the splash
      alt: "Kino's splash gathers its dots into the wordmark; Home in four versions on iPhones, from a colorless sketch to the final; ten friends as colored dots pop into rows, arc into groups and spin; a match between two friends counts up to 86%; Interstellar with three friends' scores; then the line Vertical Network for Film Lovers",
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
    slug: "palette",
    soon: true, // "Coming soon" on its card, with no page yet (Noah, Oct 28)
    title: "Palit", // its real name (Noah, Oct 29)
    summary: "[One line on what Palette is.]",
    shape: "designathon",
    discipline: "Product design, designathon",
    year: "[Year]",
    card: "15 / 8",
    cover: {
      ratio: "16 / 9",
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
      { label: "Role", value: "[Product designer]" },
      { label: "Team", value: "[Team size and roles]" },
      { label: "Context", value: "[Designathon name], [hours]" },
      { label: "Result", value: "[Placement or award]" },
    ],
    ...designathon("Palit"),
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
      // own markup and data (20261015-2219). Round 6 ("I don't like the swipes, and the weird gentle zoom ins/outs"): a fixed
      // frame, and plain near-cuts into and out of the lists.
      video: "/work/rfc/video/rfc-card-r6.mp4",
      webm: "/work/rfc/video/rfc-card-r6.webm",
      poster: "/work/rfc/video/rfc-card-r6-poster.jpg",
      alt: "The RFC Editor redesign's wordmark breaks apart into its design system: era dots, status marks, chips and type glide into a legend, a search field and an RFC row, which resolve into a search dropdown, an era banner and an RFC header card, before columns of the archive's real lists stream past and dissolve back into the wordmark",
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
