-- =============================================================================
-- RINU consolidated initial schema for Supabase
-- Merged from: users, venues, bookings, photos, reviews services
-- Auth service tables omitted; profiles replaces users
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Optional (uncomment if you add fuzzy/accent-insensitive search later):
-- CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;
-- CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Profiles (replaces users service `users` table)
-- id mirrors auth.users.id
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name            TEXT,
    roles           TEXT[],
    kind            TEXT NOT NULL DEFAULT '',
    date_of_birth   DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ
);

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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Venues domain
-- ---------------------------------------------------------------------------
CREATE TABLE public.venues (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at              TIMESTAMPTZ NOT NULL,
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ,
    owner_id                UUID NOT NULL REFERENCES public.profiles(id),
    reference               TEXT,
    status                  INT,
    name                    TEXT,
    description             TEXT,
    attributes              TEXT[],
    primary_photo           TEXT,
    photos                  TEXT[],
    country                 TEXT,
    street1                 TEXT,
    street2                 TEXT,
    postal_code             TEXT,
    city                    TEXT,
    latitude                DECIMAL,
    longitude               DECIMAL,
    billing_name            TEXT,
    billing_vat             TEXT,
    billing_address         TEXT,
    billing_iban            TEXT,
    billing_postal_code     TEXT,
    billing_city            TEXT,
    billing_email           TEXT NOT NULL DEFAULT '',
    contact_name            TEXT,
    contact_phone_extension INT,
    contact_phone_number    INT,
    contact_email           TEXT,
    currency                TEXT NOT NULL DEFAULT 'eur',
    commission              DECIMAL NOT NULL DEFAULT 10,
    subscription            INT NOT NULL DEFAULT 0,
    journey                 INT NOT NULL DEFAULT 0,
    search_vector           TSVECTOR
);

CREATE INDEX idx_venues_owner_id ON public.venues USING btree (owner_id);
CREATE INDEX idx_venues_status ON public.venues (status);
CREATE INDEX idx_venues_location ON public.venues (latitude, longitude);
CREATE INDEX idx_venues_attributes ON public.venues USING GIN (attributes);
CREATE INDEX idx_venues_status_location ON public.venues (status, latitude, longitude);
CREATE INDEX idx_venues_search_vector ON public.venues USING GIN (search_vector);

CREATE TABLE public.spaces (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    owner_id        UUID NOT NULL REFERENCES public.profiles(id),
    venue_id        UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
    reference       TEXT,
    status          INT,
    name            TEXT,
    description     TEXT,
    attributes      TEXT[],
    primary_photo   TEXT,
    photos          TEXT[],
    area            DECIMAL,
    journey         INT NOT NULL DEFAULT 0,
    search_vector   TSVECTOR
);

CREATE INDEX idx_spaces_owner_id ON public.spaces USING btree (owner_id);
CREATE INDEX idx_spaces_venue_id ON public.spaces USING btree (venue_id);
CREATE INDEX idx_spaces_status ON public.spaces (status);
CREATE INDEX idx_spaces_attributes ON public.spaces USING GIN (attributes);
CREATE INDEX idx_spaces_status_venue ON public.spaces (status, venue_id);
CREATE INDEX idx_spaces_search_vector ON public.spaces USING GIN (search_vector);

CREATE TABLE public.packs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at              TIMESTAMPTZ NOT NULL,
    updated_at              TIMESTAMPTZ,
    deleted_at              TIMESTAMPTZ,
    owner_id                UUID NOT NULL REFERENCES public.profiles(id),
    reference               TEXT,
    status                  INT,
    name                    TEXT,
    description             TEXT,
    attributes              TEXT[],
    primary_photo           TEXT,
    photos                  TEXT[],
    notice_days             INT,
    min_time                TEXT,
    max_time                TEXT,
    cancellation_period     TEXT,
    prices                  JSONB NOT NULL DEFAULT '[]'::jsonb,
    capacities              JSONB NOT NULL DEFAULT '[]'::jsonb,
    extras                  JSONB NOT NULL DEFAULT '[]'::jsonb,
    travel_expenses         JSONB,
    attachments             TEXT[] NOT NULL DEFAULT '{}',
    journey                 INT NOT NULL DEFAULT 0,
    upfront_percentage      DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    search_vector           TSVECTOR,
    CONSTRAINT packs_upfront_percentage_range_chk
        CHECK (upfront_percentage >= 0 AND upfront_percentage <= 100)
);

