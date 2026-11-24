import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { GATE_COOKIE, GATE_DAYS, GATE_HASH, GATE_TOKEN, safeNext } from "@/lib/gate";

// The gate's form (lib/gate.ts). The gate's own script asks for JSON, so a wrong password can shake its head in place;
// without it, the form posts plainly, and a right password goes on to the page asked for while a wrong one goes back to
// the gate, which says so.
export async function POST(request: Request) {
  const form = await request.formData();
  const json = (request.headers.get("accept") ?? "").includes("application/json");
  const next = safeNext(form.get("next"));
  const url = new URL(next, request.url);
  const ok = createHash("sha256").update(String(form.get("password") ?? "")).digest("hex") === GATE_HASH;

  if (!ok) {
    if (json) return NextResponse.json({ ok: false }); // the gate's own answer, not an error in the console
    url.searchParams.set("gate", "wrong");
    return NextResponse.redirect(url, 303);
  }

  const response = json ? NextResponse.json({ ok: true, next }) : NextResponse.redirect(url, 303);
  response.cookies.set(GATE_COOKIE, GATE_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * GATE_DAYS,
  });
  return response;
}
