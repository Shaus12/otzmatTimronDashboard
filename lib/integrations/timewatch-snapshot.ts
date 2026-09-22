import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { localSnapshotsEnabled, parseTimewatchSnapshot } from "./timewatch-schema";
import type { TimewatchSnapshot } from "./timewatch-schema";

export type SnapshotResult =
  | { state: "imported"; snapshot: TimewatchSnapshot }
  | { state: "unavailable" | "error"; snapshot: null };

/** Explicit local-development opt-in; real data is never baked into production builds. */
export async function readTimewatchSnapshot(): Promise<SnapshotResult> {
  if (!localSnapshotsEnabled(process.env)) return { state: "unavailable", snapshot: null };
  try {
    const raw = await readFile(join(process.cwd(), ".local-data/timewatch.json"), "utf8");
    return { state: "imported", snapshot: parseTimewatchSnapshot(JSON.parse(raw)) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { state: "unavailable", snapshot: null };
    return { state: "error", snapshot: null };
  }
}
