"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./Loader.module.css";

const DONE_MS = 1800; // the loader's whole run (Loader.module.css), then it's gone from the page

// A quick loader as the site opens, in place of the home page's opening (Noah, Oct 29: "can we come up with a quick
// loader that replaces our opening animations? I think that'll just be cleaner. Lets make sure that it only plays when
// first opening the website"): the glass's three circles pop in, one after another, in their triangle, and the screen
// clears to the page, already in place. It's drawn with the page and runs on CSS alone, so there's no flash before it,
// and it plays once per load of the site, never on moving between pages (the layout it lives in stays put). Not on the
// desk, and not with reduced motion.
export function Loader() {
  const pathname = usePathname();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setGone(true), DONE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (gone || pathname.startsWith("/desk")) return null;
  return (
    <div className={styles.loader} aria-hidden="true">
      <span className={styles.mark}>
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
