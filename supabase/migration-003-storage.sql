-- Migration 003: Photo Storage
-- Run this in the Supabase SQL Editor

-- Create a public bucket for stand photos
insert into storage.buckets (id, name, public)
values ('stand-photos', 'stand-photos', true)
on conflict (id) do nothing;

-- Anyone can upload photos (max 5MB enforced client-side)
create policy "Anyone can upload stand photos"
  on storage.objects for insert
  with check (bucket_id = 'stand-photos');

-- Anyone can view photos
create policy "Stand photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'stand-photos');

-- Only authenticated users (admin) can delete photos
create policy "Admin can delete stand photos"
  on storage.objects for delete
  using (bucket_id = 'stand-photos' and auth.role() = 'authenticated');
