import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Search, Loader2 } from 'lucide-react';
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
  /** If provided, a "Find on map" button will geocode this address */
  address?: string;
}

/** Handles map click events to place the pin */
function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Pans the map to a new center */
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

/** Draggable marker */
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

export default function LocationPicker({ latitude, longitude, onChange, address }: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);
  const hasPin = latitude !== null && longitude !== null;

  const handleClick = useCallback(
    (lat: number, lng: number) => {
      onChange(lat, lng);
      setPanTarget([lat, lng]);
    },
    [onChange],
  );

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setPanTarget([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleGeocode = async () => {
    if (!address?.trim()) return;
    setGeocoding(true);
    try {
      const q = encodeURIComponent(address.trim());
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
        headers: { 'Accept': 'application/json' },
      });
      const data = await res.json();
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        onChange(lat, lng);
        setPanTarget([lat, lng]);
      }
    } catch {
      // silently fail — user can still place manually
    }
    setGeocoding(false);
  };

  return (
    <div className="space-y-3">
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
        {address?.trim() && (
          <button
            type="button"
            onClick={handleGeocode}
            disabled={geocoding}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-sage-dark/40 text-earth rounded-xl text-sm font-medium hover:border-forest hover:text-forest transition-colors disabled:opacity-50"
          >
            {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Find Address on Map
          </button>
        )}
      </div>

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
              <p className="text-sm text-earth font-medium">📍 Tap the map to place your stand</p>
            </div>
          </div>
        )}
      </div>

      {hasPin && (
        <p className="text-xs text-earth-light">
          📍 {latitude.toFixed(5)}, {longitude.toFixed(5)} — drag the pin or tap elsewhere to adjust
        </p>
      )}
    </div>
  );
}
