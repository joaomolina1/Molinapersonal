-- ---------------------------------------------------------------------------
-- Quote lead status workflow + pack associations (up to 5 per quote)
-- ---------------------------------------------------------------------------

ALTER TABLE public.quote
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

CREATE INDEX IF NOT EXISTS idx_quote_status ON public.quote (status);

CREATE TABLE public.quote_packs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    quote_id   UUID NOT NULL REFERENCES public.quote(id) ON DELETE CASCADE,
    pack_id    UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.profiles(id),
    status     TEXT NOT NULL DEFAULT 'suggested',
    UNIQUE (quote_id, pack_id)
);

CREATE INDEX idx_quote_packs_quote ON public.quote_packs (quote_id);
CREATE INDEX idx_quote_packs_pack ON public.quote_packs (pack_id);

ALTER TABLE public.quote_packs ENABLE ROW LEVEL SECURITY;
