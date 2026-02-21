import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Trash2, CheckCircle2, XCircle, Clock,
  MapPin, Eye, Filter,
} from 'lucide-react';
import {
  fetchAllStands, updateStandStatus, deleteStand as apiDeleteStand,
  type StandStatus,
} from '../../lib/api';
import type { Stand } from '../../data/types';

const STATUS_CONFIG: Record<StandStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-amber bg-amber/10', icon: <Clock className="w-3.5 h-3.5" /> },
  approved: { label: 'Approved', color: 'text-green-600 bg-green-50', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  rejected: { label: 'Rejected', color: 'text-red-600 bg-red-50', icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function AdminManageStandsPage() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StandStatus | 'all'>('all');
  const [acting, setActing] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchAllStands(filter === 'all' ? undefined : filter)
      .then(setStands)
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleStatusChange = async (id: string, status: StandStatus) => {
    setActing(id);
    const ok = await updateStandStatus(id, status);
    if (ok) {
      // Reload to get fresh data
      load();
    }
    setActing(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setActing(id);
    const ok = await apiDeleteStand(id);
    if (ok) {
      setStands(prev => prev.filter(s => s.id !== id));
    }
    setActing(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="text-earth-light hover:text-earth transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-earth">Manage Stands</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-earth-light" />
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-forest text-white'
                  : 'bg-white text-earth border border-sage-dark/30 hover:border-forest'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-forest" />
          </div>
        ) : stands.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-12 text-center">
            <p className="text-earth-light">No stands found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stands.map(stand => {
              const statusKey = (stand.status ?? 'approved') as StandStatus;
              const cfg = STATUS_CONFIG[statusKey];

              return (
                <div
                  key={stand.id}
                  className="bg-white rounded-xl shadow-sm border border-sage-dark/20 px-5 py-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-earth truncate">{stand.name}</h2>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-earth-light mt-1">
                        <span>{stand.ownerName}</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {stand.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {statusKey !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(stand.id, 'approved')}
                          disabled={acting === stand.id}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {statusKey !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(stand.id, 'rejected')}
                          disabled={acting === stand.id}
                          className="p-2 text-amber hover:bg-amber/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <Link
                        to={`/stand/${stand.id}`}
                        className="p-2 text-earth-light hover:text-earth hover:bg-sage/30 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(stand.id, stand.name)}
                        disabled={acting === stand.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
