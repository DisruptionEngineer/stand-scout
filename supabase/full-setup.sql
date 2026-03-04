-- Stand Scout: Full Database Setup (schema + all migrations combined)
-- Run this in the Supabase SQL Editor to set up from scratch

-- ============================================
-- Enable UUID extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STANDS TABLE (schema.sql + migration-002 status + migration-005 address_geocoded)
-- ============================================
CREATE TABLE IF NOT EXISTS public.stands (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text NOT NULL,
  address_geocoded text,
  categories text[] NOT NULL DEFAULT '{}',
  products text[] NOT NULL DEFAULT '{}',
  currently_available text[] NOT NULL DEFAULT '{}',
  availability_status text NOT NULL DEFAULT 'unknown' CHECK (availability_status IN ('available', 'sold_out', 'unknown')),
  last_status_update timestamptz,
  last_status_source text CHECK (last_status_source IN ('owner_sms', 'community_qr', 'community_app')),
  typical_availability text NOT NULL DEFAULT '',
  phone text NOT NULL,
  website text,
  sms_linked boolean NOT NULL DEFAULT false,
  photos text[] NOT NULL DEFAULT '{}',
  owner_name text NOT NULL,
  date_added date NOT NULL DEFAULT current_date,
  seasonal boolean NOT NULL DEFAULT false,
  seasonal_notes text,
  rating double precision NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  payment_methods text[] NOT NULL DEFAULT '{}',
  self_serve boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stands_name_length CHECK (char_length(name) <= 200),
  CONSTRAINT stands_description_length CHECK (char_length(description) <= 500),
  CONSTRAINT stands_address_length CHECK (char_length(address) <= 200),
  CONSTRAINT stands_owner_name_length CHECK (char_length(owner_name) <= 80),
  CONSTRAINT stands_phone_length CHECK (char_length(phone) <= 20)
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  stand_id uuid NOT NULL REFERENCES public.stands(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  author_name text NOT NULL,
  date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_text_length CHECK (char_length(text) <= 1000),
  CONSTRAINT reviews_author_name_length CHECK (char_length(author_name) <= 80)
);

-- ============================================
-- AVAILABILITY REPORTS TABLE (with report_weight from migration-005)
-- ============================================
CREATE TABLE IF NOT EXISTS public.availability_reports (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  stand_id uuid NOT NULL REFERENCES public.stands(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('stocked', 'empty')),
  products_spotted text[] NOT NULL DEFAULT '{}',
  photo_url text,
  timestamp timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'app_report' CHECK (source IN ('qr_scan', 'app_report')),
  report_weight integer NOT NULL DEFAULT 1
);

-- ============================================
-- PRODUCT REPORTS TABLE (migration-005)
-- ============================================
CREATE TABLE IF NOT EXISTS public.product_reports (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  stand_id uuid NOT NULL REFERENCES public.stands(id) ON DELETE CASCADE,
  product_name text NOT NULL CHECK (char_length(product_name) <= 60),
  is_available boolean NOT NULL,
  source text NOT NULL DEFAULT 'app_report' CHECK (source IN ('qr_scan', 'app_report', 'owner_sms')),
  report_weight integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- SPONSORS TABLE (migration-004)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sponsors (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  url text,
  logo_url text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  address text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Local Business',
  monthly_rate numeric(8,2) NOT NULL DEFAULT 50.00,
  active boolean NOT NULL DEFAULT true,
  contact_email text,
  contact_phone text,
  start_date date NOT NULL DEFAULT current_date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- AD LEADS TABLE (migration-004)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ad_leads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  business_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text,
  tier text NOT NULL DEFAULT 'standard',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_stands_location ON public.stands (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_stands_availability ON public.stands (availability_status);
CREATE INDEX IF NOT EXISTS idx_stands_categories ON public.stands USING gin (categories);
CREATE INDEX IF NOT EXISTS idx_stands_status ON public.stands (status);
CREATE INDEX IF NOT EXISTS idx_reviews_stand_id ON public.reviews (stand_id);
CREATE INDEX IF NOT EXISTS idx_availability_reports_stand_id ON public.availability_reports (stand_id);
CREATE INDEX IF NOT EXISTS idx_availability_reports_timestamp ON public.availability_reports (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_product_reports_stand_id ON public.product_reports (stand_id);
CREATE INDEX IF NOT EXISTS idx_product_reports_created_at ON public.product_reports (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsors_location ON public.sponsors (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON public.sponsors (active);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Stands: moderated (migration-002 + migration-005 RLS fix)
ALTER TABLE public.stands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public sees approved stands"
  ON public.stands FOR SELECT
  USING (status = 'approved' OR auth.role() = 'authenticated');

CREATE POLICY "Anyone can submit a stand (pending only)"
  ON public.stands FOR INSERT
  WITH CHECK (status = 'pending' OR status IS NULL);

CREATE POLICY "Admin can update stands"
  ON public.stands FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete stands"
  ON public.stands FOR DELETE
  USING (auth.role() = 'authenticated');

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Anyone can add a review"
  ON public.reviews FOR INSERT WITH CHECK (true);

-- Availability reports
ALTER TABLE public.availability_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reports are viewable by everyone"
  ON public.availability_reports FOR SELECT USING (true);

CREATE POLICY "Anyone can add a report"
  ON public.availability_reports FOR INSERT WITH CHECK (true);

-- Product reports (migration-005)
ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product reports viewable by everyone"
  ON public.product_reports FOR SELECT USING (true);

CREATE POLICY "Anyone can add a product report"
  ON public.product_reports FOR INSERT WITH CHECK (true);

-- Sponsors (migration-004)
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sponsors are public"
  ON public.sponsors FOR SELECT
  USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin can insert sponsors"
  ON public.sponsors FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update sponsors"
  ON public.sponsors FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete sponsors"
  ON public.sponsors FOR DELETE
  USING (auth.role() = 'authenticated');

-- Ad leads (migration-004)
ALTER TABLE public.ad_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.ad_leads FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view leads"
  ON public.ad_leads FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTION: Update stand rating when review is added
-- ============================================
CREATE OR REPLACE FUNCTION public.update_stand_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE public.stands
  SET
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE stand_id = NEW.stand_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE stand_id = NEW.stand_id)
  WHERE id = NEW.stand_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_added
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_stand_rating();

-- ============================================
-- FUNCTION: Consensus-aware availability update (migration-005)
-- ============================================
CREATE OR REPLACE FUNCTION public.update_stand_on_report()
RETURNS trigger AS $$
DECLARE
  weight_stocked integer;
  weight_empty integer;
  window_start timestamptz;
BEGIN
  window_start := NOW() - INTERVAL '6 hours';

  SELECT
    COALESCE(SUM(report_weight) FILTER (WHERE status = 'stocked'), 0),
    COALESCE(SUM(report_weight) FILTER (WHERE status = 'empty'), 0)
  INTO weight_stocked, weight_empty
  FROM public.availability_reports
  WHERE stand_id = NEW.stand_id
    AND timestamp >= window_start;

  IF weight_stocked >= 2 OR weight_empty >= 2 THEN
    UPDATE public.stands SET
      availability_status = CASE
        WHEN weight_stocked > weight_empty THEN 'available'
        ELSE 'sold_out'
      END,
      last_status_update = NEW.timestamp,
      last_status_source = CASE
        WHEN NEW.source = 'qr_scan' THEN 'community_qr'
        ELSE 'community_app'
      END
    WHERE id = NEW.stand_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_availability_reported
  AFTER INSERT ON public.availability_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_stand_on_report();

-- ============================================
-- FUNCTION: Product consensus trigger (migration-005)
-- ============================================
CREATE OR REPLACE FUNCTION public.update_product_availability()
RETURNS trigger AS $$
DECLARE
  confirmed_products text[];
  window_start timestamptz;
BEGIN
  window_start := NOW() - INTERVAL '6 hours';

  SELECT COALESCE(array_agg(product_name), '{}')
  INTO confirmed_products
  FROM (
    SELECT product_name,
      SUM(CASE WHEN is_available THEN report_weight ELSE 0 END) AS avail_weight,
      SUM(CASE WHEN NOT is_available THEN report_weight ELSE 0 END) AS unavail_weight
    FROM public.product_reports
    WHERE stand_id = NEW.stand_id
      AND created_at >= window_start
    GROUP BY product_name
    HAVING SUM(CASE WHEN is_available THEN report_weight ELSE 0 END) >= 2
      AND SUM(CASE WHEN is_available THEN report_weight ELSE 0 END) >
          SUM(CASE WHEN NOT is_available THEN report_weight ELSE 0 END)
  ) confirmed;

  UPDATE public.stands
  SET currently_available = confirmed_products
  WHERE id = NEW.stand_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_product_reported
  AFTER INSERT ON public.product_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_product_availability();

-- ============================================
-- STORAGE: Photo bucket (migration-003)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('stand-photos', 'stand-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can upload stand photos" ON storage.objects;
CREATE POLICY "Anyone can upload stand photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'stand-photos');

DROP POLICY IF EXISTS "Stand photos are publicly accessible" ON storage.objects;
CREATE POLICY "Stand photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stand-photos');

DROP POLICY IF EXISTS "Admin can delete stand photos" ON storage.objects;
CREATE POLICY "Admin can delete stand photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'stand-photos' AND auth.role() = 'authenticated');
