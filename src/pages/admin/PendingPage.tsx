import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, Clock, MapPin } from 'lucide-react';
import { fetchPendingStands, updateStandStatus } from '../../lib/api';
import type { Stand } from '../../data/types';

export default function AdminPendingPage() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchPendingStands()
      .then(setStands)
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch pattern
  useEffect(load, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setActing(id);
    const ok = await updateStandStatus(id, status);
    if (ok) {
      setStands(prev => prev.filter(s => s.id !== id));
    }
    setActing(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="text-earth-light hover:text-earth transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber" />
            <h1 className="text-2xl font-bold text-earth">Pending Review</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-forest" />
          </div>
        ) : stands.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-earth">All clear!</p>
            <p className="text-sm text-earth-light mt-1">No stands waiting for review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stands.map(stand => (
              <div
                key={stand.id}
                className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-earth truncate">{stand.name}</h2>
                    <p className="text-sm text-earth-light mt-0.5">by {stand.ownerName}</p>

                    <div className="flex items-center gap-1 text-xs text-earth-light mt-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {stand.address}
                    </div>

                    {stand.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {stand.categories.map(cat => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 text-xs bg-sage/50 text-earth rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    {stand.description && (
                      <p className="text-sm text-earth-light mt-3 line-clamp-2">
                        {stand.description}
                      </p>
                    )}

                    <p className="text-xs text-earth-light/60 mt-2">
                      Submitted {new Date(stand.dateAdded).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(stand.id, 'approved')}
                      disabled={acting === stand.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {acting === stand.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(stand.id, 'rejected')}
                      disabled={acting === stand.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
