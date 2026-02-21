import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { List, Filter, X, Loader2 } from 'lucide-react';
import { Category } from '../data/types';
import { useStands } from '../lib/hooks';
import MapView from '../components/MapView';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';

export default function HomePage() {
  const { stands: allStands, loading } = useStands();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let stands = allStands;

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

    return stands;
  }, [search, categories, showAvailableOnly]);

  const activeFilterCount = categories.length + (showAvailableOnly ? 1 : 0);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="bg-white border-b border-sage-dark/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              activeFilterCount > 0
                ? 'bg-forest text-white border-forest'
                : 'bg-white text-earth border-sage-dark/40 hover:border-forest'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-amber text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          <Link
            to="/browse"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm font-medium text-earth hover:border-forest hover:text-forest transition-colors no-underline bg-white"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List View</span>
          </Link>
        </div>
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="bg-white border-b border-sage-dark/20 px-4 py-3">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-earth">Filter by Category</span>
              <button onClick={() => setFiltersOpen(false)} className="p-1 border-0 bg-transparent">
                <X className="w-4 h-4 text-earth-light" />
              </button>
            </div>
            <CategoryFilter selected={categories} onChange={setCategories} compact />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showAvailableOnly}
                onChange={e => setShowAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded border-sage-dark text-forest focus:ring-forest accent-forest"
              />
              <span className="text-earth">Show available now only</span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </label>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setCategories([]); setShowAvailableOnly(false); }}
                className="text-xs text-amber hover:underline border-0 bg-transparent p-0 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-sage/30">
            <Loader2 className="w-8 h-8 text-forest animate-spin" />
          </div>
        ) : (
          <MapView stands={filtered} className="h-full" />
        )}
        {/* Stand count overlay */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-sage-dark/20">
          <span className="text-sm font-medium text-earth">
            {filtered.length} stand{filtered.length !== 1 ? 's' : ''}
          </span>
          {filtered.length !== allStands.length && (
            <span className="text-xs text-earth-light ml-1">
              of {allStands.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
