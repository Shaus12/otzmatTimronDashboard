import type { SystemCategory } from "@/lib/data/types";
import type { AdapterStatus, FetchDataOptions, SourceAdapter } from "./types";

const DEFAULT_MESSAGE = "מקור מדומה — אין חיבור חי עדיין";

export function createMockAdapter<T>(config: {
  id: string;
  name: string;
  category: SystemCategory;
  lastSynced?: string;
  message?: string;
  rows: T[];
}): SourceAdapter<T> {
  const status: AdapterStatus = {
    state: "mock",
    lastSynced: config.lastSynced ?? "2026-09-20T08:30:00.000Z",
    message: config.message ?? DEFAULT_MESSAGE,
  };

  return {
    id: config.id,
    name: config.name,
    category: config.category,
    async checkStatus() {
      return { ...status };
    },
    async fetchData(_options?: FetchDataOptions) {
      return [...config.rows];
    },
  };
}
