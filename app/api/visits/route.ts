import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { store } from "@/lib/store";

export const dynamic = "force-dynamic";

// How many people have stopped by. The footer asks once per page load.
export async function GET() {
  try {
    return NextResponse.json({ visits: await store.visits() });
  } catch {
    return NextResponse.json({ error: "Couldn't load the count." }, { status: 503 });
  }
}

// A browser's first visit adds one. Each address counts at most once an hour,
// so nobody can run the number up by clearing their storage.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `visit:${createHash("sha256").update(ip).digest("hex").slice(0, 24)}`;
  try {
    const visits = (await store.allow(key, 60 * 60)) ? await store.countVisit() : await store.visits();
    return NextResponse.json({ visits });
  } catch {
    return NextResponse.json({ error: "Couldn't count this visit." }, { status: 503 });
  }
}
