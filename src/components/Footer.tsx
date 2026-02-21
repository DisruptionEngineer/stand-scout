import { Link } from 'react-router-dom';
import { Heart, Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-sage/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Stand Scout</span>
            </div>
            <p className="text-sm leading-relaxed">
              A free, community-powered platform to discover roadside stands,
              farm stands, and home-based sellers in rural areas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2 text-sm list-none p-0">
              <li><Link to="/" className="hover:text-white transition-colors no-underline text-sage/80">Discover Map</Link></li>
              <li><Link to="/browse" className="hover:text-white transition-colors no-underline text-sage/80">Browse Stands</Link></li>
              <li><Link to="/add" className="hover:text-white transition-colors no-underline text-sage/80">Add Your Stand</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors no-underline text-sage/80">About Stand Scout</Link></li>
            </ul>
          </div>

          {/* Mission */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Our Promise</h3>
            <p className="text-sm leading-relaxed">
              Always free for stand owners. No tiers, no paywalls, no premium gates.
              Built with love for the farmers and makers who feed our communities.
            </p>
          </div>
        </div>

        <div className="border-t border-forest-light mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p>© {new Date().getFullYear()} Stand Scout. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-amber fill-amber" /> for rural communities
          </p>
        </div>
      </div>
    </footer>
  );
}
