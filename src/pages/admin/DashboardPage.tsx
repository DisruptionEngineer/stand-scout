import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Clock, CheckCircle2, Star, LogOut, Loader2, Plus } from 'lucide-react';
import { fetchAdminStats, type AdminStats } from '../../lib/api';
import { signOut } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-forest" />
            <div>
              <h1 className="text-2xl font-bold text-earth">Admin Dashboard</h1>
              <p className="text-sm text-earth-light">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-earth-light hover:text-earth border border-sage-dark/30 rounded-xl hover:bg-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-forest" />
          </div>
        ) : stats ? (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<LayoutDashboard className="w-5 h-5" />} label="Total Stands" value={stats.total} color="text-earth" />
              <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={stats.pending} color="text-amber" />
              <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Approved" value={stats.approved} color="text-green-600" />
              <StatCard icon={<Star className="w-5 h-5" />} label="Reviews" value={stats.totalReviews} color="text-forest" />
            </div>

            {/* Quick links */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                to="/admin/pending"
                className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6 hover:border-forest/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-amber" />
                  <h2 className="text-lg font-semibold text-earth">Review Queue</h2>
                </div>
                <p className="text-sm text-earth-light">
                  {stats.pending === 0
                    ? 'No stands waiting for review'
                    : `${stats.pending} stand${stats.pending === 1 ? '' : 's'} waiting for review`}
                </p>
              </Link>
              <Link
                to="/admin/stands"
                className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6 hover:border-forest/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-earth">Manage Stands</h2>
                </div>
                <p className="text-sm text-earth-light">
                  View, edit, or remove all {stats.total} stands
                </p>
              </Link>
              <Link
                to="/admin/add"
                className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6 hover:border-forest/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Plus className="w-5 h-5 text-forest" />
                  <h2 className="text-lg font-semibold text-earth">Add Stand</h2>
                </div>
                <p className="text-sm text-earth-light">
                  Quickly add a new stand (auto-approved)
                </p>
              </Link>
            </div>
          </>
        ) : (
          <p className="text-earth-light text-center py-16">Failed to load stats.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-5">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-earth">{value}</p>
      <p className="text-xs text-earth-light">{label}</p>
    </div>
  );
}
