-- Contact pack associations + lead quality score (quotes + contacts)

ALTER TABLE public.quote
    ADD COLUMN IF NOT EXISTS quality_score INT
    CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 5));

ALTER TABLE public.contact_request
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new',
    ADD COLUMN IF NOT EXISTS quality_score INT
    CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 5));

CREATE INDEX IF NOT EXISTS idx_contact_request_status ON public.contact_request (status);

CREATE TABLE public.contact_packs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    contact_id  UUID NOT NULL REFERENCES public.contact_request(id) ON DELETE CASCADE,
    pack_id     UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    created_by  UUID REFERENCES public.profiles(id),
    status      TEXT NOT NULL DEFAULT 'suggested',
    UNIQUE (contact_id, pack_id)
);

CREATE INDEX idx_contact_packs_contact ON public.contact_packs (contact_id);
CREATE INDEX idx_contact_packs_pack ON public.contact_packs (pack_id);

ALTER TABLE public.contact_packs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.enforce_contact_packs_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.contact_packs WHERE contact_id = NEW.contact_id) >= 5 THEN
    RAISE EXCEPTION 'contact_packs_limit_exceeded'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contact_packs_limit
  BEFORE INSERT ON public.contact_packs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_contact_packs_limit();
