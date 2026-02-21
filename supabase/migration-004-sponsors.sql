-- Migration 004: Sponsors & Ad Leads
-- Run this in the Supabase SQL Editor

-- ============================================
-- SPONSORS TABLE
-- ============================================
create table public.sponsors (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null default '',
  url text,
  logo_url text,
  latitude double precision not null,
  longitude double precision not null,
  address text not null default '',
  category text not null default 'Local Business',
  monthly_rate numeric(8,2) not null default 50.00,
  active boolean not null default true,
  contact_email text,
  contact_phone text,
  start_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_sponsors_location on public.sponsors (latitude, longitude);
create index idx_sponsors_active on public.sponsors (active);

-- RLS: anyone can read active sponsors, only admin can write
alter table public.sponsors enable row level security;

create policy "Active sponsors are public"
  on public.sponsors for select
  using (active = true or auth.role() = 'authenticated');

create policy "Admin can insert sponsors"
  on public.sponsors for insert
  with check (auth.role() = 'authenticated');

create policy "Admin can update sponsors"
  on public.sponsors for update
  using (auth.role() = 'authenticated');

create policy "Admin can delete sponsors"
  on public.sponsors for delete
  using (auth.role() = 'authenticated');

-- ============================================
-- AD LEADS TABLE (from Advertise page form)
-- ============================================
create table public.ad_leads (
  id uuid default uuid_generate_v4() primary key,
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  message text,
  tier text not null default 'standard',
  created_at timestamptz not null default now()
);

alter table public.ad_leads enable row level security;

-- Anyone can submit a lead
create policy "Anyone can submit a lead"
  on public.ad_leads for insert
  with check (true);

-- Only admin can view leads
create policy "Admin can view leads"
  on public.ad_leads for select
  using (auth.role() = 'authenticated');
