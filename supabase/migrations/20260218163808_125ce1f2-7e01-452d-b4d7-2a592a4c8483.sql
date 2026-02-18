
-- Add mobile_number to joining_requests
ALTER TABLE public.joining_requests
  ADD COLUMN IF NOT EXISTS mobile_number text;

-- Add warning field to payment_methods (short one-liner shown to users)
ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS warning text DEFAULT '';
