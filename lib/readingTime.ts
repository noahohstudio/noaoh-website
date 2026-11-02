import type { Project } from "@/content/projects";

const WORDS_PER_MINUTE = 230;

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

// Minutes to read a case study, Read more included.
export function readingMinutes(project: Project) {
  const { impact, story, lessons } = project;
  const text = [
    impact.headline,
    impact.context,
    ...impact.proof,
    ...story.flatMap((s) => [
      s.headline,
      s.body ?? "",
      ...(s.steps ?? []).map((step) => step.body ?? ""),
      ...(s.beside?.notes ?? []).map((note) => note.text),
      ...(s.more ?? []).map((note) => note.text),
    ]),
    ...lessons.flatMap((l) => [l.rule, l.body]),
  ];
  return Math.max(1, Math.round(words(text.join(" ")) / WORDS_PER_MINUTE));
}
