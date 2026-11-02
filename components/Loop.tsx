"use client";

import { useEffect, useRef, useState } from "react";
import type { Media } from "@/content/projects";
import styles from "./Loop.module.css";

const HEVC = 'video/mp4; codecs="hvc1"';

// Replay, Noah's (Oct 26): never a cut. The loop slows quickly, the frame it slowed on fades into
// the first, and it eases back up to speed. A video slowed down shows fewer frames a second, so while
// it slows its frames are blended into one another on the still above it, and they melt rather than
// step; it starts again at half speed, where the steps don't show (Noah: "maybe some sort of smoothing").
const REPLAY = { slowest: 0.3, restart: 0.5, slow: 340, fade: 450, rise: 600, blend: 0.35 };
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

// A playback rate from one speed to another over a time. The rate changes in small steps, not every frame,
// since each change can make a video catch its breath; each frame can also do something of its own.
function ramp(video: HTMLVideoElement, from: number, to: number, ms: number, ease: (t: number) => number, each?: () => void) {
  return new Promise<void>((done) => {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const rate = from + (to - from) * ease(t);
      if (Math.abs(rate - video.playbackRate) >= 0.04 || t === 1) video.playbackRate = rate;
      each?.();
      if (t < 1) requestAnimationFrame(step);
      else done();
    };
    requestAnimationFrame(step);
  });
}

