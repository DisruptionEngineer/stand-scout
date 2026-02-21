-- Stand Scout Database Schema
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- STANDS TABLE
-- ============================================
create table public.stands (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  address text not null,
  categories text[] not null default '{}',
  products text[] not null default '{}',
  currently_available text[] not null default '{}',
  availability_status text not null default 'unknown' check (availability_status in ('available', 'sold_out', 'unknown')),
  last_status_update timestamptz,
  last_status_source text check (last_status_source in ('owner_sms', 'community_qr', 'community_app')),
  typical_availability text not null default '',
  phone text not null,
  website text,
  sms_linked boolean not null default false,
  photos text[] not null default '{}',
  owner_name text not null,
  date_added date not null default current_date,
  seasonal boolean not null default false,
  seasonal_notes text,
  rating double precision not null default 0,
  review_count integer not null default 0,
  payment_methods text[] not null default '{}',
  self_serve boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  stand_id uuid not null references public.stands(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text not null,
  author_name text not null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

-- ============================================
-- AVAILABILITY REPORTS TABLE
-- ============================================
create table public.availability_reports (
  id uuid default uuid_generate_v4() primary key,
  stand_id uuid not null references public.stands(id) on delete cascade,
  status text not null check (status in ('stocked', 'empty')),
  products_spotted text[] not null default '{}',
  photo_url text,
  timestamp timestamptz not null default now(),
  source text not null default 'app_report' check (source in ('qr_scan', 'app_report'))
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_stands_location on public.stands (latitude, longitude);
create index idx_stands_availability on public.stands (availability_status);
create index idx_stands_categories on public.stands using gin (categories);
create index idx_reviews_stand_id on public.reviews (stand_id);
create index idx_availability_reports_stand_id on public.availability_reports (stand_id);
create index idx_availability_reports_timestamp on public.availability_reports (timestamp desc);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Stands: anyone can read, anyone can insert (no auth required for MVP)
alter table public.stands enable row level security;
create policy "Stands are viewable by everyone" on public.stands for select using (true);
create policy "Anyone can add a stand" on public.stands for insert with check (true);
create policy "Anyone can update stand availability" on public.stands for update using (true);

-- Reviews: anyone can read, anyone can insert
alter table public.reviews enable row level security;
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);
create policy "Anyone can add a review" on public.reviews for insert with check (true);

-- Availability reports: anyone can read, anyone can insert
alter table public.availability_reports enable row level security;
create policy "Reports are viewable by everyone" on public.availability_reports for select using (true);
create policy "Anyone can add a report" on public.availability_reports for insert with check (true);

-- ============================================
-- FUNCTION: Update stand rating when review is added
-- ============================================
create or replace function public.update_stand_rating()
returns trigger as $$
begin
  update public.stands
  set
    rating = (select coalesce(avg(rating), 0) from public.reviews where stand_id = NEW.stand_id),
    review_count = (select count(*) from public.reviews where stand_id = NEW.stand_id)
  where id = NEW.stand_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_review_added
  after insert on public.reviews
  for each row execute function public.update_stand_rating();

-- ============================================
-- FUNCTION: Update stand availability on report
-- ============================================
create or replace function public.update_stand_on_report()
returns trigger as $$
begin
  update public.stands
  set
    availability_status = case when NEW.status = 'stocked' then 'available' else 'sold_out' end,
    last_status_update = NEW.timestamp,
    last_status_source = case when NEW.source = 'qr_scan' then 'community_qr' else 'community_app' end,
    currently_available = case when NEW.status = 'stocked' and array_length(NEW.products_spotted, 1) > 0
      then NEW.products_spotted
      else currently_available
    end
  where id = NEW.stand_id;
  return NEW;
end;
$$ language plpgsql;

create trigger on_availability_reported
  after insert on public.availability_reports
  for each row execute function public.update_stand_on_report();
