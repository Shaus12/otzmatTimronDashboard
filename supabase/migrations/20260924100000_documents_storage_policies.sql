-- Storage bucket "documents" is private. Mirror public.documents RLS so
-- authenticated roles can only touch files under allowed entity_type folders:
--   admin: always
--   operations: vehicle | employee | fine
--   accounting: expense | invoice
-- Path layout: {entity_type}/{entity_id}/{file_name}
-- Apply in Supabase SQL editor (or via CLI) after the documents bucket exists.

-- Ensure bucket exists and stays private (idempotent).
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS documents_storage_select ON storage.objects;
DROP POLICY IF EXISTS documents_storage_insert ON storage.objects;
DROP POLICY IF EXISTS documents_storage_update ON storage.objects;
DROP POLICY IF EXISTS documents_storage_delete ON storage.objects;

-- All authenticated profiles can read (signed downloads); matches app read-all.
CREATE POLICY documents_storage_select
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()
    )
  );

CREATE POLICY documents_storage_insert
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role = 'admin'
          OR (
            p.role = 'operations'
            AND (storage.foldername(name))[1] IN ('vehicle', 'employee', 'fine')
          )
          OR (
            p.role = 'accounting'
            AND (storage.foldername(name))[1] IN ('expense', 'invoice')
          )
        )
    )
  );

-- Allow replace / upsert of the same object path under the same write rules.
CREATE POLICY documents_storage_update
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role = 'admin'
          OR (
            p.role = 'operations'
            AND (storage.foldername(name))[1] IN ('vehicle', 'employee', 'fine')
          )
          OR (
            p.role = 'accounting'
            AND (storage.foldername(name))[1] IN ('expense', 'invoice')
          )
        )
    )
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role = 'admin'
          OR (
            p.role = 'operations'
            AND (storage.foldername(name))[1] IN ('vehicle', 'employee', 'fine')
          )
          OR (
            p.role = 'accounting'
            AND (storage.foldername(name))[1] IN ('expense', 'invoice')
          )
        )
    )
  );

CREATE POLICY documents_storage_delete
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.role = 'admin'
          OR (
            p.role = 'operations'
            AND (storage.foldername(name))[1] IN ('vehicle', 'employee', 'fine')
          )
          OR (
            p.role = 'accounting'
            AND (storage.foldername(name))[1] IN ('expense', 'invoice')
          )
        )
    )
  );
