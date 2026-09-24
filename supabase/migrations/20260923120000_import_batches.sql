-- File import batches + reusable column-mapping templates.
-- Apply manually in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  target_table text NOT NULL
    CHECK (target_table IN ('expenses', 'fines', 'invoices')),
  file_name text NOT NULL DEFAULT '',
  row_count integer NOT NULL DEFAULT 0 CHECK (row_count >= 0),
  imported_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS import_batches_created_at_idx
  ON public.import_batches (created_at DESC);

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

-- Any authenticated profile can read import history.
DROP POLICY IF EXISTS import_batches_select ON public.import_batches;
CREATE POLICY import_batches_select
  ON public.import_batches
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- INSERT: admin/accounting for expenses+invoices; admin/operations for fines.
DROP POLICY IF EXISTS import_batches_insert ON public.import_batches;
CREATE POLICY import_batches_insert
  ON public.import_batches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          (
            target_table IN ('expenses', 'invoices')
            AND p.role IN ('admin', 'accounting')
          )
          OR (
            target_table = 'fines'
            AND p.role IN ('admin', 'operations')
          )
        )
    )
  );

-- Mapping templates: remember column maps per source + target table.
CREATE TABLE IF NOT EXISTS public.import_mapping_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  target_table text NOT NULL
    CHECK (target_table IN ('expenses', 'fines', 'invoices')),
  column_mapping jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT import_mapping_templates_source_target_uidx
    UNIQUE (source_name, target_table)
);

ALTER TABLE public.import_mapping_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS import_mapping_templates_select ON public.import_mapping_templates;
CREATE POLICY import_mapping_templates_select
  ON public.import_mapping_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS import_mapping_templates_insert ON public.import_mapping_templates;
CREATE POLICY import_mapping_templates_insert
  ON public.import_mapping_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'accounting', 'operations')
    )
  );

DROP POLICY IF EXISTS import_mapping_templates_update ON public.import_mapping_templates;
CREATE POLICY import_mapping_templates_update
  ON public.import_mapping_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'accounting', 'operations')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'accounting', 'operations')
    )
  );
