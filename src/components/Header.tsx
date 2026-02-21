import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X, Plus, Search, Info, Leaf } from 'lucide-react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Discover', icon: MapPin },
    { to: '/browse', label: 'Browse', icon: Search },
    { to: '/add', label: 'Add a Stand', icon: Plus },
    { to: '/about', label: 'About', icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-forest text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-9 h-9 bg-amber rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-tight">Stand Scout</span>
              <span className="text-[10px] text-sage opacity-80 leading-tight hidden sm:block">
                Discover roadside gems near you
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${
                  isActive(to)
                    ? 'bg-forest-light text-white'
                    : 'text-sage hover:bg-forest-light/50 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-forest-light transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-forest-light">
          <div className="px-4 py-2 space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                  isActive(to)
                    ? 'bg-forest-light text-white'
                    : 'text-sage hover:bg-forest-light/50 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
