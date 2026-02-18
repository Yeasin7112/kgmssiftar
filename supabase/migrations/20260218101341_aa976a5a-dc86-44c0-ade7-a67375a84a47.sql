
-- Create event_photos table for previous event gallery
CREATE TABLE public.event_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_url TEXT NOT NULL,
  caption TEXT,
  event_year INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- Public can view all event photos
CREATE POLICY "Anyone can view event photos"
  ON public.event_photos FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert event photos"
  ON public.event_photos FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update event photos"
  ON public.event_photos FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete event photos"
  ON public.event_photos FOR DELETE
  USING (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_event_photos_updated_at
  BEFORE UPDATE ON public.event_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for event photos
INSERT INTO storage.buckets (id, name, public) VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Event photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-photos');

CREATE POLICY "Admins can upload event photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-photos');

CREATE POLICY "Admins can delete event photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'event-photos');
