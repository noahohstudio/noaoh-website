import { projects, published } from "@/content/projects";
import type { RailStudy } from "./RailShell";

/*
  The nav renditions' stage (app/workshop/v2/nav-c, nav-d, nav-e): one layout per rendition holds its rail, and a page
  route under it draws the site's pages, so the rail stays on screen through real page changes and its motion between
  them can be judged. The pages (Noah, Nov 9: "lets make sure selected work is found when you click on noah oh, and a
  separate library bento of case studies are found when you click work"): home, where "noah oh" leads (v2 Home B2,
  Selected work); the work (Home B2 too until the Work bento lands, StagePage.tsx); each case study as /work/<slug>
  draws it; the lab (v2 Lab C) and about (v2 About B2).
*/

export const PAGES = ["home", "work", ...published.map((p) => p.slug), "lab", "about"];

// Every case study under work, with its sections as its page draws them: Impact, the story's sections by their small
// header, then What I learned (app/work/[slug]/page.tsx). The ones still to come have none.
export const railStudies: RailStudy[] = projects.map((p) => ({
  slug: p.slug,
  title: p.title,
  soon: p.soon,
  sections: p.soon
    ? []
    : [
        { id: "impact", title: "Impact" },
        ...p.story.map((section) => ({ id: section.id, title: section.label })),
        { id: "looking-back", title: "What I learned" },
      ],
}));

export const pageTitle = (page: string) =>
  ({ home: "Home", work: "Work", lab: "Lab", about: "About" })[page] ?? published.find((p) => p.slug === page)?.title ?? "Work";