CREATE INDEX idx_packs_owner_id ON public.packs USING btree (owner_id);
CREATE INDEX idx_packs_status ON public.packs (status);
CREATE INDEX idx_packs_attributes ON public.packs USING GIN (attributes);
CREATE INDEX idx_packs_status_notice ON public.packs (status, notice_days);
CREATE INDEX idx_packs_capacities ON public.packs USING GIN (capacities);
CREATE INDEX idx_packs_prices ON public.packs USING GIN (prices);
CREATE INDEX idx_packs_search_vector ON public.packs USING GIN (search_vector);

CREATE TABLE public.packs_spaces (
    pack_id  UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    PRIMARY KEY (pack_id, space_id)
);

CREATE INDEX idx_packs_spaces_space_id ON public.packs_spaces (space_id);

CREATE TABLE public.places (
    name          TEXT PRIMARY KEY,
    top_coord     DECIMAL,
    left_coord    DECIMAL,
    bottom_coord  DECIMAL,
    right_coord   DECIMAL,
    count         INT
);

INSERT INTO public.places (name, top_coord, left_coord, bottom_coord, right_coord)
VALUES
    ('Aveiro', 40.937332058274436, -8.81370281583742, 40.12931252128932, -6.671039776883554),
    ('Beja', 38.14728336461254, -8.477943135308916, 37.75908021098591, -7.43492869227084),
    ('Braga', 41.77688455361742, -8.842158899433647, 41.39889989143232, -7.852016156273079),
    ('Bragança', 42.0725388395257, -8.98713391529701, 40.943985740838, -5.784567111957413),
    ('Castelo Branco', 40.36711292473782, -8.694784325042386, 39.57886683482352, -6.534597730047136),
    ('Coimbra', 40.460828543144814, -9.093474980511072, 39.892500833607144, -7.535889427886234),
    ('Évora', 38.98425182990166, -8.95246098852038, 38.14996741028836, -6.899391084186052),
    ('Faro', 37.522232460810294, -9.020450170485901, 36.93228523903784, -7.399745502573898),
    ('Guarda', 40.957849148528155, -8.35001383071352, 40.18384261162384, -6.132149017670081),
    ('Leiria', 39.81616684024985, -9.07638983139846, 39.609109581072374, -8.485188096404526),
    ('Lisboa', 39.00439663849691, -9.61141233782991, 38.52049704946557, -8.327774267237121),
    ('Portalegre', 39.57104152624488, -8.904888743265564, 38.823941738034016, -6.80650023903623),
    ('Porto', 41.295947616151764, -8.89969096958364, 40.91307684776562, -7.760546163131918),
    ('Santarém', 39.6636248906004, -9.546918315946431, 38.91537885846602, -7.412824248163462),
    ('Setúbal', 38.81886503576772, -9.547388878160945, 38.329862332754466, -8.16494660493347),
    ('Viana do Castelo', 42.052870687056505, -8.961616048276687, 41.66522702474697, -7.922034832503387),
    ('Vila Real', 41.82837353166205, -8.508627134556454, 41.169079513252704, -6.636831629802146),
    ('Viseu', 40.971720559178976, -8.783744877616702, 40.54314380159739, -7.417320432299663),
    ('Madeira', 32.878023344702676, -17.31298326525597, 32.99126728217294, -16.1730008568989),
    ('Açores', 37.01144729210795, -24.080863817410112, 39.85471084836214, -31.769572547139152);

CREATE TABLE public.highlights (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at   TIMESTAMPTZ NOT NULL,
    updated_at   TIMESTAMPTZ,
    deleted_at   TIMESTAMPTZ,
    space_id     UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
    from_date    DATE,
    to_date      DATE,
    priority     INT,
    mode         TEXT,
    recommended  BOOLEAN
);

CREATE INDEX highlights_space_id_idx ON public.highlights USING btree (space_id);
CREATE INDEX idx_highlights_dates ON public.highlights (from_date, to_date);
CREATE INDEX idx_highlights_mode ON public.highlights (mode);
CREATE INDEX idx_highlights_space_mode ON public.highlights (space_id, mode);

