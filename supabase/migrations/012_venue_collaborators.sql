-- Venue-level collaborators (Premium / Expert venues only; enforced in API)

CREATE TABLE public.venue_collaborators (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id    UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by  UUID REFERENCES public.profiles(id),
    UNIQUE (venue_id, user_id)
);

CREATE INDEX idx_venue_collaborators_venue ON public.venue_collaborators (venue_id);
CREATE INDEX idx_venue_collaborators_user ON public.venue_collaborators (user_id);

ALTER TABLE public.venue_collaborators ENABLE ROW LEVEL SECURITY;

-- Look up an existing RINU user by email (service role / API only)
CREATE OR REPLACE FUNCTION public.find_profile_by_email(p_email text)
RETURNS TABLE (id uuid, email text, name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT p.id, u.email::text, COALESCE(p.name, '')
  FROM auth.users u
  INNER JOIN public.profiles p ON p.id = u.id
  WHERE lower(u.email) = lower(trim(p_email))
    AND (p.deleted_at IS NULL)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_profile_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_profile_by_email(text) TO service_role;
