export type ProjectColor = "accent" | "cobalt" | "pine" | "gold" | "violet";

export type Project = {
  slug: string;
  title: string;
  category: string;
  year: string;
  color: ProjectColor;
  featured: boolean;
  large: boolean;
  description: string;
};

export const projects: Project[] = [
  {
    slug: "aperture",
    title: "Aperture",
    category: "Brand Identity",
    year: "2025",
    color: "accent",
    featured: true,
    large: true,
    description:
      "Placeholder copy — a visual identity system for a fictional optics and imaging studio.",
  },
  {
    slug: "north-field",
    title: "North Field",
    category: "Editorial Design",
    year: "2025",
    color: "cobalt",
    featured: true,
    large: false,
    description:
      "Placeholder copy — a quarterly print publication redesign focused on long-form writing.",
  },
  {
    slug: "marrow",
    title: "Marrow",
    category: "Packaging",
    year: "2024",
    color: "pine",
    featured: true,
    large: false,
    description:
      "Placeholder copy — packaging and shelf system for a small-batch food brand.",
  },
  {
    slug: "skylight",
    title: "Skylight",
    category: "Web Design",
    year: "2024",
    color: "gold",
    featured: false,
    large: false,
    description:
      "Placeholder copy — marketing site and design system for an architecture practice.",
  },
  {
    slug: "hollow-body",
    title: "Hollow Body",
    category: "Art Direction",
    year: "2023",
    color: "violet",
    featured: false,
    large: true,
    description:
      "Placeholder copy — art direction and key visuals for an independent music festival.",
  },
];
