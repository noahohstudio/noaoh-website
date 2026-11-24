// The live site's password (Noah, Nov 24: "can we password protect the website right now, live? Password is "password"
// all lowercase. One line about under construction, message me privately for password/case studies, with a link to my
// linkedin"). proxy.ts shows the gate to anyone without the cookie; app/api/gate/route.ts checks the password and sets it.
// Only on the live site: the local dev server, and with it the desk, is never asked.
// A soft lock, not security: the repo is public, so only the password's SHA-256 is kept here, and the cookie holds a
// token made from it.
import { site } from "@/content/site";

export const GATE_COOKIE = "noaoh-gate";
export const GATE_HASH = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"; // sha256 of the password
export const GATE_TOKEN = "bbdb48344bdd89cfbbba44283e9d27202b93e4ab3bf4662a7ec5d78d10714360"; // sha256("noaoh-gate:" + it)
export const GATE_DAYS = 30;

// Off, and kept for later (Noah, Nov 24: "Let's save that for now, but also unblock the site. Anyone entering should be
// able to see my case studies"). To put it back on the live site, set GATE_LIVE to true and push. To see it without
// that, run a production build with NOAOH_GATE=on (npx next start), which only that server reads.
const GATE_LIVE = false;

export const gateOn = () => process.env.NODE_ENV === "production" && (GATE_LIVE || process.env.NOAOH_GATE === "on");

