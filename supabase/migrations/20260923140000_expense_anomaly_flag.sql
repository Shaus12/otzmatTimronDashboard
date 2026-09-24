-- Informational anomaly flag on expenses (high amount / unreviewed recurring).
-- Apply manually in the Supabase SQL editor. Does not change status or block imports.

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS anomaly_flag text;

ALTER TABLE public.expenses
  DROP CONSTRAINT IF EXISTS expenses_anomaly_flag_check;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_anomaly_flag_check
  CHECK (
    anomaly_flag IS NULL
    OR anomaly_flag IN ('high_amount', 'unreviewed_recurring')
  );

COMMENT ON COLUMN public.expenses.anomaly_flag IS
  'Informational only: high_amount | unreviewed_recurring | null. Never auto-changes status.';
