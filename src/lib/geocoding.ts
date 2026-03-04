const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export interface ReverseGeocodeResult {
  displayName: string;
  road: string;
  locality: string;
  shortAddress: string;
}

export interface AddressSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
}

// Cache reverse geocode results to avoid hammering Nominatim
const reverseCache = new Map<string, ReverseGeocodeResult>();

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseGeocodeResult | null> {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (reverseCache.has(key)) return reverseCache.get(key)!;
  // Cap cache to prevent unbounded growth during heavy map interaction
  if (reverseCache.size > 200) {
    const oldest = reverseCache.keys().next().value;
    if (oldest !== undefined) reverseCache.delete(oldest);
  }

  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
      { headers: { Accept: 'application/json', 'User-Agent': 'StandScout/1.0' } },
    );
    const data = await res.json();
    const addr = data.address ?? {};

    const road = addr.road ?? addr.highway ?? addr.path ?? '';
    const houseNumber = addr.house_number ?? '';
    const locality = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
    const state = addr.state ?? '';

    const street = [houseNumber, road].filter(Boolean).join(' ');
    const shortAddress = [street, locality, state].filter(Boolean).join(', ');

    const result: ReverseGeocodeResult = {
      displayName: (data.display_name as string) ?? shortAddress,
      road,
      locality,
      shortAddress,
    };

    reverseCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

export async function addressAutocomplete(
  query: string,
): Promise<AddressSuggestion[]> {
  if (query.trim().length < 3) return [];

  try {
    const params = new URLSearchParams({
      format: 'json',
      q: query,
      limit: '5',
      countrycodes: 'us',
    });

    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'StandScout/1.0' },
    });
    const data: Array<Record<string, unknown>> = await res.json();

    return data.map(item => ({
      displayName: item.display_name as string,
      latitude: parseFloat(item.lat as string),
      longitude: parseFloat(item.lon as string),
    }));
  } catch {
    return [];
  }
}

// Auto-generate stand name from address + categories
const ROAD_PATTERN =
  /\b(Route|Rte|Rd|Road|St|Street|Ave|Avenue|Dr|Drive|Ln|Lane|Blvd|Pkwy|Hwy|Highway|Pike|Trail|Way|Ct|Court)\b/i;

export function generateStandName(
  address: string,
  categories: string[],
): string {
  const primary = categories[0] ?? 'Farm';
  const prep = ROAD_PATTERN.test(address) ? 'on' : 'at';
  // Use first line of address (before first comma)
  const parts = address.split(',');
  const location = parts[0]?.trim() ?? address.trim();
  return `${primary} stand ${prep} ${location}`;
}
