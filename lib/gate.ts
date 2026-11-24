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

export const gateOn = () => process.env.NODE_ENV === "production";

// Where to send someone once they're in: a path on this site only, never another one ("//elsewhere")
export function safeNext(value: unknown) {
  const next = typeof value === "string" ? value : "/";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// The gate itself: one page, on its own, in the site's type and tokens (app/tokens.css), with nothing of the site behind it
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
  --font: "Geist", "Helvetica Neue", Arial, sans-serif;
  --size-body: 1rem; --size-small: 0.8125rem; --tracking-body: -0.01em; --leading-body: 1.5;
  --space-2: 8px; --space-3: 12px; --space-5: 24px; --space-6: 32px;
  --gutter: clamp(16px, 3.6vw, 64px); --radius-pill: 999px; --dur-fast: 150ms;
}
* { box-sizing: border-box; margin: 0; }
html, body { background: var(--bg); color: var(--ink); }
body {
  min-height: 100svh; display: grid; align-content: center; padding: var(--gutter);
  font: var(--weight, 400) var(--size-body) / var(--leading-body) var(--font); letter-spacing: var(--tracking-body);
  -webkit-font-smoothing: antialiased;
}
.name { position: fixed; top: var(--gutter); left: var(--gutter); font-size: var(--size-small); }
main { max-width: 34rem; display: grid; gap: var(--space-5); }
a { color: inherit; text-decoration: underline; text-decoration-color: var(--placeholder); text-underline-offset: 0.2em; transition: text-decoration-color var(--dur-fast); }
a:hover, a:focus-visible { text-decoration-color: currentColor; }
form { display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center; font-size: var(--size-small); }
input, button { font: inherit; letter-spacing: inherit; color: inherit; border-radius: var(--radius-pill); height: 36px; }
input { flex: 1 1 14rem; max-width: 18rem; padding: 0 var(--space-3); border: 1px solid var(--placeholder); background: var(--bg); outline: none; transition: border-color var(--dur-fast); }
input:focus { border-color: var(--ink); }
button { padding: 0 var(--space-5); border: 0; background: var(--ink); color: var(--bg); cursor: pointer; font-weight: 500; }
.wrong { font-size: var(--size-small); color: var(--muted); }
</style>
</head>
<body>
<p class="name">noah oh</p>
<main>
<p>This site is under construction. Message me privately on <a href="${escape(site.links.linkedin)}" target="_blank" rel="noopener">LinkedIn</a> for the password or my case studies.</p>
<form method="post" action="/api/gate">
<input type="hidden" name="next" value="${escape(next)}">
<input type="password" name="password" placeholder="Password" aria-label="Password" autocomplete="current-password" required autofocus>
<button type="submit">Enter</button>
</form>${wrong ? `\n<p class="wrong" role="alert">That's not the password.</p>` : ""}
</main>
</body>
</html>`;
}
