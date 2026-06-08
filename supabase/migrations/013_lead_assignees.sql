-- Admins assigned to quote / contact leads (kanban ownership)

ALTER TABLE public.quote
  ADD COLUMN IF NOT EXISTS assigned_admin_ids UUID[] NOT NULL DEFAULT '{}';

ALTER TABLE public.contact_request
  ADD COLUMN IF NOT EXISTS assigned_admin_ids UUID[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_quote_assigned_admin_ids
  ON public.quote USING GIN (assigned_admin_ids);

CREATE INDEX IF NOT EXISTS idx_contact_request_assigned_admin_ids
  ON public.contact_request USING GIN (assigned_admin_ids);
