import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Search, Loader2 } from 'lucide-react';
import { reverseGeocode, addressAutocomplete } from '../lib/geocoding';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [41.2834, -81.2232];
const DEFAULT_ZOOM = 11;

const pinIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="42">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#2d6a4f" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="11" r="5" fill="white" opacity="0.9"/>
  </svg>`,
  className: 'location-picker-marker',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  /** Called when a human-readable address is resolved from the pin location */
  onAddressResolved?: (address: string) => void;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function PanTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  const prev = useRef<string | null>(null);

  useEffect(() => {
    if (!center) return;
    const key = center.join(',');
    if (key === prev.current) return;
    prev.current = key;
    map.flyTo(center, Math.max(map.getZoom(), 14), { duration: 0.8 });
  }, [center, map]);

  return null;
}

function DraggablePin({ position, onDragEnd }: { position: [number, number]; onDragEnd: (lat: number, lng: number) => void }) {
  const markerRef = useRef<L.Marker | null>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }),
    [onDragEnd],
  );

  return <Marker draggable position={position} icon={pinIcon} ref={markerRef} eventHandlers={eventHandlers} />;
}

export default function LocationPicker({ latitude, longitude, onChange, onAddressResolved }: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ displayName: string; latitude: number; longitude: number }>>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const hasPin = latitude !== null && longitude !== null;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const resolveAddress = useCallback(
    async (lat: number, lng: number) => {
      const result = await reverseGeocode(lat, lng);
      if (result) {
        setResolvedAddress(result.shortAddress);
        onAddressResolved?.(result.shortAddress);
      }
    },
    [onAddressResolved],
  );

  const handleClick = useCallback(
    (lat: number, lng: number) => {
      onChange(lat, lng);
      setPanTarget([lat, lng]);
      resolveAddress(lat, lng);
    },
    [onChange, resolveAddress],
  );

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        onChange(lat, lng);
        setPanTarget([lat, lng]);
        resolveAddress(lat, lng);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await addressAutocomplete(q);
      setSearchResults(results);
      setShowResults(results.length > 0);
      setSearching(false);
    }, 300);
  };

  const handleSelectResult = (result: { displayName: string; latitude: number; longitude: number }) => {
    onChange(result.latitude, result.longitude);
    setPanTarget([result.latitude, result.longitude]);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);

    // Use the display name from the search result
    const shortName = result.displayName.split(',').slice(0, 3).join(',');
    setResolvedAddress(shortName);
    onAddressResolved?.(shortName);
  };

  return (
    <div className="space-y-3">
      {/* Address search */}
      <div className="relative" ref={searchRef}>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-sage-dark bg-white focus-within:ring-2 focus-within:ring-forest/20 focus-within:border-forest">
          <Search className="w-4 h-4 text-earth-light shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Search for an address..."
            className="flex-1 text-sm outline-none bg-transparent text-earth placeholder:text-earth-light/50"
          />
          {searching && <Loader2 className="w-4 h-4 animate-spin text-earth-light" />}
        </div>
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-[2000] top-full left-0 right-0 mt-1 bg-white rounded-lg border border-sage-dark/30 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
            {searchResults.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectResult(r)}
                className="w-full text-left px-3 py-2.5 text-sm text-earth hover:bg-sage/50 transition-colors border-0 bg-transparent cursor-pointer"
              >
                {r.displayName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Buttons row */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-sage-dark/40 text-earth rounded-xl text-sm font-medium hover:border-forest hover:text-forest transition-colors disabled:opacity-50"
        >
          {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          Use My Location
        </button>
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-sage-dark/30" style={{ height: 260 }}>
        <MapContainer
          center={hasPin ? [latitude, longitude] : DEFAULT_CENTER}
          zoom={hasPin ? 15 : DEFAULT_ZOOM}
          className="w-full h-full"
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onClick={handleClick} />
          <PanTo center={panTarget} />
          {hasPin && <DraggablePin position={[latitude, longitude]} onDragEnd={handleClick} />}
        </MapContainer>

        {!hasPin && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm border border-sage-dark/20">
              <p className="text-sm text-earth font-medium">Tap the map to place your stand</p>
            </div>
          </div>
        )}
      </div>

      {/* Resolved address (replaces raw lat/lng) */}
      {hasPin && (
        <p className="text-xs text-earth-light">
          {resolvedAddress
            ? `Pin placed near ${resolvedAddress} — drag to fine-tune`
            : 'Pin placed — drag to fine-tune'}
        </p>
      )}
    </div>
  );
}
