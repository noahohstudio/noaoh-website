"use client";

import { useEffect, useRef, useState } from "react";

export default function EmailFollow() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const [releaseTop, setReleaseTop] = useState(0);

  useEffect(() => {
    const track = wrapperRef.current?.parentElement;
    if (!track) return;

    let rafId = 0;
    let lastShouldPin: boolean | null = null;

    function tick() {
      const wrapper = wrapperRef.current;
      if (wrapper && track) {
        const trackHeight = track.offsetHeight;
        const rowHeight = wrapper.offsetHeight;
        const shouldPin = window.scrollY < trackHeight - rowHeight;
        if (shouldPin !== lastShouldPin) {
          lastShouldPin = shouldPin;
          setPinned(shouldPin);
          if (!shouldPin) setReleaseTop(trackHeight - rowHeight);
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={
        pinned
          ? { position: "fixed", top: 0 }
          : { position: "absolute", top: releaseTop }
      }
      className="pointer-events-none inset-x-0 z-40 grid h-14 grid-cols-2 items-center gap-6 mix-blend-difference px-5 text-[13px] tracking-[-0.02em] sm:h-16 sm:px-8 sm:text-[15px] lg:h-20 lg:grid-cols-12 lg:gap-6 lg:px-12 lg:text-[18px] lg:tracking-[-0.07em]"
    >
      <a
        href="mailto:hello@noaoh.com"
        className="pointer-events-auto col-span-2 hidden w-fit text-paper hover:opacity-70 sm:mx-auto sm:block lg:col-span-8 lg:col-start-5 lg:mx-0"
      >
        hello@noaoh.com
      </a>
    </div>
  );
}
