import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Menu, X, Plus, Search, Info, Leaf, Megaphone, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const location = useLocation();
  const { user, loading } = useAuth();

  const links = [
    { to: '/', label: 'Discover', icon: MapPin },
    { to: '/browse', label: 'Browse', icon: Search },
    { to: '/add', label: 'Add a Stand', icon: Plus },
    { to: '/about', label: 'About', icon: Info },
    { to: '/advertise', label: 'Advertise', icon: Megaphone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Announcement banner */}
      {!bannerDismissed && (
        <div className="bg-amber text-earth text-center text-xs py-1.5 px-4 relative font-medium">
          <span>Now serving <strong>Mantua, Ohio</strong> & Portage County &mdash; </span>
          <Link to="/add" className="text-earth hover:text-forest font-semibold underline">
            Add your stand free
          </Link>
          <button
            onClick={() => setBannerDismissed(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 border-0 bg-transparent text-earth/50 hover:text-earth"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <header className="bg-forest-dark text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 no-underline group">
              <div className="w-9 h-9 bg-amber rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all rotate-3 group-hover:rotate-0 duration-300">
                <Leaf className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-display font-bold text-white leading-tight tracking-tight">
                  Stand Scout
                </span>
                <span className="text-[9px] text-sage/60 leading-tight hidden sm:block tracking-[0.15em] uppercase">
                  Farm Stands & Roadside Finds
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 no-underline ${
                    isActive(to)
                      ? 'text-amber-light'
                      : 'text-sage/70 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}

              {/* Auth link */}
              {!loading && (
                <span className="ml-1 border-l border-forest/50 pl-2">
                  {user ? (
                    <Link
                      to="/account"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 no-underline ${
                        isActive('/account')
                          ? 'text-amber-light'
                          : 'text-sage/70 hover:text-white'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Account
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 no-underline ${
                        isActive('/login')
                          ? 'text-amber-light'
                          : 'text-sage/70 hover:text-white'
                      }`}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In
                    </Link>
                  )}
                </span>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-forest transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-forest/50 bg-forest-dark">
            <div className="px-4 py-2 space-y-0.5">
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                    isActive(to)
                      ? 'bg-forest text-amber-light'
                      : 'text-sage/80 hover:bg-forest/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}

              {/* Auth link (mobile) */}
              {!loading && (
                <div className="border-t border-forest/50 pt-1 mt-1">
                  {user ? (
                    <Link
                      to="/account"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                        isActive('/account')
                          ? 'bg-forest text-amber-light'
                          : 'text-sage/80 hover:bg-forest/60 hover:text-white'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Account
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                        isActive('/login')
                          ? 'bg-forest text-amber-light'
                          : 'text-sage/80 hover:bg-forest/60 hover:text-white'
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                  )}
                </div>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
