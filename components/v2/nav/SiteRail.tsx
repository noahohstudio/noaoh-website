"use client";

import { usePathname } from "next/navigation";
import { RailE3 } from "./RailE3";
import type { RailStudy } from "./RailShell";

// The site's rail since Nov 11 (Noah: "v2 replaces the site"): Nav E3, Carry, over the real pages, on screens 1100px
// and up; the top bar (Nav.tsx) below that. Off on the desk, and on the workshop's stages, which carry their own.
export function SiteRail({ studies }: { studies: RailStudy[] }) {
  const pathname = usePathname();
  if (pathname.startsWith("/desk") || /^\/workshop\/v2\/(nav|type)/.test(pathname)) return null;
  return <RailE3 root="" studies={studies} />;
}
