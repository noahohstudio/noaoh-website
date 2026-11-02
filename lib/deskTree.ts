import { projects } from "@/content/projects";

// The desk's nav as a tree (Noah, Oct 27: "could we have a tree-view of the nav? The 3 main pages are the first nav,
// then subsections of each are the next - similar to say, photoshop"): its pages, each with its sections.
// Copy's are the site's own copy, then the case studies with copy of their own, not the empty templates.
export type Branch = { id: string; title: string; href: string; sections: { id: string; title: string }[] };

export function deskTree(): Branch[] {
  return [
    {
      id: "desk",
      title: "Desk",
      href: "/desk",
      sections: [
        { id: "now", title: "Now" },
        { id: "review", title: "Review" },
        { id: "feedback", title: "Feedback" },
      ],
    },
    {
      id: "todo",
      title: "To-do",
      href: "/desk/todo",
      sections: [
        { id: "calendar", title: "Calendar" },
        { id: "list", title: "List" },
      ],
    },
    {
      id: "logs",
      title: "Logs",
      href: "/desk/logs",
      sections: [
        { id: "decisions", title: "Decisions" },
        { id: "changes", title: "Site changes" },
        { id: "archive", title: "Archive" },
      ],
    },
    {
      id: "copy",
      title: "Copy",
      href: "/desk/copy",
      sections: [
        { id: "site", title: "The site" },
        ...projects.filter((p) => !p.impact.headline.startsWith("[")).map((p) => ({ id: p.slug, title: p.title })),
      ],
    },
  ];
}