// A muted loop that plays only while it's on screen, and from its first frame each time it comes into
// view (Noah, Oct 26: "whenever we get to a loop, or leave then revisit it, it should be playing from the
// start"): it waits until it's half in view, and once it has left the screen it goes back to the start.
// A `once` piece also rests on its last frame when it ends. With reduced motion neither plays on its
// own, and each rests on its poster or its own still (Media.module.css).
// A small glass control at the top right pauses and plays it, after Rachel's: anything that moves
// for more than a few seconds can be stopped. A loop paused there stays paused until it's played
// again, and with reduced motion it's how a visitor chooses to watch. Beside it, the same pill
// replays it from its first frame. Cards leave both out, since a whole card is one link. A row of loops
// that play as one has a single pair for the row instead (RowControls.tsx), which sends each loop
// "loop:pause", "loop:play" or "loop:replay".
// A transparent loop is offered by engine, not by what the browser says it can play: Safari, and
// every browser on an iPhone, show alpha only from the HEVC `.mov`, and the rest only from the
// VP9 WebM, though each may claim to play the other. The plain MP4 comes last, for anything else.
export function Loop({ media, controls = true }: { media: Media; controls?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [apple, setApple] = useState<boolean>(); // WebKit or not, known once mounted
  const [playing, setPlaying] = useState(false);
  const held = useRef(false); // paused with the control
  const chosen = useRef(false); // played with the control, so it plays even with reduced motion
  const still = useRef<HTMLCanvasElement>(null); // the frame a replay fades from
  const replaying = useRef(false);

  useEffect(() => {
    if (media.mov) setApple(navigator.vendor.startsWith("Apple"));
  }, [media.mov]);

  // A transparent loop waits for its engine, so the wrong file never starts loading
  const ready = !media.mov || apple !== undefined;

  useEffect(() => {
    const video = ref.current;
    if (!video || !ready) return;
    video.muted = true; // browsers start a loop on their own only when it's muted
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    const allowed = () => !held.current && (!calm.matches || chosen.current);
    let seen = false;
    let fresh = true; // on its first frame, waiting to be seen
    const update = () => {
      if (!seen || !allowed()) video.pause();
      else if (!media.once && !fresh) video.play().catch(() => {});
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        seen = entry.isIntersecting;
        if (!seen && !fresh) {
          fresh = true;
          video.currentTime = 0; // out of sight, back to its first frame for next time
        }
        // It waits until it's half in view (or fills half the screen), so it's seen from its first frame
        const half =
          entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= (entry.rootBounds?.height ?? innerHeight) * 0.5;
        if (fresh && half && allowed()) {
          fresh = false;
          video.play().catch(() => {});
        }
        update();
      },
      { threshold: [0, 0.25, 0.5] },
    );
    observer.observe(video);
    calm.addEventListener("change", update);
    return () => {
      observer.disconnect();
      calm.removeEventListener("change", update);
    };
  }, [ready, media.once]);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      held.current = false;
      chosen.current = true;
      video.play().catch(() => {});
    } else {
      held.current = true;
      video.pause();
    }
  };

  const replay = async () => {
    const video = ref.current;
    const canvas = still.current;
    if (!video || !canvas || replaying.current || !video.videoWidth) return;
    replaying.current = true;
    held.current = false;
    chosen.current = true;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      // The still above the loop shows it from here on: first live, then held
      const pen = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.style.objectFit = getComputedStyle(video).objectFit;
      pen?.drawImage(video, 0, 0);
      canvas.style.opacity = "1";
      // Slow down, if it's moving, each new frame blended into the last so the slower frames don't stutter
      if (!video.paused && !calm && pen) {
        pen.globalAlpha = REPLAY.blend;
        await ramp(video, video.playbackRate, REPLAY.slowest, REPLAY.slow, easeOut, () => pen.drawImage(video, 0, 0));
        pen.globalAlpha = 1;
      }
      // Hold that frame above, go back to the first underneath, and fade from one to the other
      video.currentTime = 0;
      await new Promise((resolve) => video.addEventListener("seeked", resolve, { once: true }));
      video.playbackRate = calm ? 1 : REPLAY.restart;
      video.play().catch(() => {});
      await canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: REPLAY.fade, easing: "ease-in-out", fill: "forwards" }).finished;
      canvas.style.opacity = "0";
      // And ease back up to speed
      if (!calm) await ramp(video, REPLAY.restart, 1, REPLAY.rise, easeInOut);
    } finally {
      video.playbackRate = 1;
      canvas.getAnimations().forEach((a) => a.cancel());
      replaying.current = false;
    }
  };

  // The row's control, when this loop is one of a row that plays as one
  const replayNow = useRef(replay);
  replayNow.current = replay;
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const pause = () => {
      held.current = true;
      video.pause();
    };
    const play = () => {
      held.current = false;
      chosen.current = true;
      video.play().catch(() => {});
    };
    const again = () => replayNow.current();
    video.addEventListener("loop:pause", pause);
    video.addEventListener("loop:play", play);
    video.addEventListener("loop:replay", again);
    return () => {
      video.removeEventListener("loop:pause", pause);
      video.removeEventListener("loop:play", play);
      video.removeEventListener("loop:replay", again);
    };
  }, []);

  const offer: [string | undefined, string][] = !media.mov
    ? [
        [media.video, "video/mp4"],
        [media.webm, "video/webm"],
      ]
    : ready
      ? [apple ? [media.mov, HEVC] : [media.webm, "video/webm"], [media.video, "video/mp4"]]
      : [];
  const sources = offer.filter((source): source is [string, string] => Boolean(source[0]));

  return (
    <>
      <video
        ref={ref}
        muted
        loop={!media.once}
        playsInline
        preload={media.poster ? "none" : "metadata"}
        poster={media.poster}
        aria-label={media.alt}
        data-playing={playing || undefined}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {sources.map(([src, type]) => (
          <source key={src} src={src} type={type} />
        ))}
      </video>
      <canvas ref={still} className={styles.still} aria-hidden="true" />
      {controls && <LoopControls playing={playing} onToggle={toggle} onReplay={replay} />}
    </>
  );
}

// Replay, then pause and play: the pair of glass pills, for one loop or for a row of them
export function LoopControls({ playing, onToggle, onReplay }: { playing: boolean; onToggle: () => void; onReplay: () => void }) {
  return (
    <>
      <button type="button" className={`${styles.control} ${styles.replay}`} onClick={onReplay} aria-label="Replay">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
      <button type="button" className={styles.control} onClick={onToggle} aria-label={playing ? "Pause" : "Play"}>
        <svg viewBox="0 0 10 10" aria-hidden="true">
          {playing ? (
            <path d="M2 1.5h2v7H2zM6 1.5h2v7H6z" />
          ) : (
            <path d="M2.5 1.4v7.2a.4.4 0 0 0 .6.35l6-3.6a.4.4 0 0 0 0-.7l-6-3.6a.4.4 0 0 0-.6.35z" />
          )}
        </svg>
      </button>
    </>
  );
}
