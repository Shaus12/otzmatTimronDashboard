import { MockDataStore } from "./mock-store";
import { SupabaseDataStore } from "./supabase-store";
import type { DataStore } from "./store";

function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Prefer Supabase when env is configured; otherwise fall back to mock data. */
export async function getDataStore(): Promise<DataStore> {
  if (hasSupabaseEnv()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    return new SupabaseDataStore(supabase);
  }
  return new MockDataStore();
}

/**
 * Service-role store for unattended jobs (cron). Bypasses RLS / no user session.
 * Falls back to mock when Supabase service role is not configured.
 */
export async function getServiceDataStore(): Promise<DataStore> {
  if (hasSupabaseEnv()) {
    const { createServiceClient, hasServiceRole } = await import(
      "@/lib/supabase/admin"
    );
    if (hasServiceRole()) {
      return new SupabaseDataStore(createServiceClient());
    }
  }
  return new MockDataStore();
}

export type { DataStore } from "./store";
export type * from "./types";
