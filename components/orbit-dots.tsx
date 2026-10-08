"use client";

import { useEffect, useRef } from "react";

const DOT_COUNT = 18;
const SPEED = 0.09; // radians per second, so one lap takes about 70 seconds
const MIN_SCALE = 0.55;
const MAX_SCALE = 1.2;
const MIN_OPACITY = 0.25;

type Dot = {
  phase: number;
  radiusMul: number;
  sizeMul: number;
};

// A slow ring of small dots around whatever contains it. The ring sizes
// itself from its parent's box, so it wraps the text at any screen size.
export default function OrbitDots() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const host = ringRef.current?.parentElement;
    if (!host) return;

    const dots: Dot[] = Array.from({ length: DOT_COUNT }, (_, i) => ({
      phase: (i / DOT_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4,
      radiusMul: 0.94 + Math.random() * 0.14,
      sizeMul: 0.8 + Math.random() * 0.4,
    }));

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let radiusX = 0;
    let radiusY = 0;
    let angle = 0;
    let rafId = 0;

    const measure = () => {
      const rect = host.getBoundingClientRect();
      radiusX = Math.min(rect.width / 2 + 56, window.innerWidth / 2 - 14);
      radiusY = rect.height / 2 + 60;
    };

    const render = () => {
      dots.forEach((dot, i) => {
        const el = dotRefs.current[i];
        if (!el) return;
        const theta = angle + dot.phase;
        const depth = (Math.sin(theta) + 1) / 2; // 0 far side, 1 near side
        const x = Math.cos(theta) * radiusX * dot.radiusMul;
        const y = Math.sin(theta) * radiusY * dot.radiusMul;
        const scale =
          (MIN_SCALE + depth * (MAX_SCALE - MIN_SCALE)) * dot.sizeMul;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        el.style.opacity = String(MIN_OPACITY + depth * (1 - MIN_OPACITY));
      });
    };

    const handleResize = () => {
      measure();
      if (reducedMotion) render();
    };

    measure();
    render();

    const observer = new ResizeObserver(handleResize);
    observer.observe(host);
    window.addEventListener("resize", handleResize);

    if (!reducedMotion) {
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        angle += SPEED * dt;
        render();
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
    >
      {Array.from({ length: DOT_COUNT }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full bg-void will-change-transform"
          style={{ opacity: 0 }}
        />
      ))}
    </div>
  );
}
