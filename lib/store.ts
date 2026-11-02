import { promises as fs } from "node:fs";
import path from "node:path";

/*
  Storage for the end credits and the visit counter.

  In production, connect an Upstash Redis database (Vercel: Storage → Upstash
  for Redis). Its env vars are picked up automatically. Locally, everything is
  kept in .data/store.json, which git ignores.
*/

export type Credit = {
  id: string;
  name: string;
  role: string;
  note?: string;
  createdAt: number;
};

const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const MAX_CREDITS = 500;

type Store = {
  list(limit: number): Promise<Credit[]>;
  add(credit: Credit): Promise<void>;
  remove(id: string): Promise<boolean>;
  countVisit(): Promise<number>;
  visits(): Promise<number>;
  // True if this key hasn't been seen in the last `seconds`.
  allow(key: string, seconds: number): Promise<boolean>;
};

/* Upstash Redis over its REST API, no client library needed */
async function redis<T = unknown>(command: (string | number)[]): Promise<T> {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis responded ${res.status}`);
  const data = (await res.json()) as { result: T };
  return data.result;
}

const redisStore: Store = {
  async list(limit) {
    const rows = await redis<string[]>(["LRANGE", "credits", 0, limit - 1]);
    return rows.map((row) => JSON.parse(row) as Credit);
  },
  async add(credit) {
    await redis(["LPUSH", "credits", JSON.stringify(credit)]);
    await redis(["LTRIM", "credits", 0, MAX_CREDITS - 1]);
  },
  async remove(id) {
    const rows = await redis<string[]>(["LRANGE", "credits", 0, -1]);
    const row = rows.find((r) => (JSON.parse(r) as Credit).id === id);
    if (!row) return false;
    await redis(["LREM", "credits", 1, row]);
    return true;
  },
  async countVisit() {
    return Number(await redis(["INCR", "visits"]));
  },
  async visits() {
    return Number((await redis<string | null>(["GET", "visits"])) ?? 0);
  },
  async allow(key, seconds) {
    return (await redis(["SET", `limit:${key}`, 1, "EX", seconds, "NX"])) === "OK";
  },
};

/* Local JSON file. On a serverless host without Redis this falls back to /tmp,
   which works but resets whenever the server restarts. */
const FILE = process.env.VERCEL
  ? path.join("/tmp", "noaoh-store.json")
  : path.join(process.cwd(), ".data", "store.json");

type FileData = { credits: Credit[]; visits: number };
const limits = new Map<string, number>();

async function read(): Promise<FileData> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as FileData;
  } catch {
    return { credits: [], visits: 0 };
  }
}

async function write(data: FileData) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}

const fileStore: Store = {
  async list(limit) {
    return (await read()).credits.slice(0, limit);
  },
  async add(credit) {
    const data = await read();
    data.credits = [credit, ...data.credits].slice(0, MAX_CREDITS);
    await write(data);
  },
  async remove(id) {
    const data = await read();
    const before = data.credits.length;
    data.credits = data.credits.filter((c) => c.id !== id);
    await write(data);
    return data.credits.length < before;
  },
  async countVisit() {
    const data = await read();
    data.visits += 1;
    await write(data);
    return data.visits;
  },
  async visits() {
    return (await read()).visits;
  },
  async allow(key, seconds) {
    const now = Date.now();
    const until = limits.get(key) ?? 0;
    if (until > now) return false;
    limits.set(key, now + seconds * 1000);
    return true;
  },
};

export const store: Store = REDIS_URL && REDIS_TOKEN ? redisStore : fileStore;
