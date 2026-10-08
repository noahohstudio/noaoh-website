"use client";

import { useEffect, useRef } from "react";
import { orbitCards } from "@/lib/orbit-cards";

const CARD_COUNT = orbitCards.length;
const SCROLL_TRACK_VH = 220;
const TRANSITION_START = 0.6;
const BASE_SPEED = 0.0016;
const SCROLL_BOOST = 0.00075;
const VELOCITY_DECAY = 0.94;
const RADIUS_X_VW = 50;
const RADIUS_Y_VH = 27;
const MIN_SCALE = 0.45;
const MAX_SCALE = 1.2;
const MIN_OPACITY = 0.28;
const MAX_OPACITY = 1;
const CARD_WIDTH_PX = 48;
const CARD_HEIGHT_PX = 64;

// Near the sphere's equator (full rotational swing) rather than a pole,
// where a card would barely move as the sphere spins.
const TRANSITION_CARD_INDEX = Math.floor((CARD_COUNT - 1) / 2);
// Cards that trickle down alongside the main transition card as it grows,
// spread across different latitudes so they don't move in lockstep.
const TRICKLE_INDICES = [
  Math.round(CARD_COUNT * 0.25),
  Math.round(CARD_COUNT * 0.44),
  Math.round(CARD_COUNT * 0.56),
  Math.round(CARD_COUNT * 0.75),
].filter((idx) => idx !== TRANSITION_CARD_INDEX);

// z-index bands, low to high: orbit cards < name < main transition card <
// trickle cards (rendered in front, falling past it) < email (40) < nav (50).
const Z_NAME = 20;
const Z_TRANSITION_MAX = 32;
const Z_TRICKLE_MAX = 38;

type CardLayout = {
  yUnit: number; // fixed "latitude" on the sphere, -1..1
  radiusAtY: number; // sphere radius at that latitude, with shell jitter
  theta: number; // fixed starting longitude
  sizeMul: number;
};

function makeLayouts(): CardLayout[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return orbitCards.map((_, i) => {
    const baseYUnit = CARD_COUNT > 1 ? 1 - (i / (CARD_COUNT - 1)) * 2 : 0;
    const yUnit = Math.max(
      -0.97,
      Math.min(0.97, baseYUnit + (Math.random() - 0.5) * 0.3),
    );
    const shellJitter = 0.72 + Math.random() * 0.56;
    const radiusAtY =
      Math.sqrt(Math.max(0.05, 1 - yUnit * yUnit)) * shellJitter;
    return {
      yUnit,
      radiusAtY,
      theta: goldenAngle * i + (Math.random() - 0.5) * 0.8,
      sizeMul: 0.8 + Math.random() * 0.4,
    };
  });
}

