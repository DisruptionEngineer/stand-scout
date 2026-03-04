-- Migration 006: User authentication system
-- Adds user_id to stands/reviews, server-side admin check, owner edit restrictions

-- ============================================
-- 1. Admin emails table + is_admin() function
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY
);

-- Seed admin email (adjust to your actual admin email)
INSERT INTO public.admin_emails (email)
VALUES ('admin@standscout.com')
ON CONFLICT DO NOTHING;

-- Server-side admin check: looks up the JWT email in admin_emails table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE email = lower(auth.jwt() ->> 'email')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Admin emails table: only admins can read/modify
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin emails"
  ON public.admin_emails FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Only admins can modify admin emails"
  ON public.admin_emails FOR ALL
  USING (public.is_admin());

-- ============================================
-- 2. Add user_id columns
-- ============================================
ALTER TABLE public.stands ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_stands_user_id ON public.stands (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);

-- ============================================
-- 3. Rewrite RLS policies for stands
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Public sees approved stands" ON public.stands;
DROP POLICY IF EXISTS "Anyone can submit a stand (pending only)" ON public.stands;
DROP POLICY IF EXISTS "Admin can update stands" ON public.stands;
DROP POLICY IF EXISTS "Admin can delete stands" ON public.stands;

-- New policies
CREATE POLICY "Public sees approved stands or own stands"
  ON public.stands FOR SELECT
  USING (
    status = 'approved'
    OR public.is_admin()
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "Anyone can submit a stand (pending only)"
  ON public.stands FOR INSERT
  WITH CHECK (status = 'pending' OR status IS NULL);

CREATE POLICY "Admin or owner can update stands"
  ON public.stands FOR UPDATE
  USING (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY "Only admin can delete stands"
  ON public.stands FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 4. Rewrite RLS policies for sponsors
-- ============================================

DROP POLICY IF EXISTS "Admin can insert sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admin can update sponsors" ON public.sponsors;
DROP POLICY IF EXISTS "Admin can delete sponsors" ON public.sponsors;

CREATE POLICY "Admin can insert sponsors"
  ON public.sponsors FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update sponsors"
  ON public.sponsors FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admin can delete sponsors"
  ON public.sponsors FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 5. Rewrite RLS policies for ad_leads
-- ============================================

DROP POLICY IF EXISTS "Admin can view leads" ON public.ad_leads;

CREATE POLICY "Admin can view leads"
  ON public.ad_leads FOR SELECT
  USING (public.is_admin());

-- ============================================
-- 6. Rewrite storage delete policy
-- ============================================

DROP POLICY IF EXISTS "Admin can delete stand photos" ON storage.objects;

CREATE POLICY "Admin can delete stand photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'stand-photos' AND public.is_admin());

-- ============================================
-- 7. Owner edit restriction trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.enforce_owner_edit()
RETURNS trigger AS $$
BEGIN
  -- Admins can edit anything
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Non-admins: reset critical fields to their old values
  NEW.name := OLD.name;
  NEW.latitude := OLD.latitude;
  NEW.longitude := OLD.longitude;
  NEW.address := OLD.address;
  NEW.address_geocoded := OLD.address_geocoded;
  NEW.categories := OLD.categories;
  NEW.status := OLD.status;
  NEW.user_id := OLD.user_id;
  NEW.rating := OLD.rating;
  NEW.review_count := OLD.review_count;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_stand_update ON public.stands;
CREATE TRIGGER before_stand_update
  BEFORE UPDATE ON public.stands
  FOR EACH ROW EXECUTE FUNCTION public.enforce_owner_edit();

-- ============================================
-- 8. Rewrite sponsor SELECT policy
-- ============================================

DROP POLICY IF EXISTS "Active sponsors are public" ON public.sponsors;

CREATE POLICY "Active sponsors are public"
  ON public.sponsors FOR SELECT
  USING (active = true OR public.is_admin());
