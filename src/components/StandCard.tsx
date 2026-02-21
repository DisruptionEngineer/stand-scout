import { Link } from 'react-router-dom';
import { MapPin, Clock, Heart } from 'lucide-react';
import type { Stand } from '../data/types';
import { categoryIcons } from './CategoryFilter';
import StarRating from './StarRating';
import { useFavorites } from '../context/FavoritesContext';
import AvailabilityBadge from './AvailabilityBadge';

export default function StandCard({ stand }: { stand: Stand }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const faved = isFavorite(stand.id);
  const PrimaryIcon = categoryIcons[stand.categories[0]];

  const heroPhoto = stand.photos?.[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-sage-dark/20 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Hero photo or color band */}
      {heroPhoto ? (
        <Link to={`/stand/${stand.id}`}>
          <img
            src={heroPhoto}
            alt={stand.name}
            className="w-full h-36 object-cover"
          />
        </Link>
      ) : (
        <div className="h-1.5 bg-gradient-to-r from-forest to-forest-light" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sage flex items-center justify-center shrink-0">
              <PrimaryIcon className="w-5 h-5 text-forest" />
            </div>
            <div className="min-w-0">
              <Link
                to={`/stand/${stand.id}`}
                className="font-semibold text-earth hover:text-forest transition-colors text-sm leading-tight no-underline block truncate"
              >
                {stand.name}
              </Link>
              <div className="flex items-center gap-1 text-xs text-earth-light mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{stand.address}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleFavorite(stand.id)}
            className="p-1.5 rounded-lg hover:bg-sage transition-colors shrink-0 border-0 bg-transparent"
            aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4.5 h-4.5 ${faved ? 'text-amber fill-amber' : 'text-earth-light'}`} />
          </button>
        </div>

        <p className="text-xs text-earth-light line-clamp-2 mb-3 leading-relaxed">{stand.description}</p>

        {/* Status + rating row */}
        <div className="flex items-center justify-between mb-3">
          <AvailabilityBadge stand={stand} />
          <div className="flex items-center gap-1.5">
            <StarRating rating={stand.rating} size="sm" />
            <span className="text-xs text-earth-light">({stand.reviewCount})</span>
          </div>
        </div>

        {/* Currently available */}
        {stand.currentlyAvailable.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {stand.currentlyAvailable.slice(0, 3).map(item => (
              <span key={item} className="text-[11px] bg-sage text-forest px-2 py-0.5 rounded-full font-medium">
                {item}
              </span>
            ))}
            {stand.currentlyAvailable.length > 3 && (
              <span className="text-[11px] text-earth-light px-1">
                +{stand.currentlyAvailable.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-sage/50">
          <div className="flex items-center gap-1 text-xs text-earth-light">
            <Clock className="w-3 h-3" />
            <span>{stand.typicalAvailability}</span>
          </div>
          {stand.selfServe && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber bg-amber/10 px-2 py-0.5 rounded-full">
              Self-Serve
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
