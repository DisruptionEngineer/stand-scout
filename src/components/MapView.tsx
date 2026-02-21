import { useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Crosshair } from 'lucide-react';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Stand } from '../data/types';
import StandMarker from './StandMarker';

// Shenandoah Valley center
const DEFAULT_CENTER: [number, number] = [38.43, -78.87];
const DEFAULT_ZOOM = 11;

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
        {stands.map(stand => (
          <StandMarker key={stand.id} stand={stand} />
        ))}
        <LocateButton />
      </MapContainer>
    </div>
  );
}