export default function HeroOrbit() {
  const trackRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const layoutsRef = useRef<CardLayout[]>([]);

  useEffect(() => {
    layoutsRef.current = makeLayouts();
    const layouts = layoutsRef.current;

    let angle = 0;
    let velocity = 0;
    let lastScrollY = window.scrollY;
    let rafId = 0;

    function handleScroll() {
      const currentY = window.scrollY;
      velocity += (currentY - lastScrollY) * SCROLL_BOOST;
      lastScrollY = currentY;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    function tick() {
      velocity *= VELOCITY_DECAY;
      angle += BASE_SPEED + velocity;

      const track = trackRef.current;
      const trackRect = track?.getBoundingClientRect();
      const trackHeight = trackRect?.height || window.innerHeight;
      const scrollableDistance = Math.max(
        1,
        trackHeight - window.innerHeight,
      );
      const progress = Math.min(
        1,
        Math.max(0, -(trackRect?.top ?? 0) / scrollableDistance),
      );
      const transitionProgress = Math.min(
        1,
        Math.max(0, (progress - TRANSITION_START) / (1 - TRANSITION_START)),
      );

      const vw = window.innerWidth / 100;
      const vh = window.innerHeight / 100;
      const coverScale =
        Math.max(
          window.innerWidth / CARD_WIDTH_PX,
          window.innerHeight / CARD_HEIGHT_PX,
        ) * 1.15;

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const layout = layouts[i];
        const rotatedTheta = layout.theta + angle;
        const sphereX = Math.cos(rotatedTheta) * layout.radiusAtY;
        const sphereZ = Math.sin(rotatedTheta) * layout.radiusAtY;
        const depthFactor = (sphereZ + 1) / 2; // 0 far, 1 near

        const x = sphereX * RADIUS_X_VW * vw;
        const y = layout.yUnit * RADIUS_Y_VH * vh;
        const scale =
          (MIN_SCALE + depthFactor * (MAX_SCALE - MIN_SCALE)) *
          layout.sizeMul;
        const baseOpacity =
          MIN_OPACITY + depthFactor * (MAX_OPACITY - MIN_OPACITY);
        const orbitZIndex = Math.round(depthFactor * (Z_NAME - 2));

        if (i === TRANSITION_CARD_INDEX) {
          if (progress >= 1) {
            // Fully covered and scrolled past — release from `fixed` so it
            // scrolls away naturally instead of blocking everything below.
            el.style.position = "absolute";
            el.style.left = "0";
            el.style.top = `${trackHeight - window.innerHeight}px`;
            el.style.width = "100%";
            el.style.height = "100vh";
            el.style.transform = "none";
            el.style.opacity = "1";
            el.style.zIndex = String(Z_TRANSITION_MAX);
          } else {
            const lerpedX = x * (1 - transitionProgress);
            const lerpedY = y * (1 - transitionProgress);
            const lerpedScale =
              scale + (coverScale - scale) * transitionProgress;
            el.style.position = "fixed";
            el.style.left = "50%";
            el.style.top = "50%";
            el.style.width = "";
            el.style.height = "";
            el.style.transform = `translate3d(calc(-50% + ${lerpedX}px), calc(-50% + ${lerpedY}px), 0) scale(${lerpedScale})`;
            el.style.opacity = String(
              baseOpacity + (1 - baseOpacity) * transitionProgress,
            );
            el.style.zIndex = String(
              Math.round(
                orbitZIndex +
                  (Z_TRANSITION_MAX - orbitZIndex) * transitionProgress,
              ),
            );
          }
          return;
        }

        const trickleSlot = TRICKLE_INDICES.indexOf(i);
        const stagger = trickleSlot === -1 ? 0 : trickleSlot * 0.12;
        if (trickleSlot !== -1 && transitionProgress > stagger) {
          const localT = Math.min(
            1,
            (transitionProgress - stagger) / (1 - stagger),
          );
          // Converge toward the main card's center path, so these read as
          // accompanying it rather than falling independently.
          const fallX = x * (1 - localT * 0.6);
          const fallY = y + localT * (40 + trickleSlot * 10) * vh;
          const fallScale = scale * (1 + localT * 2.2);
          // Continuous at localT=0 (starts exactly at its current orbit
          // opacity — no pop), brightens to a clear peak, then fades out.
          const peakOpacity = Math.max(baseOpacity, 0.85);
          const fallOpacity =
            localT < 0.3
              ? baseOpacity + (peakOpacity - baseOpacity) * (localT / 0.3)
              : peakOpacity * (1 - (localT - 0.3) / 0.7);
          el.style.position = "fixed";
          el.style.left = "50%";
          el.style.top = "50%";
          el.style.width = "";
          el.style.height = "";
          el.style.transform = `translate3d(calc(-50% + ${fallX}px), calc(-50% + ${fallY}px), 0) scale(${fallScale})`;
          el.style.opacity = String(fallOpacity);
          el.style.zIndex = String(
            Math.round(orbitZIndex + (Z_TRICKLE_MAX - orbitZIndex) * localT),
          );
          return;
        }

        el.style.position = "absolute";
        el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`;
        el.style.opacity = String(baseOpacity);
        el.style.zIndex = String(orbitZIndex);
      });

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={trackRef}
      id="top"
      className="relative w-full"
      style={{ height: `${SCROLL_TRACK_VH}vh` }}
    >
      <div className="sticky top-0 isolate h-screen w-full bg-paper">
        <h1
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display italic text-[clamp(3rem,16vw,220px)] leading-none tracking-tight text-ink"
          style={{ zIndex: Z_NAME }}
        >
          noah oh
        </h1>

        {orbitCards.map((card, i) =>
          i === TRANSITION_CARD_INDEX || TRICKLE_INDICES.includes(i) ? (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="fixed left-1/2 top-1/2 h-16 w-12 flex-none bg-void will-change-transform"
            />
          ) : (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 h-16 w-12 flex-none bg-void shadow-[0_25px_45px_-20px_rgba(10,10,10,0.4)] will-change-transform"
            />
          ),
        )}
      </div>
    </section>
  );
}
