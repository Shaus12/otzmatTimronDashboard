import type { AdapterStatus } from "./types";
import { getAdapter, type AdapterLookupRef } from "./registry";

const UNRECOGNIZED: AdapterStatus = {
  state: "unrecognized",
  message: "לא מזוהה — אין מתאם מקושר למערכת זו",
};

/** Resolve adapter status keyed by the systems-table row id. Always returns an entry. */
export async function getAdapterStatusesForSystems(
  systems: AdapterLookupRef[],
): Promise<Record<string, AdapterStatus>> {
  const entries = await Promise.all(
    systems.map(async (ref) => {
      const adapter = getAdapter(ref);
      if (!adapter) return [ref.id, { ...UNRECOGNIZED }] as const;
      const status = await adapter.checkStatus();
      return [ref.id, status] as const;
    }),
  );

  return Object.fromEntries(entries);
}
