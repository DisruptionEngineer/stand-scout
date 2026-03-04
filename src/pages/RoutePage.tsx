import { useState, useMemo } from 'react';
import { Route, MapPin, Navigation, Loader2, LocateFixed } from 'lucide-react';
import { useStands } from '../lib/hooks';
import StandCard from '../components/StandCard';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Distance from point to the closest point on a line segment A→B */
function distToSegment(
  pLat: number, pLon: number,
  aLat: number, aLon: number,
  bLat: number, bLon: number,
): number {
  const dx = bLon - aLon;
  const dy = bLat - aLat;
  if (dx === 0 && dy === 0) return haversine(pLat, pLon, aLat, aLon);
  const t = Math.max(0, Math.min(1, ((pLon - aLon) * dx + (pLat - aLat) * dy) / (dx * dx + dy * dy)));
  const projLat = aLat + t * dy;
  const projLon = aLon + t * dx;
  return haversine(pLat, pLon, projLat, projLon);
}

export default function RoutePage() {
  const { stands, loading } = useStands();
  const [startLat, setStartLat] = useState('');
  const [startLng, setStartLng] = useState('');
  const [endLat, setEndLat] = useState('');
  const [endLng, setEndLng] = useState('');
  const [radius, setRadius] = useState(10);
  const [searched, setSearched] = useState(false);

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setStartLat(pos.coords.latitude.toFixed(4));
        setStartLng(pos.coords.longitude.toFixed(4));
      },
      () => alert('Could not get your location'),
      { timeout: 5000 },
    );
  };

  const routeStands = useMemo(() => {
    if (!searched) return [];
    const sLat = parseFloat(startLat);
    const sLng = parseFloat(startLng);
    const eLat = parseFloat(endLat);
    const eLng = parseFloat(endLng);
    if (isNaN(sLat) || isNaN(sLng) || isNaN(eLat) || isNaN(eLng)) return [];

    return stands
      .map(stand => ({
        stand,
        dist: distToSegment(stand.latitude, stand.longitude, sLat, sLng, eLat, eLng),
      }))
      .filter(s => s.dist <= radius)
      .sort((a, b) => a.dist - b.dist)
      .map(s => s.stand);
  }, [searched, startLat, startLng, endLat, endLng, radius, stands]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest';

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-2 animate-fade-up">
          <Route className="w-6 h-6 text-forest" />
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-earth">Stands Along My Drive</h1>
        </div>
        <p className="text-sm text-earth-light mb-8 animate-fade-up animate-delay-1">
          Enter a start and destination to find stands near your route.
        </p>

        <form onSubmit={handleSearch} className="bg-white rounded-xl border border-sage-dark/30 p-6 mb-8 animate-fade-up animate-delay-2">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-display font-semibold text-earth uppercase tracking-wider">Start</h3>
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="flex items-center gap-1 text-xs text-forest font-medium hover:underline bg-transparent border-0 p-0"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  Use my location
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required placeholder="Latitude" value={startLat} onChange={e => { setStartLat(e.target.value); setSearched(false); }} className={inputClass} />
                <input type="text" required placeholder="Longitude" value={startLng} onChange={e => { setStartLng(e.target.value); setSearched(false); }} className={inputClass} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-3">Destination</h3>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" required placeholder="Latitude" value={endLat} onChange={e => { setEndLat(e.target.value); setSearched(false); }} className={inputClass} />
                <input type="text" required placeholder="Longitude" value={endLng} onChange={e => { setEndLng(e.target.value); setSearched(false); }} className={inputClass} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-earth font-medium">Radius:</label>
              <select
                value={radius}
                onChange={e => { setRadius(Number(e.target.value)); setSearched(false); }}
                className="text-sm border border-sage-dark rounded-lg px-2 py-1.5 bg-white text-earth focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value={5}>5 miles</option>
                <option value={10}>10 miles</option>
                <option value={20}>20 miles</option>
                <option value={50}>50 miles</option>
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-forest text-white rounded-lg text-sm font-semibold hover:bg-forest-light transition-colors ml-auto"
            >
              <Navigation className="w-4 h-4" />
              Find Stands
            </button>
          </div>

          <p className="text-xs text-earth-light mt-3">
            Tip: right-click on Google Maps &rarr; &ldquo;What&apos;s here?&rdquo; to get coordinates for any location.
          </p>
        </form>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-forest" />
          </div>
        ) : searched ? (
          routeStands.length > 0 ? (
            <div>
              <p className="text-sm text-earth-light mb-4">
                {routeStands.length} stand{routeStands.length !== 1 ? 's' : ''} found within {radius} miles of your route
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {routeStands.map(stand => (
                  <StandCard key={stand.id} stand={stand} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-earth-light mx-auto mb-3" />
              <p className="text-lg font-display font-semibold text-earth">No stands along this route</p>
              <p className="text-sm text-earth-light mt-1">Try increasing the radius or exploring a different area.</p>
            </div>
          )
        ) : (
          <div className="text-center py-16 text-earth-light">
            <Route className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enter your start and destination above to discover stands along the way.</p>
          </div>
        )}
      </div>
    </div>
  );
}
