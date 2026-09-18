import { MockDataStore } from "./mock-store";
import type { DataStore } from "./store";

let store: DataStore | null = null;

/** App-wide data access. Today: MockDataStore. Later: SupabaseDataStore. */
export function getDataStore(): DataStore {
  if (!store) {
    store = new MockDataStore();
  }
  return store;
}

export type { DataStore } from "./store";
export type * from "./types";
