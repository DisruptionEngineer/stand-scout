import { supabase, isSupabaseConfigured } from './supabase';
import { mockStands, mockReviews } from '../data/stands';
import type { Stand, Review, Category } from '../data/types';
import type { StandInsert, StandUpdate, ReviewInsert, ReportInsert, SponsorInsert, SponsorUpdate, AdLeadInsert, ProductReportInsert } from './database.types';

// ============================================
// Row → App type mappers
// ============================================
function rowToStand(row: Record<string, unknown>): Stand {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    address: (row.address_geocoded as string) || (row.address as string),
    categories: row.categories as Category[],
    products: row.products as string[],
    currentlyAvailable: row.currently_available as string[],
    availabilityStatus: row.availability_status as Stand['availabilityStatus'],
    lastStatusUpdate: row.last_status_update as string | null,
    lastStatusSource: row.last_status_source as Stand['lastStatusSource'],
    typicalAvailability: row.typical_availability as string,
    phone: row.phone as string,
    website: (row.website as string) || undefined,
    smsLinked: row.sms_linked as boolean,
    photos: row.photos as string[],
    ownerName: row.owner_name as string,
    dateAdded: row.date_added as string,
    seasonal: row.seasonal as boolean,
    seasonalNotes: (row.seasonal_notes as string) || undefined,
    rating: row.rating as number,
    reviewCount: row.review_count as number,
    paymentMethods: row.payment_methods as string[],
    selfServe: row.self_serve as boolean,
    status: (row.status as Stand['status']) ?? 'approved',
  };
}

function rowToReview(row: Record<string, unknown>): Review {
  return {
    id: row.id as string,
    standId: row.stand_id as string,
    rating: row.rating as number,
    text: row.text as string,
    authorName: row.author_name as string,
    date: row.date as string,
  };
}

// ============================================
// FETCH
// ============================================

export async function fetchStands(): Promise<Stand[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockStands;
  }
  const { data, error } = await supabase
    .from('stands')
    .select('*')
    .eq('status', 'approved')
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching stands:', error);
    return mockStands; // fallback
  }
  return (data ?? []).map(rowToStand);
}

export async function fetchStand(id: string): Promise<Stand | null> {
  if (!isSupabaseConfigured || !supabase) {
    return mockStands.find(s => s.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from('stands')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching stand:', error);
    return mockStands.find(s => s.id === id) ?? null;
  }
  return data ? rowToStand(data) : null;
}

export async function fetchReviews(standId: string): Promise<Review[]> {
  if (!isSupabaseConfigured || !supabase) {
    return mockReviews.filter(r => r.standId === standId);
  }
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('stand_id', standId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return mockReviews.filter(r => r.standId === standId);
  }
  return (data ?? []).map(rowToReview);
}

// ============================================
// CREATE
// ============================================

export interface NewStandInput {
  name: string;
  ownerName: string;
  description: string;
  address: string;
  addressGeocoded?: string;
  latitude: number;
  longitude: number;
  phone: string;
  website?: string;
  categories: string[];
  products: string[];
  typicalAvailability: string;
  paymentMethods: string[];
  selfServe: boolean;
}

export async function createStand(input: NewStandInput): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured || !supabase) {
    // Mock: return a fake ID
    return { id: `mock-${Date.now()}` };
  }
  const row: StandInsert = {
    name: input.name,
    owner_name: input.ownerName,
    description: input.description,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    phone: input.phone,
    website: input.website || null,
    address_geocoded: input.addressGeocoded || null,
    categories: input.categories,
    products: input.products,
    typical_availability: input.typicalAvailability,
    payment_methods: input.paymentMethods,
    self_serve: input.selfServe,
  };
  const { data, error } = await supabase
    .from('stands')
    .insert(row)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating stand:', error);
    return null;
  }
  return data;
}

export async function submitReport(
  standId: string,
  status: 'stocked' | 'empty',
  productsSpotted: string[] = [],
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true; // mock success
  }
  const row: ReportInsert = {
    stand_id: standId,
    status,
    products_spotted: productsSpotted,
    source: 'app_report',
    report_weight: 1,
  };
  const { error } = await supabase
    .from('availability_reports')
    .insert(row);

  if (error) {
    console.error('Error submitting report:', error);
    return false;
  }
  return true;
}

