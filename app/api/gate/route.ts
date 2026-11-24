import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { GATE_COOKIE, GATE_DAYS, GATE_HASH, GATE_TOKEN, safeNext } from "@/lib/gate";

// The gate's form (lib/gate.ts): the right password sets the cookie and goes on to the page asked for; a wrong one goes
// back to the gate, which says so.
export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const url = new URL(safeNext(form.get("next")), request.url);

  if (createHash("sha256").update(password).digest("hex") !== GATE_HASH) {
    url.searchParams.set("gate", "wrong");
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(url, 303);
  response.cookies.set(GATE_COOKIE, GATE_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * GATE_DAYS,
  });
  return response;
}
