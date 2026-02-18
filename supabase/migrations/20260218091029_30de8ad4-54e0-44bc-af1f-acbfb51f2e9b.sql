
-- Payment methods table
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  number text NOT NULL,
  type text NOT NULL,
  icon text NOT NULL DEFAULT '💳',
  instruction text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment methods"
ON public.payment_methods FOR SELECT
USING (is_active = true OR is_admin());

CREATE POLICY "Admins can insert payment methods"
ON public.payment_methods FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update payment methods"
ON public.payment_methods FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete payment methods"
ON public.payment_methods FOR DELETE
USING (is_admin());

-- Seed default payment methods
INSERT INTO public.payment_methods (name, number, type, icon, instruction, sort_order) VALUES
('বিকাশ', '01XXXXXXXXX', 'সেন্ড মানি', '📱', 'বিকাশ অ্যাপ খুলুন → সেন্ড মানি → নম্বর দিন → পরিমাণ লিখুন → পিন দিয়ে নিশ্চিত করুন → ট্রানজেকশন আইডি সংরক্ষণ করুন', 1),
('নগদ', '01XXXXXXXXX', 'সেন্ড মানি', '💸', 'নগদ অ্যাপ খুলুন → সেন্ড মানি → নম্বর দিন → পরিমাণ লিখুন → পিন দিয়ে নিশ্চিত করুন → ট্রানজেকশন আইডি সংরক্ষণ করুন', 2),
('রকেট', '01XXXXXXXXX', 'সেন্ড মানি', '🚀', 'রকেট অ্যাপ খুলুন → সেন্ড মানি → নম্বর দিন → পরিমাণ লিখুন → পিন দিয়ে নিশ্চিত করুন → ট্রানজেকশন আইডি সংরক্ষণ করুন', 3),
('হাতে হাতে', 'সরাসরি যোগাযোগ', 'ক্যাশ', '🤝', 'সরাসরি আয়োজকদের সাথে যোগাযোগ করুন এবং নগদ টাকা প্রদান করুন', 4);

-- Committee members table
CREATE TABLE public.committee_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  phone text,
  facebook_url text,
  photo_url text,
  ssc_batch integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view committee members"
ON public.committee_members FOR SELECT
USING (true);

CREATE POLICY "Admins can insert committee members"
ON public.committee_members FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update committee members"
ON public.committee_members FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete committee members"
ON public.committee_members FOR DELETE
USING (is_admin());

-- Triggers for updated_at
CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_committee_members_updated_at
BEFORE UPDATE ON public.committee_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
