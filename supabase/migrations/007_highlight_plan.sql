-- ---------------------------------------------------------------------------
-- Tag each highlight with the subscription tier of the highlighted space's
-- venue, so the public catalogue can treat Premium / Expert spaces specially
-- (full venue name, more visible card, tighter map zoom).
-- ---------------------------------------------------------------------------

ALTER TABLE public.highlights
    ADD COLUMN IF NOT EXISTS plan TEXT;  -- 'premium' | 'expert' | NULL (basic / untagged)

CREATE INDEX IF NOT EXISTS idx_highlights_plan
    ON public.highlights (plan);

-- Backfill existing highlights from the current venue subscription tier.
UPDATE public.highlights h
SET plan = CASE v.subscription
    WHEN 1 THEN 'premium'
    WHEN 2 THEN 'expert'
    ELSE NULL
END
FROM public.spaces s
JOIN public.venues v ON v.id = s.venue_id
WHERE h.space_id = s.id
  AND h.plan IS NULL;
