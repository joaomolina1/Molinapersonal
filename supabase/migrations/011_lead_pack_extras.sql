-- Optional extras configuration per associated pack on quote/contact leads

ALTER TABLE public.quote_packs
  ADD COLUMN IF NOT EXISTS extra_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS extra_params JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.contact_packs
  ADD COLUMN IF NOT EXISTS extra_ids TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS extra_params JSONB NOT NULL DEFAULT '[]'::jsonb;
