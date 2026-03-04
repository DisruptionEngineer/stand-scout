import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Loader2, Filter, X, ChevronRight, Sparkles, Users, Smartphone, Egg, Cherry, Flower2, Droplets } from 'lucide-react';
import { Category } from '../data/types';
import { useStands } from '../lib/hooks';
import ErrorBoundary from '../components/ErrorBoundary';
import MapView from '../components/MapView';
import CategoryFilter from '../components/CategoryFilter';
import StandCard from '../components/StandCard';

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
  }, [search, categories, showAvailableOnly, allStands]);

  const freshStands = useMemo(() =>
    allStands
      .filter(s => s.availabilityStatus === 'available' && s.lastStatusUpdate)
      .sort((a, b) => new Date(b.lastStatusUpdate!).getTime() - new Date(a.lastStatusUpdate!).getTime())
      .slice(0, 4),
    [allStands]
  );

  const availableCount = allStands.filter(s => s.availabilityStatus === 'available').length;
  const activeFilterCount = categories.length + (showAvailableOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero section */}
      <section className="relative bg-forest-dark text-white overflow-hidden">
        <div className="absolute inset-0 hero-mesh opacity-60" />
        <div className="grain-overlay-static absolute inset-0 opacity-[0.03]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl">
              <p className="text-amber-light text-[11px] uppercase tracking-[0.25em] font-semibold mb-4 animate-fade-up">
                Portage County & Beyond
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-[1.15] mb-5 animate-fade-up animate-delay-1">
                Know what&apos;s fresh<br />before you drive.
              </h1>
              <p className="text-sage/70 text-base sm:text-lg leading-relaxed mb-8 max-w-lg animate-fade-up animate-delay-2">
                Real-time availability from {allStands.length} farm stands, roadside sellers,
                and makers near Mantua, Ohio.
              </p>

              {/* Hero search */}
              <div className="relative max-w-md animate-fade-up animate-delay-3">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-light" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search for honey, eggs, flowers..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white text-earth text-sm placeholder:text-earth-light/50 focus:outline-none focus:ring-2 focus:ring-amber/40 shadow-lg"
                />
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-6 mt-8 animate-fade-up animate-delay-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 status-pulse" />
                  <span className="text-sm text-sage/60">{availableCount} stands open now</span>
                </div>
                <div className="text-sage/30">|</div>
                <span className="text-sm text-sage/60">Community-powered</span>
              </div>
            </div>

            {/* Floating category badges — right side decoration */}
            <div className="hidden lg:flex items-center justify-center relative h-64">
              <div className="absolute top-4 left-12 animate-float">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-amber-light" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">Honey</p>
                    <p className="text-sage/50 text-[10px]">6 stands</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-8 animate-float-alt" style={{ animationDelay: '0.5s' }}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Cherry className="w-4 h-4 text-green-300" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">Produce</p>
                    <p className="text-sage/50 text-[10px]">11 stands</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-8 left-4 animate-float" style={{ animationDelay: '1s' }}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rust/20 flex items-center justify-center">
                    <Egg className="w-4 h-4 text-orange-300" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">Farm Eggs</p>
                    <p className="text-sage/50 text-[10px]">8 stands</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 right-16 animate-float-alt" style={{ animationDelay: '1.5s' }}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-pink-400/20 flex items-center justify-center">
                    <Flower2 className="w-4 h-4 text-pink-300" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">Flowers</p>
                    <p className="text-sage/50 text-[10px]">4 stands</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Fresh Now — warm earthy background */}
      {!loading && freshStands.length > 0 && !search && (
        <section className="bg-warmth topo-pattern relative">
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <Sparkles className="w-5 h-5 text-rust" />
                  <h2 className="text-xl font-display font-bold text-earth underline-sketch inline-block">Fresh Right Now</h2>
                </div>
                <p className="text-xs text-earth-light mt-1">Updated by stand owners and visitors in real time</p>
              </div>
              <Link to="/browse" className="flex items-center gap-1 text-sm text-forest font-medium hover:underline no-underline bg-white/60 px-3 py-1.5 rounded-full border border-sage-dark/30">
                See all stands
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {freshStands.map(stand => (
                <StandCard key={stand.id} stand={stand} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Map Section — full-width contained */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber font-semibold mb-1">Explore Your Area</p>
            <h2 className="text-2xl font-display font-bold text-earth">Farm Stands Near You</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                activeFilterCount > 0
                  ? 'bg-forest text-white border-forest'
                  : 'bg-white text-earth border-sage-dark hover:border-forest'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-rust text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <Link
              to="/browse"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sage-dark text-sm font-medium text-earth hover:border-forest hover:text-forest transition-all no-underline bg-white"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">List View</span>
            </Link>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="bg-cream-dark rounded-xl border border-sage-dark/30 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-display font-semibold text-earth">Filter by Category</span>
              <button onClick={() => setFiltersOpen(false)} className="p-1 border-0 bg-transparent">
                <X className="w-4 h-4 text-earth-light" />
              </button>
            </div>
            <CategoryFilter selected={categories} onChange={setCategories} compact />
            <div className="flex items-center gap-4 mt-3">
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
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setCategories([]); setShowAvailableOnly(false); }}
                  className="text-xs text-rust hover:underline border-0 bg-transparent p-0 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Map container */}
        <div className="rounded-2xl overflow-hidden border-2 border-sage-dark/40 shadow-md relative" style={{ height: 'min(60vh, 520px)' }}>
          {loading ? (
            <div className="h-full flex items-center justify-center bg-sage/20">
              <Loader2 className="w-8 h-8 text-forest animate-spin" />
            </div>
          ) : (
            <ErrorBoundary fallback={<div className="h-full flex items-center justify-center bg-sage/20"><p className="text-earth-light">Map failed to load. Please refresh.</p></div>}>
              <MapView stands={filtered} className="h-full" />
            </ErrorBoundary>
          )}
          {/* Stand count overlay */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-sage-dark/30">
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
      </section>

      {/* How it works — dark section with contrast */}
      <section className="bg-forest-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh opacity-40" />
        <div className="grain-overlay-static absolute inset-0 opacity-[0.03]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-amber-light text-[10px] uppercase tracking-[0.25em] font-semibold mb-2 text-center">How It Works</p>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">Three steps. No apps. No accounts.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: MapPin, step: '01', title: 'Find stands near you', desc: 'Interactive map with real-time availability and freshness reports from your neighbors.' },
              { icon: Smartphone, step: '02', title: 'SMS status updates', desc: 'Stand owners text a keyword to update their status — works on any phone, even a flip phone.' },
              { icon: Users, step: '03', title: 'Community-powered', desc: 'Visitors scan QR codes to confirm what\'s stocked right now. Freshness data you can trust.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={title} className="text-center">
                <div className="text-[11px] text-amber-light font-mono tracking-wider mb-3">{step}</div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Icon className="w-6 h-6 text-amber-light" />
                </div>
                <h3 className="text-base font-display font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-sage/60 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — warm earthy treatment */}
      <section className="bg-warmth relative overflow-hidden">
        <div className="topo-pattern absolute inset-0 opacity-60" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-rust font-semibold mb-3">For Stand Owners</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-earth mb-3">Got a stand? Get discovered.</h2>
            <p className="text-earth-light text-sm mb-8 max-w-md mx-auto">
              Free forever. Under 2 minutes. No account needed. Join {allStands.length} stands already on the map.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/add"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-rust text-white rounded-xl font-semibold hover:bg-rust-light transition-colors no-underline shadow-lg text-sm"
              >
                Add Your Stand
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-earth rounded-xl font-semibold border border-sage-dark hover:border-forest hover:text-forest transition-colors no-underline text-sm"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
