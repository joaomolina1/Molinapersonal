ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS extra_params JSONB NOT NULL DEFAULT '[]'::jsonb;
