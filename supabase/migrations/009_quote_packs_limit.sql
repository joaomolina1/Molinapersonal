-- Enforce max 5 pack associations per quote (race-safe; app layer still returns friendly 409).

CREATE OR REPLACE FUNCTION public.enforce_quote_packs_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.quote_packs WHERE quote_id = NEW.quote_id) >= 5 THEN
    RAISE EXCEPTION 'quote_packs_limit_exceeded'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quote_packs_limit
  BEFORE INSERT ON public.quote_packs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_quote_packs_limit();