-- Full-text search maintenance
CREATE OR REPLACE FUNCTION public.update_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('portuguese', coalesce(NEW.name, '')), 'A') ||
        setweight(to_tsvector('portuguese', coalesce(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$;

CREATE TRIGGER venues_search_vector_update
    BEFORE INSERT OR UPDATE OF name, description ON public.venues
    FOR EACH ROW EXECUTE FUNCTION public.update_search_vector();

CREATE TRIGGER spaces_search_vector_update
    BEFORE INSERT OR UPDATE OF name, description ON public.spaces
    FOR EACH ROW EXECUTE FUNCTION public.update_search_vector();

CREATE TRIGGER packs_search_vector_update
    BEFORE INSERT OR UPDATE OF name, description ON public.packs
    FOR EACH ROW EXECUTE FUNCTION public.update_search_vector();

-- ---------------------------------------------------------------------------
-- Bookings domain
-- ---------------------------------------------------------------------------
CREATE TABLE public.bookings (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at              TIMESTAMPTZ NOT NULL,
    updated_at              TIMESTAMPTZ,
    user_id                 UUID NOT NULL REFERENCES public.profiles(id),
    space_id                UUID NOT NULL REFERENCES public.spaces(id),
    pack_id                 UUID REFERENCES public.packs(id),
    event_date              DATE NOT NULL,
    start_at                INTERVAL NOT NULL,
    end_at                  INTERVAL NOT NULL,
    num_people              INT,
    kind                    INT,
    status                  TEXT,
    layout                  TEXT,
    notes                   TEXT,
    billing_name            TEXT,
    billing_vat             TEXT,
    billing_address         TEXT,
    billing_postal_code     TEXT,
    billing_city            TEXT,
    billing_country         TEXT,
    contact_name            TEXT,
    contact_phone_extension INT,
    contact_phone_number    INT,
    contact_email           TEXT,
    free_cancellation       DATE,
    total_amount            DECIMAL,
    commission              DECIMAL,
    cancelled_by            TEXT,
    timezone                TEXT,
    currency                TEXT NOT NULL DEFAULT 'eur',
    ical_import_id          TEXT,
    external_id             TEXT,
    upfront_amount          DECIMAL NOT NULL DEFAULT 0,
    upfront_percentage      DECIMAL NOT NULL DEFAULT 100
);

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);
CREATE INDEX idx_bookings_space_id ON public.bookings USING btree (space_id);

CREATE TABLE public.payments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ,
    user_id     UUID NOT NULL REFERENCES public.profiles(id),
    booking_id  UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    provider    TEXT,
    external_id TEXT,
    status      TEXT,
    data        JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id);
CREATE INDEX idx_payments_booking_id ON public.payments USING btree (booking_id);

CREATE TABLE public.icals_exports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ,
    owner_id    UUID NOT NULL REFERENCES public.profiles(id),
    token       TEXT,
    space_id    TEXT NOT NULL,
    name        TEXT NOT NULL,
    enabled     BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX icals_exports_space_id_idx ON public.icals_exports USING btree (space_id);

CREATE TABLE public.icals_imports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ,
    owner_id    UUID NOT NULL REFERENCES public.profiles(id),
    url         TEXT NOT NULL,
    space_id    TEXT NOT NULL,
    name        TEXT NOT NULL,
    last_sync   TIMESTAMPTZ,
    enabled     BOOLEAN NOT NULL DEFAULT false,
    status      TEXT NOT NULL
);

CREATE INDEX icals_imports_space_id_idx ON public.icals_imports (space_id);

CREATE TABLE public.quote (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL,
    user_id         TEXT,
    name            TEXT,
    email           TEXT,
    phone_extension INT,
    phone_number    BIGINT,
    company_event   BOOLEAN,
    company_name    TEXT,
    vat_number      TEXT,
    event_kind      TEXT,
    area            TEXT,
    country         TEXT,
    event_date      DATE,
    start_at        INTERVAL,
    end_at          INTERVAL,
    timezone        TEXT,
    budget          DECIMAL,
    currency        TEXT,
    num_people      INT,
    notes           TEXT,
    attributes      TEXT[],
    venue_id        TEXT NOT NULL DEFAULT '',
    space_id        TEXT NOT NULL DEFAULT '',
    pack_id         TEXT NOT NULL DEFAULT ''
);

CREATE TABLE public.contact_request (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL,
    user_id         TEXT,
    name            TEXT,
    email           TEXT,
    phone_extension INT,
    phone_number    BIGINT,
    kind            TEXT,
    venue_id        TEXT,
    space_id        TEXT,
    pack_id         TEXT,
    message         TEXT
);

