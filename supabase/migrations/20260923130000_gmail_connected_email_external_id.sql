-- Gmail hardening: connected account email + expense external_id for import dedupe.
-- Apply manually in the Supabase SQL editor.

ALTER TABLE public.oauth_connections
  ADD COLUMN IF NOT EXISTS connected_email text;

CREATE OR REPLACE VIEW public.oauth_connection_status
WITH (security_invoker = false) AS
SELECT
  provider,
  expires_at,
  connected_by,
  connected_email,
  created_at,
  updated_at
FROM public.oauth_connections;

GRANT SELECT ON public.oauth_connection_status TO authenticated;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS external_id text;

-- One live expense per external id (e.g. Gmail message id).
CREATE UNIQUE INDEX IF NOT EXISTS expenses_external_id_live_uidx
  ON public.expenses (external_id)
  WHERE external_id IS NOT NULL AND deleted_at IS NULL;
