import { Link } from 'react-router-dom';
import { MapPin, Clock, Heart } from 'lucide-react';
import type { Stand } from '../data/types';
import { categoryIcons } from './CategoryFilter';
import StarRating from './StarRating';
import { useFavorites } from '../context/FavoritesContext';
import AvailabilityBadge from './AvailabilityBadge';
import { mockReviews } from '../data/stands';

const accentColors: Record<string, string> = {
  Produce: 'bg-forest',
  Honey: 'bg-amber',
  'Baked Goods': 'bg-rust',
  'Eggs': 'bg-amber-dark',
  Flowers: 'bg-pink-500',
  Crafts: 'bg-earth-light',
  Dairy: 'bg-forest-light',
  Meat: 'bg-rust',
  Maple: 'bg-amber',
};

export default function StandCard({ stand, compact = false }: { stand: Stand; compact?: boolean }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const faved = isFavorite(stand.id);
  const PrimaryIcon = categoryIcons[stand.categories[0]];
  const heroPhoto = stand.photos?.[0];
  const topReview = mockReviews.find(r => r.standId === stand.id && r.rating >= 4);
  const accentColor = accentColors[stand.categories[0]] || 'bg-forest';

  if (compact) {
    return (
      <Link
        to={`/stand/${stand.id}`}
        className="block bg-white rounded-xl border border-sage-dark/30 p-4 card-lift no-underline group relative overflow-hidden"
      >
        {/* Accent stripe */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-sage flex items-center justify-center shrink-0">
            <PrimaryIcon className="w-4 h-4 text-forest" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-earth text-sm leading-tight truncate group-hover:text-forest transition-colors">
              {stand.name}
            </h3>
            <p className="text-[11px] text-earth-light truncate">{stand.address}</p>
          </div>
        </div>
        <AvailabilityBadge stand={stand} />
        {stand.currentlyAvailable.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {stand.currentlyAvailable.slice(0, 2).map(item => (
              <span key={item} className="text-[10px] bg-sage text-forest px-1.5 py-0.5 rounded font-medium">
                {item}
              </span>
            ))}
            {stand.currentlyAvailable.length > 2 && (
              <span className="text-[10px] text-earth-light">
                +{stand.currentlyAvailable.length - 2}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-sage-dark/30 overflow-hidden card-lift group relative">
      {/* Accent stripe at top when no photo */}
      {!heroPhoto && <div className={`h-1.5 ${accentColor}`} />}

      {/* Hero photo */}
      {heroPhoto && (
        <Link to={`/stand/${stand.id}`}>
          <img
            src={heroPhoto}
            alt={stand.name}
            className="w-full h-40 object-cover"
          />
        </Link>
      )}

      <div className="p-4">
        {/* Categories + favorite */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {stand.categories.slice(0, 2).map(cat => {
              const Icon = categoryIcons[cat];
              return (
                <span key={cat} className="flex items-center gap-1 text-[10px] bg-sage text-forest px-2 py-0.5 rounded-full font-medium">
                  <Icon className="w-3 h-3" />
                  {cat}
                </span>
              );
            })}
          </div>
          <button
            onClick={() => toggleFavorite(stand.id)}
            className="p-1 rounded-lg hover:bg-sage transition-colors shrink-0 border-0 bg-transparent"
            aria-label={faved ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 transition-colors ${faved ? 'text-rust fill-rust' : 'text-earth-light/40 hover:text-earth-light'}`} />
          </button>
        </div>

        {/* Title + location */}
        <Link
          to={`/stand/${stand.id}`}
          className="font-display font-bold text-earth hover:text-forest transition-colors text-base leading-tight no-underline block mb-1"
        >
          {stand.name}
        </Link>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-earth-light shrink-0" />
          <span className="text-xs text-earth-light truncate">{stand.address}</span>
        </div>
        <p className="text-[11px] text-earth-light/70 mt-0.5 italic">by {stand.ownerName}</p>

        {/* Review quote */}
        {topReview && (
          <div className="mt-3 pl-3 border-l-2 border-amber/40">
            <p className="text-xs text-earth-light leading-relaxed line-clamp-2 italic">
              &ldquo;{topReview.text}&rdquo;
            </p>
            <p className="text-[10px] text-earth-light/60 mt-0.5">&mdash; {topReview.authorName}</p>
          </div>
        )}

        {/* Status + rating row */}
        <div className="flex items-center justify-between mt-3 mb-3">
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
        <div className="flex items-center justify-between pt-2 border-t border-sage/60">
          <div className="flex items-center gap-1 text-xs text-earth-light">
            <Clock className="w-3 h-3" />
            <span>{stand.typicalAvailability}</span>
          </div>
          {stand.selfServe && (
            <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-dark bg-amber/10 px-2 py-0.5 rounded-full">
              Self-Serve
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
