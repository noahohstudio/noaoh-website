"use client";

import { RailShell, type RailOptions, type RailProps } from "./RailShell";
import styles from "./RailE3.module.css";

// v2 nav, E3, Carry (Noah, Nov 9: "lets go with nav E, but make the blurring a little subtler... What if, in the time
// before the case study fades in, as the sections of the prior study closes, the new ones open under the destination
// study?"): E's focus as you read; between case studies, the block of section names is carried from under one study to under the next, trading text mid-flight. The page is held through the jump
// (RailE3.module.css and Stage.module.css, on RailShell.tsx).
// The carry runs on the lists' own 580ms and curve (RailE3.module.css), each name gone a whole row ahead of a title
// passing it and resolving a row behind it, over a row and a half (Noah, Nov 9: "Slightly more time? Really just to make
// sure nothing even gives the illusion of a clash"). The page fades out over 160ms as the jump starts and arrives a beat
// after the rail lands, from 640ms. At home the work list folds away, and in a case study the crumb is "← back to work"
const options: RailOptions = {
  falloff: [1, 0.5, 0.35, 0.3],
  hold: { out: 160, arrive: 640 },
  carry: { duration: 580, easing: "cubic-bezier(0.45, 0, 0.2, 1)", clear: 1, soften: 1.5 },
  foldHome: true,
  backToWork: true,
};

export function RailE3(props: RailProps) {
  return <RailShell {...props} styles={styles} options={options} />;
}
