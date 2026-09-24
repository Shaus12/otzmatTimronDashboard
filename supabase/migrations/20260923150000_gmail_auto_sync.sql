-- Gmail automatic expense sync controls.
-- Apply manually in the Supabase SQL editor.
-- App also needs CRON_SECRET in env (not stored in DB) to authorize /api/cron/gmail-sync.

ALTER TABLE public.oauth_connections
  ADD COLUMN IF NOT EXISTS gmail_sync_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.oauth_connections
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

COMMENT ON COLUMN public.oauth_connections.gmail_sync_enabled IS
  'When true, /api/cron/gmail-sync may insert expenses automatically. Default false.';
COMMENT ON COLUMN public.oauth_connections.last_synced_at IS
  'Last successful (or attempted) automatic Gmail expense sync timestamp.';

CREATE OR REPLACE VIEW public.oauth_connection_status
WITH (security_invoker = false) AS
SELECT
  provider,
  expires_at,
  connected_by,
  connected_email,
  gmail_sync_enabled,
  last_synced_at,
  created_at,
  updated_at
FROM public.oauth_connections;

GRANT SELECT ON public.oauth_connection_status TO authenticated;