// Where to send someone once they're in: a path on this site only, never another one ("//elsewhere")
export function safeNext(value: unknown) {
  const next = typeof value === "string" ? value : "/";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// What a wrong password gets told, one more each try (Noah, Nov 24: "a funny interaction when you try to input
// something, and its incorrect"); the last one stays
const NOPES = ["That's not it.", "Still not it.", "Not that one either.", "Just message me on LinkedIn. I'll send it."];

// The gate itself: one page on its own, with nothing of the site behind it, in the site's own language (Noah, Nov 24:
// "can we have it in my visual language? Especially the buttons"): the line, and under it the password in the nav's
// frosted glass, all centered on the screen, the line one size down from the statement size, in the lead style, as
// About's bio (Noah, Nov 24: "Center everything and reduce it so that it's a little smaller"; the five sizes have
// nothing between the two). No name at the top, "Password" inside the pill, and the reply under it fading away slowly
// after a couple of seconds (Noah, Nov 24: "remove Noah Oh at the very top. Let's also put password as a placeholder
// inside the pill, and let's make the little caption at the bottom fade after a couple seconds, like maybe 2 seconds,
// 3 seconds. It fades very slowly"). Everything you can click turns its letters over under the pointer, as on the site
// (components/Flip.tsx), and a wrong password shakes its head while a wave of upside-down letters runs through the line
// (the ripple easter egg, Flip.module.css). Values from app/tokens.css, globals.css and components/v2/type/text.css.
export function gatePage(next: string, wrong: boolean) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#ffffff">
<title>${escape(site.title)}</title>
<meta name="description" content="${escape(site.description)}">
<meta property="og:title" content="${escape(site.title)}">
<meta property="og:description" content="${escape(site.description)}">
<meta property="og:image" content="https://${site.domain}/opengraph-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&display=swap">
<style>
:root {
  --bg: #ffffff; --ink: #000000; --muted: #737373; --placeholder: #cfcfcf;
  --glass-fill: linear-gradient(180deg, rgb(255 255 255 / 0.72), rgb(238 245 255 / 0.5));
  --glass-blur: blur(24px) saturate(1.8);
  --glass-edge: rgb(255 255 255 / 0.75);
  --glass-shadow: inset 0 1px 0 rgb(255 255 255 / 0.9), inset 0 -1px 0 rgb(0 0 0 / 0.04), 0 1px 2px rgb(0 0 0 / 0.05), 0 10px 36px rgb(0 0 0 / 0.08);
  --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.8 -0.68'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  --font: "Geist", "Helvetica Neue", Arial, sans-serif;
  --size-title: clamp(1.25rem, 1.1rem + 0.4vw, 1.5rem); --leading-title: 1.25;
  --size-body: 1rem; --size-small: 0.8125rem; --tracking-body: -0.01em; --leading-body: 1.5;
  --space-1: 4px; --space-2: 8px; --space-4: 16px; --space-6: 32px; --space-9: 96px;
  --gutter: clamp(16px, 3.6vw, 64px); --radius-pill: 999px;
  --ease: cubic-bezier(0.16, 1, 0.3, 1); --ease-flip: cubic-bezier(0.65, 0, 0.35, 1); --dur-fast: 150ms; --enter-step: 70ms;
}
* { box-sizing: border-box; margin: 0; }
html, body { background: var(--bg); color: var(--ink); }
body {
  display: grid; place-items: center; min-height: 100svh; padding: 0 var(--gutter); text-align: center;
  font-family: var(--font); font-size: var(--size-body); line-height: var(--leading-body); letter-spacing: var(--tracking-body);
  -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;
}
body::after { content: ""; position: fixed; inset: 0; z-index: 10; background-image: var(--grain); opacity: 0.06; pointer-events: none; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
main { display: grid; justify-items: center; gap: var(--space-6); width: 100%; padding: var(--space-9) 0; }
.lead { max-width: 18em; font-size: var(--size-title); line-height: var(--leading-title); text-wrap: balance; }
/* Its letters are drawn one by one, which a text underline doesn't reach, so the line is drawn under the word instead */
a {
  color: inherit; text-decoration: none; outline-offset: 4px;
  background: linear-gradient(var(--line, rgb(0 0 0 / 0.25)), var(--line, rgb(0 0 0 / 0.25))) 0 calc(100% - 0.06em) / 100% max(1px, 0.025em) no-repeat;
}
a:hover, a:focus-visible { --line: var(--ink); }
.ask { display: grid; justify-items: center; gap: var(--space-1); width: 100%; font-size: var(--size-small); line-height: 1.45; }
.field {
  display: flex; align-items: center; gap: var(--space-2); width: min(100%, 22rem); height: 44px; padding: 0 var(--space-1) 0 var(--space-4);
  border: 1px solid var(--glass-edge); border-radius: var(--radius-pill); background: var(--glass-fill);
  -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur); box-shadow: var(--glass-shadow);
}
.field input {
  flex: 1; min-width: 0; height: 100%; padding: 0; border: 0; background: none; outline: none;
  font: inherit; letter-spacing: inherit; color: var(--ink); caret-color: var(--ink);
}
.field input::placeholder { color: var(--muted); }
.field:focus-within { box-shadow: var(--glass-shadow), 0 0 0 1px rgb(0 0 0 / 0.12); }
.field button {
  height: 36px; padding: 0 var(--space-4); border: 0; border-radius: var(--radius-pill); background: none; cursor: pointer;
  font: inherit; font-weight: 500; letter-spacing: inherit; color: var(--ink);
}
.field button:focus-visible { outline: 1px solid var(--ink); outline-offset: -4px; }
.nope { min-height: 1.45em; color: var(--muted); }
/* Each reply holds for 2 seconds, then fades away over 3 (opacity only, so it does for everyone) */
.nope[data-said] { animation: gone 3000ms var(--ease-flip) 2000ms forwards; }
/* Letters, as components/Flip.tsx draws them: words never break, and a letter mirrors in place through its own ink */
.word { white-space: nowrap; }
.char { display: inline-block; }
.glyph { display: inline-block; transform-origin: 50% var(--axis, 59%); }
a .char:hover .glyph, button .char:hover .glyph { transform: scaleY(-1); }
@media (prefers-reduced-motion: no-preference) {
  .lead, .ask { animation: soft 600ms var(--ease) backwards; }
  .ask { animation-delay: var(--enter-step); }
  [data-ripple] .glyph { animation: ripple 220ms steps(1, end) var(--d, 0ms); }
  .field[data-no] { animation: no 420ms linear; }
}
@keyframes soft { from { opacity: 0; filter: blur(10px); } }
@keyframes gone { to { opacity: 0; } }
@keyframes ripple { from { transform: scaleY(-1); } to { transform: none; } }
@keyframes no { 0%, 100% { translate: 0; } 15% { translate: -8px; } 35% { translate: 7px; } 55% { translate: -5px; } 75% { translate: 3px; } }
</style>
</head>
<body>
<main>
<p class="lead" data-letters>This site is under construction. Message me privately on <a href="${escape(site.links.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> for the password or my case studies.</p>
<form class="ask" method="post" action="/api/gate" novalidate>
<label class="sr" for="password">Password</label>
<div class="field">
<input type="hidden" name="next" value="${escape(next)}">
<input id="password" type="password" name="password" placeholder="Password" autocomplete="current-password" spellcheck="false" autofocus>
<button type="submit" data-letters>Enter</button>
</div>
<p class="nope" role="status" aria-live="polite" data-letters>${wrong ? escape(NOPES[0]) : ""}</p>
</form>
</main>
<script>
(function () {
  var NOPES = ${JSON.stringify(NOPES)};
  var tries = ${wrong ? 1 : 0};
  var still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Each word read whole by a screen reader, its letters drawn one by one for the eye
  function letters(root) {
    var walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\\s+)/).forEach(function (chunk) {
        if (!chunk) return;
        if (/^\\s+$/.test(chunk)) return frag.appendChild(document.createTextNode(chunk));
        var word = document.createElement("span"), said = document.createElement("span"), drawn = document.createElement("span");
        word.className = "word"; said.className = "sr"; said.textContent = chunk; drawn.setAttribute("aria-hidden", "true");
        Array.from(chunk).forEach(function (c) {
          var ch = document.createElement("span"), g = document.createElement("span");
          ch.className = "char"; g.className = "glyph"; g.textContent = c; ch.appendChild(g); drawn.appendChild(ch);
        });
        word.appendChild(said); word.appendChild(drawn); frag.appendChild(word);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  // Where each letter mirrors: through the middle of its own ink, so it turns over in place (lib/mirror.ts)
  var ctx = document.createElement("canvas").getContext("2d"), cache = {};
  function axes(root) {
    if (!ctx) return;
    root.querySelectorAll(".glyph").forEach(function (el) {
      var s = getComputedStyle(el), size = parseFloat(s.fontSize);
      var line = s.lineHeight === "normal" ? null : parseFloat(s.lineHeight) / size;
      var font = s.fontStyle + " " + s.fontWeight + " 1000px " + s.fontFamily, key = font + "|" + line + "|" + el.textContent;
      var ink = cache[key];
      if (!ink) {
        ctx.font = font;
        var m = ctx.measureText(el.textContent), a = m.fontBoundingBoxAscent / 1000, d = m.fontBoundingBoxDescent / 1000;
        var base = ((line == null ? a + d : line) - a - d) / 2 + a, up = m.actualBoundingBoxAscent / 1000, dn = m.actualBoundingBoxDescent / 1000;
        ink = cache[key] = base - (up - dn) / 2;
      }
      el.style.setProperty("--axis", ink.toFixed(4) + "em");
    });
  }

  // A wave of upside-down letters, one after another, each righting itself after a beat
  function ripple(root, step) {
    root.removeAttribute("data-ripple");
    root.querySelectorAll(".glyph").forEach(function (g, i) { g.style.setProperty("--d", i * step + "ms"); });
    void root.offsetWidth;
    root.setAttribute("data-ripple", "");
  }

  var form = document.querySelector("form"), field = document.querySelector(".field"), input = document.getElementById("password");
  var lead = document.querySelector(".lead"), nope = document.querySelector(".nope");
  document.querySelectorAll("[data-letters]").forEach(letters);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { requestAnimationFrame(function () { axes(document); }); });

  function no() {
    tries += 1;
    nope.textContent = NOPES[Math.min(tries, NOPES.length) - 1];
    letters(nope); axes(nope);
    nope.removeAttribute("data-said"); void nope.offsetWidth; nope.setAttribute("data-said", "");
    input.value = ""; input.focus();
    if (still) return;
    field.removeAttribute("data-no"); void field.offsetWidth; field.setAttribute("data-no", "");
    ripple(lead, 12); ripple(nope, 30);
  }
  if (tries) setTimeout(function () { tries -= 1; no(); }, 400);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!input.value) return no();
    fetch(form.action, { method: "POST", body: new FormData(form), headers: { accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (r) { r.ok ? location.replace(r.next) : no(); })
      .catch(function () { form.submit(); });
  });
})();
</script>
</body>
</html>`;
}
