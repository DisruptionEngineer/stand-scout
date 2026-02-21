import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import type { Stand } from '../data/types';
import { MapPin, Navigation } from 'lucide-react';

function getMarkerColor(stand: Stand): string {
  if (stand.availabilityStatus === 'sold_out') return '#dc2626';
  if (stand.availabilityStatus !== 'available') return '#9ca3af';
  // Available — check freshness
  if (stand.lastStatusUpdate) {
    const hoursAgo = (Date.now() - new Date(stand.lastStatusUpdate).getTime()) / 3600000;
    if (hoursAgo < 1) return '#16a34a'; // bright green — fresh
    if (hoursAgo < 6) return '#ca8a04'; // amber — stale
  }
  return '#22c55e'; // default green for available
}

function createMarkerIcon(stand: Stand) {
  const color = getMarkerColor(stand);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="36">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="11" r="5" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

export default function StandMarker({ stand }: { stand: Stand }) {
  const icon = createMarkerIcon(stand);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stand.latitude},${stand.longitude}`;

  return (
    <Marker position={[stand.latitude, stand.longitude]} icon={icon}>
      <Popup maxWidth={260} className="stand-popup">
        <div className="p-1">
          <Link to={`/stand/${stand.id}`} className="font-semibold text-forest hover:underline text-sm no-underline">
            {stand.name}
          </Link>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3" />
            {stand.address}
          </div>
          <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{stand.description}</p>

          {stand.currentlyAvailable.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {stand.currentlyAvailable.slice(0, 3).map(item => (
                <span key={item} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <Link
              to={`/stand/${stand.id}`}
              className="text-xs text-forest font-medium hover:underline no-underline"
            >
              View Details →
            </Link>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber font-medium flex items-center gap-0.5 hover:underline ml-auto no-underline"
            >
              <Navigation className="w-3 h-3" />
              Directions
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
