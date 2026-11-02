import { createHash, randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { visitorRoles } from "@/content/site";
import { store, type Credit } from "@/lib/store";

export const dynamic = "force-dynamic";

// Control characters, zero-width characters, and text-direction overrides.
// Built from a string so the bundler never sees a raw line separator.
const INVISIBLE = new RegExp("[\\u0000-\\u001f\\u007f\\u200b-\\u200f\\u2028-\\u202e\\u2060-\\u206f]", "g");

const clean = (value: unknown, max: number) =>
  typeof value === "string"
    ? value
        .normalize("NFC")
        .replace(INVISIBLE, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";

const clientKey = (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
};

export async function GET() {
  try {
    const [credits, visits] = await Promise.all([store.list(200), store.visits()]);
    return NextResponse.json({ credits, visits });
  } catch {
    return NextResponse.json({ error: "Couldn't load the credits." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send the form as JSON." }, { status: 400 });
  }

  // Bots fill in every field, people never see this one.
  if (clean(body.website, 200)) {
    return NextResponse.json({ credit: null }, { status: 201 });
  }

  const name = clean(body.name, 40);
  const note = clean(body.note, 140);
  const role = visitorRoles.includes(body.role as (typeof visitorRoles)[number])
    ? (body.role as string)
    : visitorRoles[0];

  if (name.length < 2) {
    return NextResponse.json({ error: "Add your name to sign the credits." }, { status: 400 });
  }

  try {
    if (!(await store.allow(clientKey(req), 30))) {
      return NextResponse.json(
        { error: "You just signed. Wait 30 seconds before signing again." },
        { status: 429 },
      );
    }
    const credit: Credit = {
      id: randomUUID(),
      name,
      role,
      ...(note ? { note } : {}),
      createdAt: Date.now(),
    };
    await store.add(credit);
    return NextResponse.json({ credit }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Your name wasn't saved. Try again in a minute." },
      { status: 503 },
    );
  }
}

// Remove an entry: DELETE /api/credits?id=… with "Authorization: Bearer <CREDITS_ADMIN_TOKEN>"
export async function DELETE(req: NextRequest) {
  const token = process.env.CREDITS_ADMIN_TOKEN;
  if (!token || req.headers.get("authorization") !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Add ?id= for the entry to remove." }, { status: 400 });
  const removed = await store.remove(id);
  return NextResponse.json({ removed }, { status: removed ? 200 : 404 });
}
