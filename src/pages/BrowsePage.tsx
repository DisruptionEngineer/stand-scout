import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapIcon, SortAsc, Loader2 } from 'lucide-react';
import { Category } from '../data/types';
import { useStands } from '../lib/hooks';
import StandCard from '../components/StandCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';

type SortOption = 'rating' | 'newest' | 'name' | 'reviews';

const sortLabels: Record<SortOption, string> = {
  rating: 'Top Rated',
  newest: 'Newest',
  name: 'A–Z',
  reviews: 'Most Reviewed',
};

export default function BrowsePage() {
  const { stands: allStands, loading } = useStands();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('rating');

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
      case 'rating':
        stands.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        stands.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case 'name':
        stands.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'reviews':
        stands.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return stands;
  }, [search, categories, showAvailableOnly, sort]);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-earth">Browse Stands</h1>
            <p className="text-sm text-earth-light mt-1">
              {filtered.length} stand{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sage-dark/40 text-sm font-medium text-earth hover:border-forest hover:text-forest transition-colors no-underline bg-white"
          >
            <MapIcon className="w-4 h-4" />
            Map View
          </Link>
        </div>

        {/* Search + filters */}
        <div className="space-y-4 mb-6">
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
                className="text-sm border border-sage-dark/40 rounded-lg px-2 py-1.5 bg-white text-earth focus:outline-none focus:ring-2 focus:ring-forest/30"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(stand => (
              <StandCard key={stand.id} stand={stand} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-earth">No stands found</p>
            <p className="text-sm text-earth-light mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
