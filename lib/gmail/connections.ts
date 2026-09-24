import "server-only";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/admin";

export const GMAIL_PROVIDER = "gmail";

export type OAuthConnection = {
  id: string;
  provider: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null;
  connectedBy: string | null;
  connectedEmail: string | null;
  gmailSyncEnabled: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Non-secret fields from oauth_connection_status (safe for user-scoped reads). */
export type OAuthConnectionStatus = {
  provider: string;
  expiresAt: string | null;
  connectedBy: string | null;
  connectedEmail: string | null;
  gmailSyncEnabled: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: Record<string, unknown>): OAuthConnection {
  return {
    id: String(row.id),
    provider: String(row.provider),
    accessToken: String(row.access_token ?? ""),
    refreshToken: String(row.refresh_token ?? ""),
    expiresAt: (row.expires_at as string | null) ?? null,
    connectedBy: (row.connected_by as string | null) ?? null,
    connectedEmail: (row.connected_email as string | null) ?? null,
    gmailSyncEnabled: Boolean(row.gmail_sync_enabled),
    lastSyncedAt: (row.last_synced_at as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function mapStatusRow(row: Record<string, unknown>): OAuthConnectionStatus {
  return {
    provider: String(row.provider),
    expiresAt: (row.expires_at as string | null) ?? null,
    connectedBy: (row.connected_by as string | null) ?? null,
    connectedEmail: (row.connected_email as string | null) ?? null,
    gmailSyncEnabled: Boolean(row.gmail_sync_enabled),
    lastSyncedAt: (row.last_synced_at as string | null) ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

/**
 * Status for UI badges — reads the public `oauth_connection_status` view via the
 * user session (no tokens). Do not use oauth_connections here; that table is
 * service-role only.
 */
export async function getOAuthConnectionStatus(
  provider: string,
): Promise<OAuthConnectionStatus | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("oauth_connection_status")
    .select(
      "provider, expires_at, connected_by, connected_email, gmail_sync_enabled, last_synced_at, created_at, updated_at",
    )
    .eq("provider", provider)
    .maybeSingle();
  if (error) {
    // Column may be missing until migration is applied — fall back without sync fields.
    if (/gmail_sync_enabled|last_synced_at|column/i.test(error.message)) {
      const fallback = await supabase
        .from("oauth_connection_status")
        .select(
          "provider, expires_at, connected_by, connected_email, created_at, updated_at",
        )
        .eq("provider", provider)
        .maybeSingle();
      if (fallback.error) throw new Error(fallback.error.message);
      return fallback.data
        ? mapStatusRow({
            ...(fallback.data as Record<string, unknown>),
            gmail_sync_enabled: false,
            last_synced_at: null,
          })
        : null;
    }
    throw new Error(error.message);
  }
  return data ? mapStatusRow(data as Record<string, unknown>) : null;
}

/** Full tokens — service role only. Used by OAuth callback / refresh / fetchData. */
export async function getOAuthConnection(
  provider: string,
): Promise<OAuthConnection | null> {
  if (!hasServiceRole()) return null;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("oauth_connections")
    .select("*")
    .eq("provider", provider)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function upsertOAuthConnection(input: {
  provider: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null;
  connectedBy: string;
  connectedEmail: string | null;
}): Promise<void> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  // Do not touch gmail_sync_enabled / last_synced_at on reconnect.
  const { error } = await supabase.from("oauth_connections").upsert(
    {
      provider: input.provider,
      access_token: input.accessToken,
      refresh_token: input.refreshToken,
      expires_at: input.expiresAt,
      connected_by: input.connectedBy,
      connected_email: input.connectedEmail,
      updated_at: now,
    },
    { onConflict: "provider" },
  );
  if (error) throw new Error(error.message);
}

export async function updateOAuthTokens(
  provider: string,
  input: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: string | null;
  },
): Promise<void> {
  const supabase = createServiceClient();
  const patch: Record<string, unknown> = {
    access_token: input.accessToken,
    expires_at: input.expiresAt,
    updated_at: new Date().toISOString(),
  };
  if (input.refreshToken) patch.refresh_token = input.refreshToken;

  const { error } = await supabase
    .from("oauth_connections")
    .update(patch)
    .eq("provider", provider);
  if (error) throw new Error(error.message);
}

export async function setGmailSyncEnabled(
  enabled: boolean,
): Promise<OAuthConnectionStatus | null> {
  if (!hasServiceRole()) {
    throw new Error("חסר מפתח שירות לעדכון סנכרון Gmail");
  }
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("oauth_connections")
    .update({
      gmail_sync_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("provider", GMAIL_PROVIDER)
    .select(
      "provider, expires_at, connected_by, connected_email, gmail_sync_enabled, last_synced_at, created_at, updated_at",
    )
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapStatusRow(data as Record<string, unknown>) : null;
}

export async function updateGmailLastSyncedAt(
  provider: string,
  syncedAt: string,
): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("oauth_connections")
    .update({
      last_synced_at: syncedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("provider", provider);
  if (error) throw new Error(error.message);
}

export async function deleteOAuthConnection(provider: string): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("oauth_connections")
    .delete()
    .eq("provider", provider);
  if (error) throw new Error(error.message);
}

/**
 * Explicit audit row for Gmail OAuth connect/disconnect (no DB trigger on
 * oauth_connections). Uses live audit_logs columns: action, actor_id, table_name.
 */
export async function writeGmailOAuthAudit(input: {
  actorId: string;
  action: "create" | "delete";
}): Promise<void> {
  if (!hasServiceRole()) return;
  const supabase = createServiceClient();
  const { error } = await supabase.from("audit_logs").insert({
    action: input.action,
    actor_id: input.actorId,
    table_name: "oauth_connections",
  });
  if (error) {
    // Soft-fail: connection change should not abort because audit insert failed.
    console.error("gmail oauth audit_logs insert failed:", error.message);
  }
}
