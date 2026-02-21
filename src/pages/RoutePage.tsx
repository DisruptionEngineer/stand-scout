import { Link } from 'react-router-dom';
import { Route, MapPin, ArrowRight } from 'lucide-react';

export default function RoutePage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-sage rounded-full flex items-center justify-center mx-auto mb-6">
          <Route className="w-10 h-10 text-forest" />
        </div>
        <h1 className="text-2xl font-bold text-earth mb-3">Stands Along My Drive</h1>
        <p className="text-earth-light leading-relaxed mb-6">
          Enter a start and destination to see stands along your route.
          Perfect for road trips, commutes, and weekend adventures.
        </p>
        <div className="bg-amber/10 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-dark font-medium">🚧 Coming Soon</p>
          <p className="text-xs text-earth-light mt-1">
            This feature is under development. In the meantime, explore stands on the map!
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-light transition-colors no-underline"
          >
            <MapPin className="w-4 h-4" />
            Explore Map
          </Link>
          <Link
            to="/browse"
            className="flex items-center gap-2 px-4 py-2.5 border border-forest text-forest rounded-xl text-sm font-medium hover:bg-sage transition-colors no-underline"
          >
            Browse Stands
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
