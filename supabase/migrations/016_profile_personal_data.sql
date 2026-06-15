-- ---------------------------------------------------------------------------
-- Extra personal data on user profiles: contact phone and an avatar photo
-- that becomes the user's avatar across the platform.
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_extension INTEGER,
  ADD COLUMN IF NOT EXISTS phone_number    BIGINT,
  ADD COLUMN IF NOT EXISTS photo_url       TEXT;
