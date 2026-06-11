-- ---------------------------------------------------------------------------
-- Platform testimonials (homepage social proof), managed in the admin area.
-- Supports manual entries and Google reviews imports (source + source_id
-- used for de-duplication of imported reviews).
-- ---------------------------------------------------------------------------

CREATE TABLE public.testimonials (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ,
    author_name   TEXT NOT NULL,
    author_detail TEXT,
    text          TEXT NOT NULL,
    rating        INTEGER CHECK (rating BETWEEN 1 AND 5),
    source        TEXT NOT NULL DEFAULT 'manual',
    source_id     TEXT,
    photo_url     TEXT,
    published     BOOLEAN NOT NULL DEFAULT TRUE,
    priority      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_testimonials_published
    ON public.testimonials (published, priority DESC, created_at DESC);

CREATE UNIQUE INDEX idx_testimonials_source_id
    ON public.testimonials (source, source_id)
    WHERE source_id IS NOT NULL;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Seed with the testimonials previously hardcoded on the homepage.
INSERT INTO public.testimonials (author_name, text, rating, priority) VALUES
    ('Joana Osório', 'Nunca tenho ideias para os meus anos, a RINU ajudou-me a procurar a melhor solução ao melhor preço em passos simples e intuitivos.', 5, 60),
    ('António M.', 'Tive a ideia de reunir com a minha equipa de trabalho num local diferente. A RINU foi a solução perfeita para marcar a minha sala de reuniões num local inesperado.', 5, 50),
    ('Maria Miguel', 'Rápido, intuitivo e seguro. Fiz a compra em 6 passos apenas. Fantástico e disruptivo! Que abertura de espírito.', 5, 40),
    ('Nuno Santos', 'Booking das reservas de espaço. Reservei a minha VENUE de sonho para os meus 40 anos. Obrigado RINU!', 5, 30),
    ('Helena Martins', 'Vou casar no fim deste ano e o facto de ver a quinta disponível e logo com o preço foi o empurrão que precisei para fazer a reserva pela RINU. Depois da reserva tive um acompanhamento pessoal pela Quinta.', 5, 20),
    ('João Molina', 'Tinha a expectativa que reservar um espaço para fazer uma reunião era difícil. A RINU mostrou-me que é uma questão de cliques.', 5, 10);
