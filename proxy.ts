import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, GATE_TOKEN, gateOn, gatePage } from "@/lib/gate";

// The live site's password gate (lib/gate.ts; Noah, Nov 24). Anyone without the cookie gets the gate in place of a page,
// at the same address, and a plain 401 for anything else (a video, a picture, an API call), so the work stays behind it too.
export function proxy(request: NextRequest) {
  if (!gateOn()) return NextResponse.next();
  if (request.cookies.get(GATE_COOKIE)?.value === GATE_TOKEN) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/api/gate") return NextResponse.next();

  const page = request.method === "GET" && (request.headers.get("accept") ?? "").includes("text/html");
  if (!page) return new NextResponse("Password required", { status: 401, headers: { "cache-control": "no-store" } });

  const wrong = searchParams.get("gate") === "wrong";
  const rest = new URLSearchParams(searchParams);
  rest.delete("gate");
  const next = pathname + (rest.size ? `?${rest}` : "");
  return new NextResponse(gatePage(next, wrong), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
  });
}

export const config = {
  // Everything but the files the gate itself needs: the framework's own, the icon and the link preview
  matcher: ["/((?!_next/static|_next/image|icon\\.svg|opengraph-image|twitter-image|favicon\\.ico).*)"],
};
