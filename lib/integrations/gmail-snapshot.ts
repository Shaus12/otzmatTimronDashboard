import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { localSnapshotsEnabled } from "./timewatch-schema";
import { parseGmailSnapshot, type GmailSnapshot } from "./gmail-schema";

export async function readGmailSnapshot(): Promise<{
  state: "imported" | "unavailable" | "error"; snapshot: GmailSnapshot | null;
}> {
  if (!localSnapshotsEnabled(process.env)) return { state: "unavailable", snapshot: null };
  try {
    const raw = await readFile(join(process.cwd(), ".local-data/gmail.json"), "utf8");
    return { state: "imported", snapshot: parseGmailSnapshot(JSON.parse(raw)) };
  } catch (error) {
    return { state: (error as NodeJS.ErrnoException).code === "ENOENT" ? "unavailable" : "error", snapshot: null };
  }
}
