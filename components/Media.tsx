import type { CSSProperties } from "react";
import type { Media as MediaType } from "@/content/projects";
import { Loop } from "./Loop";
import styles from "./Media.module.css";

// An image, a muted video loop, or a gray placeholder until the real file arrives.
// With `widths`, `src` names a set of AVIF and WebP files (`${src}-${width}.avif`), and the
// browser picks the size it needs. A loop plays only while it's on screen (Loop.tsx); with
// reduced motion it rests on its poster, or on its `still`, set here behind it.
// A `transparent` piece sits on the page itself, whole: no gray behind it, never cropped.
// `shadow` lifts a project card just off the page; the shadow is on the card, never the picture.
export function Media({
  media,
  ratio,
  priority = false,
  sizes = "100vw",
  shadow = false,
  controls = true,
}: {
  media: MediaType;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  shadow?: boolean;
  controls?: boolean; // a loop's pause control; off on cards, which are links
}) {
  const set = (ext: string) => media.widths?.map((w) => `${media.src}-${w}.${ext} ${w}w`).join(", ");
  const loop = Boolean(media.video || media.mov);
  const still = loop && media.still;
  const className = [styles.media, shadow && styles.shadow, media.transparent && styles.clear].filter(Boolean).join(" ");

  return (
    <div
      className={className}
      style={{ aspectRatio: ratio ?? media.ratio, "--still": still ? `url("${still}")` : undefined } as CSSProperties}
      data-still={still ? "" : undefined}
    >
      {loop ? (
        <Loop media={media} controls={controls} />
      ) : media.src && media.widths ? (
        <picture>
          <source type="image/avif" srcSet={set("avif")} sizes={sizes} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${media.src}-${media.widths[0]}.webp`}
            srcSet={set("webp")}
            sizes={sizes}
            alt={media.alt ?? ""}
            loading={priority ? "eager" : "lazy"}
          />
        </picture>
      ) : media.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={media.src} alt={media.alt ?? ""} loading={priority ? "eager" : "lazy"} />
      ) : null}
    </div>
  );
}