-- ---------------------------------------------------------------------------
-- Users extras (watchlist)
-- ---------------------------------------------------------------------------
CREATE TABLE public.watchlist (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    spaces      TEXT[],
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ
);

CREATE UNIQUE INDEX watchlist_user_name ON public.watchlist USING btree (user_id, name);

-- ---------------------------------------------------------------------------
-- Photos domain
-- ---------------------------------------------------------------------------
CREATE TABLE public.photos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES public.profiles(id),
    created_at  TIMESTAMPTZ NOT NULL,
    url         TEXT NOT NULL,
    large_url   TEXT NOT NULL DEFAULT '',
    medium_url  TEXT NOT NULL DEFAULT '',
    small_url   TEXT NOT NULL DEFAULT '',
    extension   TEXT NOT NULL DEFAULT '',
    lock_id     TEXT,
    locked_at   TIMESTAMPTZ,
    attempts    INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_photos_medium_url ON public.photos (medium_url) WHERE medium_url = '';

CREATE TABLE public.attachments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES public.profiles(id),
    created_at  TIMESTAMPTZ NOT NULL,
    url         TEXT NOT NULL,
    extension   TEXT NOT NULL,
    filename    TEXT NOT NULL
);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
CREATE TABLE public.review (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ,
    owner_id    TEXT NOT NULL,
    owner_name  TEXT NOT NULL,
    entity      TEXT NOT NULL,
    kind        TEXT NOT NULL,
    rating      INT NOT NULL,
    comment     TEXT,
    photos      TEXT[]
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icals_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.icals_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Venues / spaces / packs — public catalogue + owner CRUD
CREATE POLICY "Public venues"
    ON public.venues FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Owners manage venues"
    ON public.venues FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public spaces"
    ON public.spaces FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Owners manage spaces"
    ON public.spaces FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public packs"
    ON public.packs FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Owners manage packs"
    ON public.packs FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Public packs_spaces"
    ON public.packs_spaces FOR SELECT USING (true);

CREATE POLICY "Pack owners manage packs_spaces"
    ON public.packs_spaces FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.packs p
        WHERE p.id = pack_id AND p.owner_id = auth.uid()
    ));

-- Reference / catalogue data
CREATE POLICY "Public places" ON public.places FOR SELECT USING (true);
CREATE POLICY "Public highlights" ON public.highlights FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Space owners manage highlights"
    ON public.highlights FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.spaces s
        WHERE s.id = space_id AND s.owner_id = auth.uid()
    ));

-- Bookings
CREATE POLICY "Users see own bookings"
    ON public.bookings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Venue owners see space bookings"
    ON public.bookings FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.spaces s
        WHERE s.id = space_id AND s.owner_id = auth.uid()
    ));

CREATE POLICY "Users create bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own bookings"
    ON public.bookings FOR UPDATE
    USING (auth.uid() = user_id);

-- Payments (writes via service role / edge functions)
CREATE POLICY "Users see own payments"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Venue owners see booking payments"
    ON public.payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.spaces s ON s.id = b.space_id
        WHERE b.id = booking_id AND s.owner_id = auth.uid()
    ));

-- iCal
CREATE POLICY "Owners manage ical exports"
    ON public.icals_exports FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Owners manage ical imports"
    ON public.icals_imports FOR ALL USING (auth.uid() = owner_id);

-- Leads
CREATE POLICY "Anyone can submit quote"
    ON public.quote FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can submit contact request"
    ON public.contact_request FOR INSERT WITH CHECK (true);

-- Watchlist
CREATE POLICY "Users manage own watchlist"
    ON public.watchlist FOR ALL USING (auth.uid() = user_id);

-- Media
CREATE POLICY "Public photos" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Owners manage photos" ON public.photos FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public attachments" ON public.attachments FOR SELECT USING (true);
CREATE POLICY "Owners manage attachments" ON public.attachments FOR ALL USING (auth.uid() = owner_id);

-- Reviews
CREATE POLICY "Public reviews" ON public.review FOR SELECT USING (true);
CREATE POLICY "Authenticated users create reviews"
    ON public.review FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors update own reviews"
    ON public.review FOR UPDATE USING (owner_id = auth.uid()::text);
CREATE POLICY "Authors delete own reviews"
    ON public.review FOR DELETE USING (owner_id = auth.uid()::text);