// ============================================
// ADMIN
// ============================================

export type StandStatus = 'pending' | 'approved' | 'rejected';

export async function fetchAllStands(statusFilter?: StandStatus): Promise<Stand[]> {
  if (!isSupabaseConfigured || !supabase) return mockStands;
  let query = supabase.from('stands').select('*').order('created_at', { ascending: false });
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching all stands:', error);
    return [];
  }
  return (data ?? []).map(rowToStand);
}

export async function fetchPendingStands(): Promise<Stand[]> {
  return fetchAllStands('pending');
}

export async function updateStandStatus(id: string, status: StandStatus): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('stands').update({ status }).eq('id', id);
  if (error) {
    console.error('Error updating stand status:', error);
    return false;
  }
  return true;
}

export async function updateStand(
  id: string,
  updates: StandUpdate,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('stands').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating stand:', error);
    return false;
  }
  return true;
}

export async function deleteStand(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('stands').delete().eq('id', id);
  if (error) {
    console.error('Error deleting stand:', error);
    return false;
  }
  return true;
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalReviews: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const defaults: AdminStats = { total: 0, pending: 0, approved: 0, rejected: 0, totalReviews: 0 };
  if (!isSupabaseConfigured || !supabase) return defaults;

  const { data: stands, error: sErr } = await supabase.from('stands').select('status');
  if (sErr) { console.error(sErr); return defaults; }

  const { count, error: rErr } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });
  if (rErr) console.error(rErr);

  const rows = stands ?? [];
  return {
    total: rows.length,
    pending: rows.filter(r => r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    rejected: rows.filter(r => r.status === 'rejected').length,
    totalReviews: count ?? 0,
  };
}

// ============================================
// PHOTOS
// ============================================

const PHOTO_BUCKET = 'stand-photos';

export async function uploadStandPhoto(
  standId: string,
  file: File,
): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${standId}/${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadErr) {
    console.error('Error uploading photo:', uploadErr);
    return null;
  }

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  const publicUrl = data.publicUrl;

  // Append URL to stand's photos array
  const { data: stand } = await supabase
    .from('stands')
    .select('photos')
    .eq('id', standId)
    .single();

  const currentPhotos: string[] = stand?.photos ?? [];
  const { error: updateErr } = await supabase
    .from('stands')
    .update({ photos: [...currentPhotos, publicUrl] })
    .eq('id', standId);

  if (updateErr) {
    console.error('Error updating stand photos:', updateErr);
    return null;
  }

  return publicUrl;
}

export async function deleteStandPhoto(
  standId: string,
  photoUrl: string,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;

  // Extract storage path from URL
  const parts = photoUrl.split(`/${PHOTO_BUCKET}/`);
  const storagePath = parts[1];
  if (storagePath) {
    await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
  }

  // Remove URL from stand's photos array
  const { data: stand } = await supabase
    .from('stands')
    .select('photos')
    .eq('id', standId)
    .single();

  const currentPhotos: string[] = stand?.photos ?? [];
  const { error } = await supabase
    .from('stands')
    .update({ photos: currentPhotos.filter(p => p !== photoUrl) })
    .eq('id', standId);

  if (error) {
    console.error('Error removing photo from stand:', error);
    return false;
  }
  return true;
}

// ============================================
// SPONSORS
// ============================================

export interface Sponsor {
  id: string;
  name: string;
  description: string;
  url: string | null;
  logoUrl: string | null;
  latitude: number;
  longitude: number;
  address: string;
  category: string;
  monthlyRate: number;
  active: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  startDate: string;
  notes: string | null;
}

function rowToSponsor(row: Record<string, unknown>): Sponsor {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    url: row.url as string | null,
    logoUrl: row.logo_url as string | null,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    address: row.address as string,
    category: row.category as string,
    monthlyRate: Number(row.monthly_rate),
    active: row.active as boolean,
    contactEmail: row.contact_email as string | null,
    contactPhone: row.contact_phone as string | null,
    startDate: row.start_date as string,
    notes: row.notes as string | null,
  };
}

