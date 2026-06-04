-- ---------------------------------------------------------------------------
-- Subscription plans (per venue) + featured spaces (auto-managed highlights)
-- ---------------------------------------------------------------------------

-- Per-venue subscription, backed by a Stripe Billing subscription.
CREATE TABLE public.subscriptions (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ,
    venue_id               UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    owner_id               UUID NOT NULL REFERENCES public.profiles(id),
    plan                   TEXT NOT NULL,                 -- 'premium' | 'expert'
    billing_interval       TEXT NOT NULL,                 -- 'month' | 'year'
    status                 TEXT NOT NULL DEFAULT 'incomplete', -- incomplete|active|past_due|canceled
    stripe_customer_id     TEXT,
    stripe_subscription_id TEXT,
    current_period_end     TIMESTAMPTZ,
    cancel_at_period_end   BOOLEAN NOT NULL DEFAULT false,
    canceled_at            TIMESTAMPTZ
);

CREATE INDEX idx_subscriptions_venue ON public.subscriptions (venue_id);
CREATE INDEX idx_subscriptions_owner ON public.subscriptions (owner_id);
CREATE UNIQUE INDEX idx_subscriptions_stripe_sub
    ON public.subscriptions (stripe_subscription_id)
    WHERE stripe_subscription_id IS NOT NULL;
-- One non-canceled subscription per venue.
CREATE UNIQUE INDEX idx_subscriptions_active_venue
    ON public.subscriptions (venue_id)
    WHERE status <> 'canceled';

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (owner_id = auth.uid());

-- Featured spaces are stored as highlights rows; link them to the subscription
-- that created them and track the lock window during which they cannot be swapped.
ALTER TABLE public.highlights
    ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE;
ALTER TABLE public.highlights
    ADD COLUMN IF NOT EXISTS locked_until DATE;

CREATE INDEX IF NOT EXISTS idx_highlights_subscription
    ON public.highlights (subscription_id);
