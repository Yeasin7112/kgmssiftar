
-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create joining_requests table
CREATE TABLE public.joining_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ssc_batch INTEGER NOT NULL,
  photo_url TEXT,
  payment_amount NUMERIC NOT NULL DEFAULT 100,
  payment_method TEXT NOT NULL DEFAULT 'bkash',
  payment_number TEXT,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.joining_requests ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function: is current user admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin());

-- RLS policies for joining_requests
-- Public can INSERT (submit joining requests)
CREATE POLICY "Anyone can submit joining request" ON public.joining_requests
  FOR INSERT WITH CHECK (true);

-- Public can view approved participants only
CREATE POLICY "Public can view approved participants" ON public.joining_requests
  FOR SELECT USING (status = 'approved' OR public.is_admin());

-- Admins can update status
CREATE POLICY "Admins can update requests" ON public.joining_requests
  FOR UPDATE TO authenticated USING (public.is_admin());

-- Admins can delete
CREATE POLICY "Admins can delete requests" ON public.joining_requests
  FOR DELETE TO authenticated USING (public.is_admin());

-- Auto update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_joining_requests_updated_at
BEFORE UPDATE ON public.joining_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for participant photos
INSERT INTO storage.buckets (id, name, public) VALUES ('participant-photos', 'participant-photos', true);

-- Storage policies
CREATE POLICY "Anyone can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'participant-photos');

CREATE POLICY "Photos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'participant-photos');

CREATE POLICY "Admins can delete photos" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'participant-photos' AND public.is_admin());
