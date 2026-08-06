import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";

/**
 * Dev-only durable share store when Firebase Admin credentials are missing.
 * Files live under .data/shared_plans/ (gitignored).
 */

const DIR = path.join(process.cwd(), ".data", "shared_plans");

async function ensureDir() {
  await fs.mkdir(DIR, { recursive: true });
}

export async function saveLocalSharedPlan(payload: {
  data: any;
  locale: string;
}): Promise<string> {
  await ensureDir();
  const id = randomBytes(8).toString("hex");
  const file = path.join(DIR, `${id}.json`);
  await fs.writeFile(
    file,
    JSON.stringify(
      {
        ...payload,
        createdAt: new Date().toISOString(),
        views: 0,
        localFallback: true,
      },
      null,
      2
    ),
    "utf8"
  );
  return id;
}

export async function readLocalSharedPlan(id: string): Promise<any | null> {
  try {
    const file = path.join(DIR, `${id}.json`);
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
