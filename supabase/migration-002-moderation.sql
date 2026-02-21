-- Migration 002: Stand Moderation System
-- Run this in the Supabase SQL Editor AFTER schema.sql

-- ============================================
-- 1. Add status column to stands
-- ============================================
alter table public.stands
  add column if not exists status text not null default 'pending'
  check (status in ('pending', 'approved', 'rejected'));

-- Approve any existing stands (they were added before moderation)
update public.stands set status = 'approved' where status = 'pending';

-- Index for filtering by status
create index if not exists idx_stands_status on public.stands (status);

-- ============================================
-- 2. Drop old permissive RLS policies on stands
-- ============================================
drop policy if exists "Stands are viewable by everyone" on public.stands;
drop policy if exists "Anyone can add a stand" on public.stands;
drop policy if exists "Anyone can update stand availability" on public.stands;

-- ============================================
-- 3. New RLS policies for stands
-- ============================================

-- Public users can only see approved stands
create policy "Public sees approved stands"
  on public.stands for select
  using (
    status = 'approved'
    or auth.role() = 'authenticated'
  );

-- Anyone can insert (but status defaults to 'pending')
create policy "Anyone can submit a stand"
  on public.stands for insert
  with check (true);

-- Only authenticated users can update stands (admin)
create policy "Admin can update stands"
  on public.stands for update
  using (auth.role() = 'authenticated');

-- Only authenticated users can delete stands (admin)
create policy "Admin can delete stands"
  on public.stands for delete
  using (auth.role() = 'authenticated');