export async function fetchSponsorsNear(lat: number, lng: number, radiusMiles = 15): Promise<Sponsor[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  // Rough bounding box (1 deg lat ~ 69 mi)
  const latDelta = radiusMiles / 69;
  const lngDelta = radiusMiles / (69 * Math.cos((lat * Math.PI) / 180));
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('active', true)
    .gte('latitude', lat - latDelta)
    .lte('latitude', lat + latDelta)
    .gte('longitude', lng - lngDelta)
    .lte('longitude', lng + lngDelta);
  if (error) { console.error(error); return []; }
  return (data ?? []).map(rowToSponsor);
}

export async function fetchAllSponsors(): Promise<Sponsor[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []).map(rowToSponsor);
}

export async function createSponsor(input: SponsorInsert): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('sponsors').insert(input);
  if (error) { console.error(error); return false; }
  return true;
}

export async function updateSponsor(id: string, updates: SponsorUpdate): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('sponsors').update(updates).eq('id', id);
  if (error) { console.error(error); return false; }
  return true;
}

export async function deleteSponsor(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('sponsors').delete().eq('id', id);
  if (error) { console.error(error); return false; }
  return true;
}

// ============================================
// AD LEADS
// ============================================

export interface AdLeadInput {
  business_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  message?: string;
  tier: string;
}

export async function submitAdLead(input: AdLeadInput): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const row: AdLeadInsert = {
    business_name: input.business_name,
    contact_name: input.contact_name,
    email: input.email,
    phone: input.phone ?? null,
    message: input.message ?? null,
    tier: input.tier,
  };
  const { error } = await supabase.from('ad_leads').insert(row);
  if (error) { console.error(error); return false; }
  return true;
}

export async function fetchAdLeads(): Promise<Record<string, unknown>[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase
    .from('ad_leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function submitReview(
  standId: string,
  rating: number,
  text: string,
  authorName: string,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true; // mock success
  }
  const row: ReviewInsert = {
    stand_id: standId,
    rating,
    text,
    author_name: authorName,
  };
  const { error } = await supabase
    .from('reviews')
    .insert(row);

  if (error) {
    console.error('Error submitting review:', error);
    return false;
  }
  return true;
}

// ============================================
// PRODUCT REPORTS
// ============================================

export async function submitProductReports(
  standId: string,
  products: Array<{ name: string; isAvailable: boolean }>,
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return true; // mock success
  }
  if (products.length === 0) return true;

  const rows: ProductReportInsert[] = products.map(p => ({
    stand_id: standId,
    product_name: p.name,
    is_available: p.isAvailable,
    source: 'app_report' as const,
    report_weight: 1,
  }));

  const { error } = await supabase
    .from('product_reports')
    .insert(rows);

  if (error) {
    console.error('Error submitting product reports:', error);
    return false;
  }
  return true;
}

export async function fetchRecentProductReports(
  standId: string,
): Promise<Array<{ productName: string; availableCount: number; unavailableCount: number }>> {
  if (!isSupabaseConfigured || !supabase) return [];

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('product_reports')
    .select('product_name, is_available, report_weight')
    .eq('stand_id', standId)
    .gte('created_at', sixHoursAgo);

  if (error) {
    console.error('Error fetching product reports:', error);
    return [];
  }

  // Aggregate by product
  const map = new Map<string, { available: number; unavailable: number }>();
  for (const row of data ?? []) {
    const key = row.product_name as string;
    const weight = (row.report_weight as number) ?? 1;
    const entry = map.get(key) ?? { available: 0, unavailable: 0 };
    if (row.is_available) {
      entry.available += weight;
    } else {
      entry.unavailable += weight;
    }
    map.set(key, entry);
  }

  return Array.from(map.entries()).map(([name, counts]) => ({
    productName: name,
    availableCount: counts.available,
    unavailableCount: counts.unavailable,
  }));
}
