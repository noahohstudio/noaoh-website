/*
  Everything the site says about you lives here.
  Anything in [square brackets] is a placeholder waiting for your real copy.
*/

// A glass piece in the lander. The page puts each piece on a line that needs
// filling and stretches it to fill that line, which keeps the sentence
// justified. Visitors can drag the glass anywhere; a faint gray mark shows
// where it goes back.
export type GlassPiece = {
  id: string;
  color: string; // the glass is tinted with this, see-through
};

export const site = {
  name: "Noah Oh",
  domain: "noaoh.com",
  // The day the site first ran, Oct 23, 2026 (its first records on the desk), not the day it went public (Noah, Nov 2:
  // "the site has been live, or "live" in the sense that its been up and hosted (even locally) for longer now. Reflect
  // that?"); hover the © in the footer to see days since
  launched: "2026-10-23",
  title: "Noah Oh, product designer",
  description: "Noah Oh is a product designer who tinkers and builds tools, focused on systems and interactions.", // as the line

  lander: {
    // Fills the first screen. " " (a no-break space) keeps words on one line.
    // Noah, Nov 11: "I want it to reflect my tinkering and tool-building nature as well as my kind of interaction and
    // systems focal point. Maybe we even do it something like Noah Oh is a product designer who tinkers and tool-builds
    // focused on systems and interactions"; "tool-builds" set as "builds tools". It was "…who helps early-stage
    // startups scale, focused on systems and interactions."
    sentence: "noah oh is a product designer who tinkers and builds tools, focused on systems and interactions.",
    // Top to bottom: the first piece sits near the top, the last near the bottom.
    glass: [
      { id: "blue", color: "#5b77e8" },
      { id: "red", color: "#e8604f" },
      { id: "yellow", color: "#f2c94c" },
    ] as GlassPiece[],
  },

  // `section` is what the nav highlights while you're in it.
  nav: [
    // Home, where the selected work is (Noah, Nov 11: "for now lets make noah oh and work the same - selected work
    // doesn't need its own zone"); the Work bento (components/v2/work/WorkA.tsx) is set aside until it's wanted again
    { label: "work", href: "/#work", section: "work" },
    { label: "lab", href: "/lab", section: "lab" },
    { label: "about", href: "/about", section: "about" },
  ],

  // Under the lander, after Rachel's "Currently / Previously"
  now: {
    // Noah's words (Oct 29)
    currently: "Open for product design roles",
    previously: "Founder @ Palit (SVSD 2026 Finalist), Designer + Front-end @ Kino, and more.",
  },

  // Experiments and side projects: creative, but not case studies. `note`
  // shows beside a piece when someone hovers it.
  // Add `src` (an image) or `video` (a muted loop) to replace a placeholder.
  lab: [
    {
      // Noah, Nov 2: "my Outcome logo generator. I love the way the icons fluidly morph into eachother when you swap between
      // the saved tabs, and I want the lab overview card to be just that - the morphing, fluid logos changing colors, as
      // the backgrounds change colors too." Noah's own tabs live only in their browser, so it runs the tool's six built-in
      // designs ("Use built-in designs"), each in one of the color pairs from Noah's logos, through the tool's own morph.
      title: "Outcome Web Tool", // Noah, Nov 2: "rename Outcome Logo Gen into Outcome Web Tool"
      context: "Web tool, 2026",
      ratio: "1 / 1",
      // Noah's own copy, Nov 2, a touch more concise: "Inspired by circular, organic logos associated with the Japanese trance
      // DJ's "Minna No Kimochi", I built a web tool that fluidly mimics the style, allowing users to create exportable versions
      // of their own. Reach out to me if you'd like to try it."
      note: "Inspired by the circular, organic logos associated with Japanese trance DJs Minna No Kimochi, I built a web tool that fluidly mimics the style, letting anyone create exportable versions of their own. Reach out if you'd like to try it.",
      video: "/lab/outcome-logos.mp4",
    },
    {
      // Right under the Outcome Web Tool, apart from Del's Bridge, so the two short, wide pieces don't read as one (Noah,
      // Nov 2: "Let's put one right underneath the Outcome Web Tool").
      // Noah, Nov 2: "a fully hand-coded HTML website that studies a creative agency I look up to, trying to figure out how
      // they did their website in code using the inspect element on it. Its a front-end code deepdive in a sense ... just
      // scrolling through the website, then scrolling through my handwritten code". The site, then its index.html as
      // GitHub shows code, byte for byte, then back.
      title: "A study of the WØRKS website",
      context: "Front-end study, 2026",
      ratio: "16 / 10",
      note: "A fully hand-coded website studying a creative agency I look up to. Using inspect element, I worked out how they built their site in code: a front-end deep dive, in a sense.",
      video: "/lab/wrks-study.mp4",
    },
    {
      // Noah, Nov 2: "this poster series for The Hellp opening for Sombr, that was nearly picked by management. Wasn't the
      // final choice, but I was in talks with marketing management and worked with a deadline and revisions." The four
      // posters, two colorways by two layouts, with photos of The Hellp between them (Noah's picks, Nov 2: "Use these instead
      // for The Hellp"), clean cuts, nothing moving ("I don't want any fades - just clear cuts").
      title: "The Hellp + Sombr tour poster",
      context: "Tour poster pitch",
      ratio: "4 / 5",
      note: "A poster series for The Hellp opening for Sombr. It wasn't management's final pick, but it came close: I was in talks with their marketing team, working to a deadline through revisions.",
      video: "/lab/hellp-posters.mp4",
    },
    {
      // Noah, Nov 2: "I also did the visual identity for a contemporary artist, Carmelle Safdie. Separate the brandmark with
      // the blue dot in the "i", and put that over slightly blurred, grainy black and white images of crowds in gallery
      // settings ... posters, with the shots in between. Vary the order". The mark lifted from the poster exports, the
      // poster dot in its blue; gallery crowds from Pexels (free to use, no credit needed), black and white, blurred, grained.
      // Clean cuts, nothing zooms or slides (Noah, Nov 2).
      title: "Carmelle Safdie",
      context: "Visual identity, 2026",
      ratio: "3 / 4",
      note: "I did the visual identity for Carmelle Safdie, a contemporary artist, along with the posters for the open studio.",
      video: "/lab/carmelle-safdie.mp4",
    },
    {
      // Noah, Nov 2: "An announcment card series i did for a Dia De Los Muertos celebration party - meant to be holistically
      // collected and shown. Maybe it just loops in order?" The six cards from their PDFs, in reading order, cut from one
      // to the next ("no slides either").
      title: "Día de los Muertos",
      context: "Announcement cards, 2026",
      ratio: "4 / 3",
      note: "An announcement card series I did for a Día de los Muertos celebration, meant to be collected and shown as a whole.",
      video: "/lab/dia-de-los-muertos.mp4",
    },
    {
      // Noah, Nov 2: "monogram designs I did - maybe for the lab?"; "Monograms should only be the script monograms I designed,
      // with and without the outlined versions as slides"; "Be sure to note that the monograms are part of a typographic
      // exploration I conducted after a deepdive research project of Steve Job's, and how typography could reflect his
      // essence". The script A filled and outlined (from the vector, in red as Noah showed it), then the script pair; cut.
      title: "Monograms",
      context: "Typographic exploration, 2026",
      ratio: "17 / 22",
      note: "Script monograms from a typographic exploration I did after a deep-dive research project on Steve Jobs, asking how typography could reflect his essence.",
      video: "/lab/monograms.mp4",
    },
    {
      // Noah, Nov 2: "a fully local web experience I designed that deep dives into a story about fatherhood, loss, and
      // objective goals. I engineered an algorithm that tracks responses and automates replies based on a giant file full
      // of handwritten line and scenarios. The storyline, concept, and ui were all designed by me." Played through its own
      // inputs (cascadia story/prototype): the title, the opening, one typed response, the reply, home. Its matching model
      // downloads once, then everything runs in the browser: "in a way, a locally hosted AI", as Noah puts it.
      title: "Del's Bridge",
      context: "Interactive story, 2026",
      ratio: "16 / 10",
      note: "A web experience I designed that dives deep into a story about fatherhood, loss, and objective goals. An algorithm I engineered tracks your responses and replies from a giant file of handwritten lines and scenarios. In a way, it's a locally hosted AI.",
      video: "/lab/cascadia.mp4",
    },
  ] as { title: string; context: string; ratio: string; note: string; src?: string; video?: string }[],

  email: "hello@noaoh.com", // the site's own address, on Google mail (Noah, Nov 1: "hello@noaoh.com is my website email")

  links: {
    resume: null as string | null, // on hold while Noah updates it (Nov 1); e.g. "/noah-oh-resume.pdf" once it's in /public
    linkedin: "https://www.linkedin.com/in/noah-oh-8534a338b/",
    readcv: null as string | null,
    github: null as string | null,
  },

  // The about page
  about: [
    // Rewritten to fit Noah's roles (Oct 29: "from the context you know about me, rewrite to fit my roles"): Palit's
    // founder, Kino's designer and front-end developer, BoomLoom's brand and packaging. Its opening line in Noah's words
    // (Nov 2): "I'm a product designer who dabbles in front-end development and design engineering."
    // Its last sentence, Noah, Nov 11: "I want to say that I do my best work within a system, and when I don't see one, I
    // like to build one ... reword it to make it professional and elegant and clean." It was "I do my best work at the
    // messy early stage, when a team has a product but not yet a system, a brand or a story to tell about it."
    "I'm a product designer who dabbles in front-end development and design engineering. I founded Palit, an SVSD 2026 finalist, designed and coded for Kino, and built BoomLoom Looms its first brand system and packaging. I do my best work within a system, and where there isn't one, I build it.",
    // Where Noah is now, workshopped from their line (Nov 1): "I'm currently studying at the Cooper Union School of Art,
    // honing my eye for design, color, and composition through mixed design and photography courses."
    "I've helped teams launch products, rebuild design systems, and grow into better brands. I'm studying at the Cooper Union School of Art, where design and photography courses keep sharpening my eye for color and composition.",
  ],
  availability: "Looking for product design roles now. Reach out about work, or just to say hi.",
  // Beside the bio (Noah, Nov 2: "a picture of me for the about me")
  portrait: { src: "/about/portrait.jpg", ratio: "924 / 1236", alt: "Noah Oh, in black and white, in a dark suit and tie" },

  // The about page's photos, scattered down the page as an archive (components/Photos.tsx).
  // Add `src` (an image) to replace a placeholder.
  photos: [
    // Noah's own, Nov 2: "this is me DJ'ing at a parade when the Knicks won the NBA finals, in the east village", and
    // "some of my film photography I want to include in the about me"
    { caption: "DJing the Knicks' Finals parade, East Village", ratio: "1668 / 1236", src: "/about/knicks-dj.jpg" },
    { caption: "The street that night", ratio: "910 / 1222", src: "/about/knicks-street.jpg" },
    { caption: "Chinatown, on film", ratio: "1904 / 1234", src: "/about/chinatown-film.jpg" },
    { caption: "On film, at night", ratio: "2000 / 1333", src: "/about/mattress-film.jpg" },
  ] as { caption: string; ratio: string; src?: string }[],

  experience: [
    { years: "2026–now", org: "BoomLoom Looms", role: "Visual & Packaging Designer" },
    { years: "[Year]", org: "[Company]", role: "[Role]" },
  ],

  /* Parked until we build the features below the work section */

  capabilities: [
    {
      title: "Design systems that last",
      body: "Foundations, components, and documentation that keep a growing product consistent, and that engineers actually use.",
    },
    {
      title: "Features that scale",
      body: "Product design from first prototype to shipped feature, planned around how the product and team will grow.",
    },
    {
      title: "Launches people remember",
      body: "Marketing reels, product demos, and motion graphics that show what a product does in seconds.",
    },
  ],

  credits: [
    { role: "Designed and built by", name: "Noah Oh" },
    { role: "Typeface", name: "Geist" },
    { role: "Built with", name: "Next.js" },
    { role: "Special thanks", name: "[Mentors and friends]" },
  ],
};

// The lab opens once it has a real piece: until then it's off the nav and the index, and /lab goes to the home page
// (Nov 1, going live while Noah finds the pieces)
export const labOpen = site.lab.some((piece) => piece.src || piece.video);
export const navLinks = site.nav.filter((item) => item.section !== "lab" || labOpen);

// Roles visitors can pick when they sign the credits.
export const visitorRoles = [
  "Visitor",
  "Recruiter",
  "Product manager",
  "Designer",
  "Engineer",
  "Founder",
  "Friend",
] as const;

export type VisitorRole = (typeof visitorRoles)[number];
