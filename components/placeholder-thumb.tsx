import type { ProjectColor } from "@/lib/projects";

const backgroundByColor: Record<ProjectColor, string> = {
  accent: "bg-accent",
  cobalt: "bg-cobalt",
  pine: "bg-pine",
  gold: "bg-gold",
  violet: "bg-violet",
};

const textByColor: Record<ProjectColor, string> = {
  accent: "text-paper",
  cobalt: "text-paper",
  pine: "text-paper",
  gold: "text-ink",
  violet: "text-paper",
};

type PlaceholderThumbProps = {
  color: ProjectColor;
  index: number;
  className?: string;
};

export default function PlaceholderThumb({
  color,
  index,
  className = "",
}: PlaceholderThumbProps) {
  return (
    <div
      className={`relative w-full overflow-hidden ${backgroundByColor[color]} ${className}`}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 14px)",
          color: "var(--color-paper)",
        }}
      />
      <span
        aria-hidden
        className={`absolute -bottom-6 -right-2 select-none font-display text-[7rem] italic leading-none opacity-20 ${textByColor[color]}`}
      >
        {String(index).padStart(2, "0")}
      </span>
      <span
        aria-hidden
        className={`absolute left-5 top-5 h-2 w-2 rounded-full ${textByColor[color]} opacity-60`}
      />
    </div>
  );
}
