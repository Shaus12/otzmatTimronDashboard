-- Gmail (and future) OAuth tokens — server-side only.
-- Apply manually in the Supabase SQL editor. Do not commit secrets.

CREATE TABLE IF NOT EXISTS public.oauth_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz,
  connected_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT oauth_connections_provider_uidx UNIQUE (provider)
);

ALTER TABLE public.oauth_connections ENABLE ROW LEVEL SECURITY;

-- No client-facing policies on the base table — tokens are service-role only.
-- Status badges read the safe view below (no access_token / refresh_token).

DROP POLICY IF EXISTS oauth_connections_admin_select ON public.oauth_connections;
DROP POLICY IF EXISTS oauth_connections_admin_insert ON public.oauth_connections;
DROP POLICY IF EXISTS oauth_connections_admin_update ON public.oauth_connections;
DROP POLICY IF EXISTS oauth_connections_admin_delete ON public.oauth_connections;

CREATE OR REPLACE VIEW public.oauth_connection_status
WITH (security_invoker = false) AS
SELECT
  provider,
  expires_at,
  connected_by,
  created_at,
  updated_at
FROM public.oauth_connections;

GRANT SELECT ON public.oauth_connection_status TO authenticated;
