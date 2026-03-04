import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapIcon, SortAsc, Loader2, Star, MapPin, ArrowRight } from 'lucide-react';
import { Category } from '../data/types';
import { useStands } from '../lib/hooks';
import StandCard from '../components/StandCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import AvailabilityBadge from '../components/AvailabilityBadge';
import { categoryIcons } from '../components/CategoryFilter';
import { mockReviews } from '../data/stands';

type SortOption = 'rating' | 'newest' | 'name' | 'reviews' | 'nearest';

const sortLabels: Record<SortOption, string> = {
  rating: 'Top Rated',
  nearest: 'Nearest',
  newest: 'Newest',
  name: 'A–Z',
  reviews: 'Most Reviewed',
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function BrowsePage() {
  const { stands: allStands, loading } = useStands();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('rating');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocation = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 5000 },
    );
  }, []);

  useEffect(requestLocation, [requestLocation]);

  const filtered = useMemo(() => {
    let stands = [...allStands];
    if (search) {
      const q = search.toLowerCase();
      stands = stands.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.products.some(p => p.toLowerCase().includes(q)) ||
        s.address.toLowerCase().includes(q)
      );
    }
    if (categories.length > 0) {
      stands = stands.filter(s =>
        s.categories.some(c => categories.includes(c))
      );
    }
    if (showAvailableOnly) {
      stands = stands.filter(s => s.availabilityStatus === 'available');
    }
    switch (sort) {
      case 'rating': stands.sort((a, b) => b.rating - a.rating); break;
      case 'newest': stands.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()); break;
      case 'name': stands.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'reviews': stands.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case 'nearest':
        if (userLoc) {
          stands.sort((a, b) =>
            haversine(userLoc.lat, userLoc.lng, a.latitude, a.longitude) -
            haversine(userLoc.lat, userLoc.lng, b.latitude, b.longitude)
          );
        }
        break;
    }
    return stands;
  }, [search, categories, showAvailableOnly, sort, userLoc, allStands]);

  // Featured stand = highest rated available stand
  const featured = useMemo(() =>
    allStands
      .filter(s => s.availabilityStatus === 'available')
      .sort((a, b) => b.reviewCount - a.reviewCount)[0],
    [allStands]
  );

  const featuredReview = featured ? mockReviews.find(r => r.standId === featured.id && r.rating >= 4) : null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Featured stand hero — warm background */}
      {featured && !search && categories.length === 0 && (
        <div className="bg-warmth border-b border-sage-dark/30 relative overflow-hidden">
          <div className="topo-pattern absolute inset-0 opacity-40" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-rust font-semibold mb-4">Featured Stand</p>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {featured.categories.slice(0, 2).map(cat => {
                    const Icon = categoryIcons[cat];
                    return (
                      <span key={cat} className="flex items-center gap-1 text-[11px] bg-white/70 text-forest px-2 py-0.5 rounded-full font-medium">
                        <Icon className="w-3 h-3" />
                        {cat}
                      </span>
                    );
                  })}
                </div>
                <Link to={`/stand/${featured.id}`} className="no-underline">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-earth hover:text-forest transition-colors mb-1">
                    {featured.name}
                  </h2>
                </Link>
                <p className="text-sm text-earth-light mb-2">by {featured.ownerName}</p>
                <div className="flex items-center gap-3 mb-3">
                  <AvailabilityBadge stand={featured} />
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber fill-amber" />
                    <span className="text-sm font-medium text-earth">{featured.rating}</span>
                    <span className="text-sm text-earth-light">({featured.reviewCount} reviews)</span>
                  </div>
                </div>
                <p className="text-sm text-earth-light leading-relaxed line-clamp-2 mb-4">{featured.description}</p>
                {featuredReview && (
                  <div className="pl-3 border-l-2 border-rust/40 mb-4">
                    <p className="text-sm text-earth-light italic line-clamp-2">&ldquo;{featuredReview.text}&rdquo;</p>
                    <p className="text-xs text-earth-light/60 mt-1">&mdash; {featuredReview.authorName}</p>
                  </div>
                )}
                <Link
                  to={`/stand/${featured.id}`}
                  className="inline-flex items-center gap-1.5 text-sm text-forest font-medium hover:underline no-underline bg-white/60 px-3 py-1.5 rounded-full border border-sage-dark/30"
                >
                  Visit stand page
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-earth-light shrink-0 sm:mt-8">
                <MapPin className="w-3.5 h-3.5" />
                {featured.address}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div>
            <h1 className="text-2xl font-display font-bold text-earth">All Stands</h1>
            <p className="text-sm text-earth-light mt-0.5">
              {filtered.length} stand{filtered.length !== 1 ? 's' : ''} in Portage County
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sage-dark text-sm font-medium text-earth hover:border-forest hover:text-forest transition-all no-underline bg-white"
          >
            <MapIcon className="w-4 h-4" />
            Map View
          </Link>
        </div>

        {/* Search + filters */}
        <div className="space-y-3 mb-6 animate-fade-up animate-delay-1">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryFilter selected={categories} onChange={setCategories} />
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={e => setShowAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-forest"
              />
              <span className="text-earth">Available now only</span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </label>
            <div className="flex items-center gap-2 ml-auto">
              <SortAsc className="w-4 h-4 text-earth-light" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="text-sm border border-sage-dark rounded-lg px-2 py-1.5 bg-white text-earth focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                {Object.entries(sortLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-forest animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(stand => (
              <StandCard key={stand.id} stand={stand} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-display font-semibold text-earth">No stands found</p>
            <p className="text-sm text-earth-light mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
