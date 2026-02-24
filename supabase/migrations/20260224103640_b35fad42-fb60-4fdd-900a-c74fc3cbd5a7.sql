
ALTER TABLE public.joining_requests ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;

-- Only super admin can pin/unpin (update is_pinned)
-- Existing update policy already allows admins to update, so we're good.
-- But we need to ensure only super admin can change is_pinned via application logic.
