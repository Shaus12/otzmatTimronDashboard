-- Stable adapter linkage for systems (independent of display name).
-- Apply in Supabase SQL editor if MCP cannot reach this project.

ALTER TABLE public.systems
  ADD COLUMN IF NOT EXISTS adapter_key text;

CREATE UNIQUE INDEX IF NOT EXISTS systems_adapter_key_uidx
  ON public.systems (adapter_key)
  WHERE adapter_key IS NOT NULL;

-- Backfill the 15 known source adapters by current name (run once).
UPDATE public.systems SET adapter_key = 'bank_leumi'
  WHERE adapter_key IS NULL AND (name ILIKE '%לאומי%' OR name ILIKE '%leumi%');

UPDATE public.systems SET adapter_key = 'rivhit'
  WHERE adapter_key IS NULL AND (name ILIKE '%ריווחית%' OR name ILIKE '%rivhit%');

UPDATE public.systems SET adapter_key = 'priority'
  WHERE adapter_key IS NULL AND name ILIKE '%priority%';

UPDATE public.systems SET adapter_key = 'tax_authority'
  WHERE adapter_key IS NULL AND (name ILIKE '%מסים%' OR name ILIKE '%tax%');

UPDATE public.systems SET adapter_key = 'masav'
  WHERE adapter_key IS NULL AND (name ILIKE '%מס%ב%' OR name ILIKE '%masav%');

UPDATE public.systems SET adapter_key = 'bdi'
  WHERE adapter_key IS NULL AND name ILIKE '%bdi%';

UPDATE public.systems SET adapter_key = 'pazomat'
  WHERE adapter_key IS NULL AND (name ILIKE '%פזומט%' OR name ILIKE '%pazomat%' OR name ILIKE '%פז%מט%');

UPDATE public.systems SET adapter_key = 'gov_il'
  WHERE adapter_key IS NULL AND (name ILIKE '%ממשלת%' OR name ILIKE '%gov%');

UPDATE public.systems SET adapter_key = 'road6'
  WHERE adapter_key IS NULL AND (name ILIKE '%כביש 6%' OR name ILIKE '%road%6%' OR name ILIKE '%kvish%6%');

UPDATE public.systems SET adapter_key = 'timewatch'
  WHERE adapter_key IS NULL AND name ILIKE '%timewatch%';

UPDATE public.systems SET adapter_key = 'payroll'
  WHERE adapter_key IS NULL AND (name ILIKE '%שכר%' OR name ILIKE '%payroll%' OR name ILIKE '%salary%');

UPDATE public.systems SET adapter_key = 'andromeda'
  WHERE adapter_key IS NULL AND (name ILIKE '%אנדרומדה%' OR name ILIKE '%andromeda%');

UPDATE public.systems SET adapter_key = 'gmail'
  WHERE adapter_key IS NULL AND name ILIKE '%gmail%';

UPDATE public.systems SET adapter_key = 'office_mail'
  WHERE adapter_key IS NULL AND (name ILIKE '%office%mail%' OR name ILIKE '%outlook%' OR name = 'Office Mail');

UPDATE public.systems SET adapter_key = 'whatsapp'
  WHERE adapter_key IS NULL AND name ILIKE '%whatsapp%';
