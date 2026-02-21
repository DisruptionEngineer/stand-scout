import { supabase, isSupabaseConfigured } from './supabase';
import { mockStands, mockReviews } from '../data/stands';
import type { Stand, Review, Category } from '../data/types';
import type { StandInsert, ReviewInsert, ReportInsert } from './database.types';

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
    address: row.address as string,
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
  updates: Record<string, unknown>,
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
