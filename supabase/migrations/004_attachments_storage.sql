-- Supabase Storage bucket for pack attachments (public read via object URL, no directory listing).
-- Uploads use the service role from the API; clients read files by known path only.

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;
