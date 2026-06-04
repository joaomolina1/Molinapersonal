-- ---------------------------------------------------------------------------
-- Supabase database linter fixes (RLS, function search_path, storage listing)
-- ---------------------------------------------------------------------------

-- Orphan tables (not part of RINU): enable RLS and revoke API roles.
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY';
    REVOKE ALL ON public._prisma_migrations FROM anon, authenticated;
  END IF;

  IF to_regclass('public."Child"') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public."Child" ENABLE ROW LEVEL SECURITY';
    REVOKE ALL ON public."Child" FROM anon, authenticated;
  END IF;

  IF to_regclass('public."DirectFeed"') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public."DirectFeed" ENABLE ROW LEVEL SECURITY';
    REVOKE ALL ON public."DirectFeed" FROM anon, authenticated;
  END IF;

  IF to_regclass('public."BottleFeed"') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public."BottleFeed" ENABLE ROW LEVEL SECURITY';
    REVOKE ALL ON public."BottleFeed" FROM anon, authenticated;
  END IF;
END $$;

-- Full-text search trigger: immutable search_path
CREATE OR REPLACE FUNCTION public.update_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('portuguese', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$;

-- Auth signup trigger: not callable via PostgREST RPC
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, name, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', ''),
        now()
    );
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

-- Lead forms: require minimal fields instead of WITH CHECK (true)
DROP POLICY IF EXISTS "Anyone can submit quote" ON public.quote;
CREATE POLICY "Anyone can submit quote"
    ON public.quote FOR INSERT
    WITH CHECK (
        created_at IS NOT NULL
        AND email IS NOT NULL
        AND length(trim(email)) >= 3
    );

DROP POLICY IF EXISTS "Anyone can submit contact request" ON public.contact_request;
CREATE POLICY "Anyone can submit contact request"
    ON public.contact_request FOR INSERT
    WITH CHECK (
        created_at IS NOT NULL
        AND email IS NOT NULL
        AND length(trim(email)) >= 3
        AND message IS NOT NULL
        AND length(trim(message)) >= 1
    );

-- Public bucket URLs work without a broad storage.objects SELECT (avoids directory listing)
DROP POLICY IF EXISTS "Public read attachments" ON storage.objects;
