import { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Crosshair } from 'lucide-react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Stand } from '../data/types';
import StandMarker from './StandMarker';

// Mantua, Ohio 44255
const DEFAULT_CENTER: [number, number] = [41.2834, -81.2232];
const DEFAULT_ZOOM = 11;

/** Auto-center on user location when map first loads */
function AutoLocate() {
  const map = useMap();
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    if (asked) return;
    setAsked(true);
    map.locate({ setView: true, maxZoom: 12 });
  }, [map, asked]);

  return null;
}

function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 13 });
    map.once('locationfound', () => setLocating(false));
    map.once('locationerror', () => setLocating(false));
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-6 right-4 z-[1000] bg-white shadow-lg rounded-xl p-2.5 border border-sage-dark/30 hover:bg-sage transition-colors"
      aria-label="Find my location"
      title="Find my location"
    >
      <Crosshair className={`w-5 h-5 text-forest ${locating ? 'animate-spin' : ''}`} />
    </button>
  );
}

interface MapViewProps {
  stands: Stand[];
  className?: string;
}

export default function MapView({ stands, className = '' }: MapViewProps) {
  const mapRef = useRef<LeafletMap | null>(null);

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full rounded-xl"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {stands.map(stand => (
            <StandMarker key={stand.id} stand={stand} />
          ))}
        </MarkerClusterGroup>
        <AutoLocate />
        <LocateButton />
      </MapContainer>
    </div>
  );
}
