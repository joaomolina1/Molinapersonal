-- ---------------------------------------------------------------------------
-- Additional service packs attached to a booking (multi-pack bookings).
-- The booking keeps a single payment: amounts of attached packs are summed
-- into bookings.total_amount / upfront_amount at creation time; each row
-- stores the computed amount for transparency.
-- ---------------------------------------------------------------------------

CREATE TABLE public.booking_packs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    booking_id   UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    pack_id      UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    space_id     UUID REFERENCES public.spaces(id),
    amount       NUMERIC NOT NULL DEFAULT 0,
    extra_ids    TEXT[] NOT NULL DEFAULT '{}',
    extra_params JSONB NOT NULL DEFAULT '[]',
    UNIQUE (booking_id, pack_id)
);

CREATE INDEX idx_booking_packs_booking ON public.booking_packs (booking_id);

ALTER TABLE public.booking_packs ENABLE ROW LEVEL SECURITY;
