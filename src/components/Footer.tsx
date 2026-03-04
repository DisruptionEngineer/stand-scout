import { Link } from 'react-router-dom';
import { Heart, Leaf, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-sage/70 relative overflow-hidden">
      {/* Warm accent divider at top */}
      <div className="section-break-warm" />

      <div className="grain-overlay-static absolute inset-0 opacity-[0.03]" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Regional callout */}
        <div className="flex items-center gap-2 mb-8 text-sage/40 text-xs">
          <MapPin className="w-3.5 h-3.5" />
          <span>Serving Mantua, Ohio & Portage County — more regions coming soon</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-amber rounded-lg flex items-center justify-center rotate-3">
                <Leaf className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-display font-bold text-white">Stand Scout</span>
            </div>
            <p className="text-sm leading-relaxed">
              A free, community-powered field guide to farm stands, roadside sellers,
              and the neighbors who grow what&apos;s good in Portage County and beyond.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4 text-sm tracking-wide">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm list-none p-0">
              <li><Link to="/" className="hover:text-amber-light transition-colors no-underline text-sage/70">Discover Map</Link></li>
              <li><Link to="/browse" className="hover:text-amber-light transition-colors no-underline text-sage/70">Browse Stands</Link></li>
              <li><Link to="/add" className="hover:text-amber-light transition-colors no-underline text-sage/70">Add Your Stand</Link></li>
              <li><Link to="/about" className="hover:text-amber-light transition-colors no-underline text-sage/70">About Stand Scout</Link></li>
              <li><Link to="/advertise" className="hover:text-amber-light transition-colors no-underline text-sage/70">Advertise With Us</Link></li>
            </ul>
          </div>

          {/* Mission */}
          <div>
            <h3 className="text-white font-display font-semibold mb-4 text-sm tracking-wide">
              Our Promise
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              Always free for stand owners. No tiers, no paywalls, no premium gates.
              Built with love for the farmers and makers who feed our communities.
            </p>
            <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              <p className="text-[11px] text-amber-light font-display font-semibold">Know a stand we&apos;re missing?</p>
              <Link to="/add" className="text-[11px] text-sage/60 hover:text-amber-light transition-colors no-underline">
                Add it in under 2 minutes &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-forest/40 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-sage/50">
          <p>&copy; {new Date().getFullYear()} Stand Scout. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-rust fill-rust" /> for rural communities
          </p>
        </div>
      </div>
    </footer>
  );
}
