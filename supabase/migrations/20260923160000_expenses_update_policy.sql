-- Allow authenticated admin/accounting to UPDATE live expenses.
-- Apply manually in the Supabase SQL editor.
-- App expense edits currently also use the service role after an app-level
-- canWrite check, so this policy aligns RLS with that permission model.

DROP POLICY IF EXISTS expenses_update ON public.expenses;
CREATE POLICY expenses_update
  ON public.expenses
  FOR UPDATE
  TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'accounting')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'accounting')
    )
  );
