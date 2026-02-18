
-- Add is_pinned column to committee_members
ALTER TABLE public.committee_members ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

-- Add added_by column to joining_requests (stores admin email who manually added the member)
ALTER TABLE public.joining_requests ADD COLUMN IF NOT EXISTS added_by text NULL;
