import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, MapPin, Loader2, Edit3, Clock, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/auth';
import { fetchUserStands } from '../lib/api';
import type { Stand } from '../data/types';

export default function AccountPage() {
  const { user } = useAuth();
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserStands(user.id).then(data => {
        setStands(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    window.location.href = '/';
  };

  const statusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Live</span>;
      case 'pending':
        return <span className="text-xs bg-amber/20 text-amber-dark px-2 py-0.5 rounded-full font-medium">Pending Review</span>;
      case 'rejected':
        return <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-warmth relative overflow-hidden border-b border-sage-dark/30">
        <div className="topo-pattern absolute inset-0 opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">
          <h1 className="text-3xl font-display font-bold text-earth">My Account</h1>
          <p className="text-sm text-earth-light mt-2">Manage your stands and profile</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-xl border border-sage-dark/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-forest" />
              </div>
              <div>
                <p className="font-semibold text-earth">{user?.email}</p>
                <p className="text-xs text-earth-light">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'recently'}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-2 px-4 py-2 border border-sage-dark text-earth rounded-lg text-sm font-medium hover:border-red-300 hover:text-red-600 transition-colors"
            >
              {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Sign Out
            </button>
          </div>
        </div>

        {/* My stands */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-earth">My Stands</h2>
            <Link
              to="/add"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light transition-colors no-underline"
            >
              <MapPin className="w-3.5 h-3.5" />
              Add a Stand
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-forest animate-spin" />
            </div>
          ) : stands.length > 0 ? (
            <div className="space-y-3">
              {stands.map(stand => (
                <div key={stand.id} className="bg-white rounded-xl border border-sage-dark/30 p-5 hover:border-forest/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-earth truncate">{stand.name}</h3>
                        {statusBadge(stand.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-earth-light">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {stand.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-earth-light">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber fill-amber" />
                          {stand.rating.toFixed(1)} ({stand.reviewCount})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {stand.typicalAvailability || 'No hours set'}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/stand/${stand.id}/edit`}
                      className="flex items-center gap-1.5 px-3 py-2 border border-sage-dark text-earth rounded-lg text-sm font-medium hover:border-forest hover:text-forest transition-colors no-underline shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-sage-dark/30 p-8 text-center">
              <MapPin className="w-10 h-10 text-earth-light/40 mx-auto mb-3" />
              <p className="text-earth font-medium mb-1">No stands yet</p>
              <p className="text-sm text-earth-light mb-4">
                Add your first stand and start connecting with customers!
              </p>
              <Link
                to="/add"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light transition-colors no-underline"
              >
                <MapPin className="w-4 h-4" />
                Add Your First Stand
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
