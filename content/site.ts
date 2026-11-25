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
  description: "Noah Oh is a product designer who tinkers and builds tools for moments anyone can have, heading into spatial tech.", // as the line

  lander: {
    // Fills the first screen. " " (a no-break space) keeps words on one line.
    // Noah, Nov 11: "I want it to reflect my tinkering and tool-building nature as well as my kind of interaction and
    // systems focal point. Maybe we even do it something like Noah Oh is a product designer who tinkers and tool-builds
    // focused on systems and interactions"; "tool-builds" set as "builds tools". It was "…who helps early-stage
    // startups scale, focused on systems and interactions."
    // Noah, Nov 24: "redo my lander description to match my North Star"; of the drafts, chosen the same day: "Draft 2".
    // It was "…who tinkers and builds tools, focused on systems and interactions." (Nov 11 to Nov 24).
    sentence: "noah oh is a product designer who tinkers and builds tools for moments anyone can have, heading into spatial tech.",
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
      // From the lab-pieces sandbox's visual-language work for a producer Noah works with (Nov 16). Noah asked for "a screen
      // recording of yourself exploring the modules, then maybe 2 interesting parts ... They should fade out and fade in when
      // you're done with each. For this no cursor should be visible, and the glow could be slightly stronger. This is for the
      // lab page, titled something that relates to a hardware opacity study"; then "First one is enough" of the module
      // explorations, and "Yes, send it". A speaker module through thin light-gray plastic, a heat-colored light moving
      // under it, then the shield can and the speaker wires up close. Since Nov 17 brighter so it reads at tile size (Noah:
      // "make the film brighter so it reads at tile size, background should be near white"): a #fbfbfb surface, each view
      // dissolving into the next over 0.8s and the last back into the first, so it never goes blank; 13.5s.
      // 60fps, silent, nothing of the producer's track; no live link, since the live pages use that private track.
      // Newest first.
      // Noah, Nov 17, seeing it in the lab: "caption is far too long, and title should be a little more specific and
      // contextual". Title and note are Noah's picks; the files keep their first name
      title: "Speaker Module Opacity Study",
      context: "Visual study, 2026", // [? Noah to confirm]
      ratio: "16 / 9",
      note: "An x-ray study of a speaker module, for a producer's visual language.",
      // Later, a link to the producer's case study once it exists (Noah, Nov 17: "Lets link the lab to the case study later,
      // since it was experimentation we conducted. this will be informative towards the case study itself too"): the
      // producer's website, visual language and branding, starting from the Unmute button
      video: "/lab/hardware-opacity-study.mp4",
      webm: "/lab/hardware-opacity-study.webm",
      poster: "/lab/hardware-opacity-study-poster.jpg",
      still: "/lab/hardware-opacity-study-still.jpg",
    },
    // The lab trimmed to four (Noah, Nov 14: "Super sweet, lets add a preview card to the lab section. No interactivity
    // yet. Lets also remove everything else from the lab section, other than outcome logo generator, the monograms, and
    // dels bridge"). A study of the WØRKS website, The Hellp + Sombr tour poster, Carmelle Safdie and Día de los Muertos
    // came off; their loops stay in public/lab.
    {
      // Built in the lab-pieces session (Nov 14), public at noahohstudio.github.io/flipbook-scroll: an endless strip of
      // frames from moments of Noah's life that plays like a flipbook when scrolled fast enough. Its preview is the piece's
      // own card mode, one screen refresh per video frame, so it must stay 60fps: any frame-rate change undoes the effect.
      // It starts and ends on white; the still is for reduced motion. No interactivity yet (Noah, Nov 14). Newest first.
      title: "Flipbook Scroll",
      context: "Interactive piece, 2026", // [? Noah to confirm]
      ratio: "16 / 9",
      // Noah's own words, from the piece's About
      note: "Lately, I've been interested in taking the moments of my life I value, and finding new ways to play with them, reliving them as I do.",
      // Since Nov 14 its card is the whole experience, filmed start to finish, in a desktop window the site draws (Noah:
      // "I think the overview inside our lab could be much prettier. Maybe it's shown on a surface, maybe as a desktop
      // window"; "film the entire experience from start to finish ... send that off to the website session so that it can
      // make it look prettier with maybe a frame"): the live page at 1280 × 720, drawn at 1.5×, 60fps, 12s, from white
      // to white. The card-mode loop before it (flipbook-scroll.*) stays in public/lab.
      video: "/lab/flipbook-scroll-experience.mp4",
      webm: "/lab/flipbook-scroll-experience.webm",
      poster: "/lab/flipbook-scroll-experience-poster.jpg",
      still: "/lab/flipbook-scroll-experience-still.jpg",
      window: true,
      // "Try it" in its open frame, to the live piece in a new tab (Noah, Nov 14: "I'm curious on how we can allow users
      // to try it if they want to. Maybe that's in the caption somewhere")
      tryIt: "https://noahohstudio.github.io/flipbook-scroll/",
    },
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
      // Since Nov 17 the intro is gone (Noah: "could dels bridge lose the intro hero section? Just loop it with input and
      // response"): the story page with its empty prompt, the typed "get out and walk to the booth", the reply, then the
      // reply fades from the text column and the prompt fades back in, the portrait and bar staying put. 9.1s at 60fps,
      // cut from the old loop (cascadia.*, kept) by scripts/dels-bridge-loop/build.sh
      video: "/lab/dels-bridge-loop.mp4",
      webm: "/lab/dels-bridge-loop.webm",
      poster: "/lab/dels-bridge-loop-poster.jpg",
    },
  ] as {
    title: string;
    context: string;
    ratio: string;
    note: string;
    src?: string;
    video?: string;
    webm?: string;
    poster?: string;
    still?: string;
    tryIt?: string; // where to try the piece itself; its open frame links there
    window?: boolean; // shown in a desktop window the site draws around it (components/v2/lab/LabC.tsx)
  }[],

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
    "I'm a product designer who dabbles in front-end development and design engineering. I founded Palit, an SVSD 2026 finalist, designed and coded for Kino, and built BoomLoom its first brand system and packaging. I do my best work within a system, and where there isn't one, I build it.",
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
    { years: "2026–now", org: "BoomLoom", role: "Visual & Packaging Designer" }, // not BoomLoom Looms (Noah, Nov 21)
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
