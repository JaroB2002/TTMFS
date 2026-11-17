import { mkdir, readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

type GlobalDb = {
  __ttmfsPool?: pg.Pool;
  __ttmfsPglite?: Promise<PGlite>;
};

const globalDb = globalThis as typeof globalThis & GlobalDb;

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    globalDb.__ttmfsPool ??= new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
    });
    return (await globalDb.__ttmfsPool.query(text, params)).rows as T[];
  }

  globalDb.__ttmfsPglite ??= startLocal().catch((error: unknown) => {
    globalDb.__ttmfsPglite = undefined;
    throw error;
  });

  return (await (await globalDb.__ttmfsPglite).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  // Persist locally so hot reloads / separate route modules still share data.
  await mkdir("data/ttmfs", { recursive: true });
  const db = new PGlite("data/ttmfs");
  const files = (await readdir("migrations").catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}
