import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Loader2, Trash2, ExternalLink, ToggleLeft, ToggleRight,
  DollarSign, MapPin,
} from 'lucide-react';
import {
  fetchAllSponsors, createSponsor, updateSponsor, deleteSponsor,
  type Sponsor,
} from '../../lib/api';

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', url: '', address: '',
    latitude: '', longitude: '', category: 'Local Business',
    monthly_rate: '50', contact_email: '', contact_phone: '',
  });

  const load = () => {
    setLoading(true);
    fetchAllSponsors().then(setSponsors).finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect -- async data fetch pattern
  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActing('new');
    await createSponsor({
      name: form.name,
      description: form.description,
      url: form.url || null,
      address: form.address,
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
      category: form.category,
      monthly_rate: parseFloat(form.monthly_rate) || 50,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
    });
    setForm({ name: '', description: '', url: '', address: '', latitude: '', longitude: '', category: 'Local Business', monthly_rate: '50', contact_email: '', contact_phone: '' });
    setShowForm(false);
    setActing(null);
    load();
  };

  const handleToggle = async (s: Sponsor) => {
    setActing(s.id);
    await updateSponsor(s.id, { active: !s.active });
    setActing(null);
    load();
  };

  const handleDelete = async (s: Sponsor) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    setActing(s.id);
    await deleteSponsor(s.id);
    setActing(null);
    load();
  };

  const inputClass = 'w-full px-3 py-2 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30';
  const revenue = sponsors.filter(s => s.active).reduce((sum, s) => sum + s.monthlyRate, 0);

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-earth-light hover:text-earth transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-earth">Sponsors</h1>
              <p className="text-sm text-earth-light">
                {sponsors.filter(s => s.active).length} active · ${revenue.toFixed(0)}/mo revenue
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-light transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Sponsor
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6 mb-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-earth mb-1">Business Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-earth mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className={inputClass}>
                  {['Local Business', 'Winery', 'Restaurant', 'B&B / Inn', 'Farm', 'Attraction', 'Shop'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-earth mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className={`${inputClass} resize-none`} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-earth mb-1">Address</label>
                <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-earth mb-1">Latitude *</label>
                <input required value={form.latitude} onChange={e => setForm(p => ({ ...p, latitude: e.target.value }))} placeholder="41.2834" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-earth mb-1">Longitude *</label>
                <input required value={form.longitude} onChange={e => setForm(p => ({ ...p, longitude: e.target.value }))} placeholder="-81.2232" className={inputClass} />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-earth mb-1">Website URL</label>
                <input type="url" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-earth mb-1">Monthly Rate ($)</label>
                <input type="number" value={form.monthly_rate} onChange={e => setForm(p => ({ ...p, monthly_rate: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-earth mb-1">Contact Email</label>
                <input type="email" value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={acting === 'new'} className="px-4 py-2 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-light transition-colors disabled:opacity-50">
                {acting === 'new' ? 'Creating...' : 'Create Sponsor'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-earth-light hover:text-earth bg-transparent border-0">Cancel</button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-forest" /></div>
        ) : sponsors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-12 text-center">
            <DollarSign className="w-12 h-12 text-earth-light mx-auto mb-3" />
            <p className="text-lg font-semibold text-earth">No sponsors yet</p>
            <p className="text-sm text-earth-light mt-1">Add your first sponsor to start generating revenue.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sponsors.map(s => (
              <div key={s.id} className={`bg-white rounded-xl shadow-sm border px-5 py-4 ${s.active ? 'border-sage-dark/20' : 'border-red-200 opacity-60'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-earth truncate">{s.name}</h2>
                      <span className="text-xs text-earth-light bg-sage/50 px-2 py-0.5 rounded-full">{s.category}</span>
                      <span className="text-xs font-medium text-forest">${s.monthlyRate}/mo</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-earth-light mt-1">
                      <MapPin className="w-3 h-3" />{s.address || `${s.latitude}, ${s.longitude}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleToggle(s)} disabled={acting === s.id} className="p-2 hover:bg-sage/30 rounded-lg transition-colors bg-transparent border-0" title={s.active ? 'Deactivate' : 'Activate'}>
                      {s.active ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-earth-light" />}
                    </button>
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-sage/30 rounded-lg transition-colors" title="Visit">
                        <ExternalLink className="w-4 h-4 text-earth-light" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(s)} disabled={acting === s.id} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500 bg-transparent border-0" title="Delete">
                      <Trash2 className="w-4 h-4" />
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
