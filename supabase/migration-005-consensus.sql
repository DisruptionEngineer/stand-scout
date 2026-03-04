-- Stand Scout: Consensus system + security hardening
-- Run in Supabase SQL Editor after migration-004

-- ============================================
-- 1. Add report_weight to availability_reports
-- ============================================
ALTER TABLE public.availability_reports
  ADD COLUMN IF NOT EXISTS report_weight integer NOT NULL DEFAULT 1;
-- Weights: 1 = community_app, 2 = qr_scan, 5 = owner_sms (future)

-- ============================================
-- 2. Create product_reports table
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

CREATE INDEX IF NOT EXISTS idx_product_reports_stand_id
  ON public.product_reports (stand_id);
CREATE INDEX IF NOT EXISTS idx_product_reports_created_at
  ON public.product_reports (created_at DESC);

-- RLS for product_reports
ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product reports viewable by everyone"
  ON public.product_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can add a product report"
  ON public.product_reports FOR INSERT WITH CHECK (true);

-- ============================================
-- 3. Add address_geocoded to stands
-- ============================================
ALTER TABLE public.stands
  ADD COLUMN IF NOT EXISTS address_geocoded text;

-- ============================================
-- 4. Add text length constraints to existing tables
-- ============================================
ALTER TABLE public.stands
  ADD CONSTRAINT stands_name_length CHECK (char_length(name) <= 200),
  ADD CONSTRAINT stands_description_length CHECK (char_length(description) <= 500),
  ADD CONSTRAINT stands_address_length CHECK (char_length(address) <= 200),
  ADD CONSTRAINT stands_owner_name_length CHECK (char_length(owner_name) <= 80),
  ADD CONSTRAINT stands_phone_length CHECK (char_length(phone) <= 20);

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_text_length CHECK (char_length(text) <= 1000),
  ADD CONSTRAINT reviews_author_name_length CHECK (char_length(author_name) <= 80);

-- ============================================
-- 5. Replace availability trigger with consensus-aware version
-- ============================================
CREATE OR REPLACE FUNCTION public.update_stand_on_report()
RETURNS trigger AS $$
DECLARE
  weight_stocked integer;
  weight_empty integer;
  window_start timestamptz;
BEGIN
  window_start := NOW() - INTERVAL '6 hours';

  -- Sum weighted reports in the consensus window
  SELECT
    COALESCE(SUM(report_weight) FILTER (WHERE status = 'stocked'), 0),
    COALESCE(SUM(report_weight) FILTER (WHERE status = 'empty'), 0)
  INTO weight_stocked, weight_empty
  FROM public.availability_reports
  WHERE stand_id = NEW.stand_id
    AND timestamp >= window_start;

  -- Only update stand status when consensus threshold reached (weight >= 2)
  -- This means: 2 community reports, or 1 QR scan, or 1 owner SMS (future)
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

-- ============================================
-- 6. Product consensus trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.update_product_availability()
RETURNS trigger AS $$
DECLARE
  confirmed_products text[];
  window_start timestamptz;
BEGIN
  window_start := NOW() - INTERVAL '6 hours';

  -- Find products with consensus (weighted sum >= 2 for available)
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

  -- Always update currently_available (clears stale items when consensus is lost)
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
-- 7. Fix RLS gap: prevent status bypass on insert
-- ============================================
-- Drop the overly permissive insert policy (from migration-002 or schema.sql)
DROP POLICY IF EXISTS "Anyone can submit a stand" ON public.stands;
DROP POLICY IF EXISTS "Anyone can add a stand" ON public.stands;

-- New policy: public inserts must have status = 'pending'
CREATE POLICY "Anyone can submit a stand (pending only)"
  ON public.stands FOR INSERT
  WITH CHECK (status = 'pending' OR status IS NULL);
