
-- Drop existing delete policy for joining_requests
DROP POLICY IF EXISTS "Admins can delete requests" ON public.joining_requests;

-- Create a security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND email = 'admin@gmail.com'
  )
$$;

-- New delete policy: only super admin can delete joining requests
CREATE POLICY "Only super admin can delete requests"
ON public.joining_requests
FOR DELETE
USING (public.is_super_admin());
