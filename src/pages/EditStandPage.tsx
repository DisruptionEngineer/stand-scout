import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, Camera, X, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchStand, updateStandOwnerFields, uploadStandPhoto } from '../lib/api';
import type { Stand } from '../data/types';

export default function EditStandPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const [stand, setStand] = useState<Stand | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    description: '',
    phone: '',
    website: '',
    typicalAvailability: '',
    selfServe: false,
    paymentMethods: [] as string[],
    products: '',
  });

  useEffect(() => {
    if (id) {
      fetchStand(id).then(data => {
        if (data) {
          setStand(data);
          setForm({
            description: data.description,
            phone: data.phone,
            website: data.website || '',
            typicalAvailability: data.typicalAvailability,
            selfServe: data.selfServe,
            paymentMethods: data.paymentMethods,
            products: data.products.join(', '),
          });
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-forest animate-spin" />
      </div>
    );
  }

  if (!stand) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-display font-bold text-earth">Stand not found</p>
          <Link to="/account" className="text-forest hover:underline mt-2 inline-block">&larr; Back to account</Link>
        </div>
      </div>
    );
  }

  // Check ownership
  const isOwner = user && stand.userId === user.id;
  if (!isOwner && !isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-display font-bold text-earth">Not authorized</p>
          <p className="text-sm text-earth-light mt-1">You can only edit stands you own.</p>
          <Link to="/" className="text-forest hover:underline mt-2 inline-block">&larr; Go home</Link>
        </div>
      </div>
    );
  }

  const togglePayment = (method: string) => {
    setForm(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSaved(false);

    const products = form.products
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);

    const ok = await updateStandOwnerFields(stand.id, {
      description: form.description,
      phone: form.phone,
      website: form.website || null,
      typical_availability: form.typicalAvailability,
      payment_methods: form.paymentMethods,
      self_serve: form.selfServe,
      products,
    });

    // Upload any new photos
    for (const file of photoFiles) {
      await uploadStandPhoto(stand.id, file);
    }

    setSaving(false);
    if (ok) {
      setSaved(true);
      setPhotoFiles([]);
      setPhotoPreviews([]);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('Failed to save changes. Please try again.');
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest';

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-warmth relative overflow-hidden border-b border-sage-dark/30">
        <div className="topo-pattern absolute inset-0 opacity-30" />
        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">
          <Link to="/account" className="inline-flex items-center gap-1 text-sm text-forest hover:underline mb-4 no-underline font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to account
          </Link>
          <h1 className="text-3xl font-display font-bold text-earth">Edit Stand</h1>
          <p className="text-sm text-earth-light mt-2">{stand.name}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        {saved && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Changes saved successfully!
          </div>
        )}

        {/* Read-only info */}
        <div className="bg-sage/20 rounded-xl border border-sage-dark/20 p-5 mb-6">
          <h2 className="text-xs font-display font-semibold text-earth uppercase tracking-wider mb-3">Fixed Information</h2>
          <p className="text-xs text-earth-light mb-3">These fields can only be changed by an admin.</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-earth">
              <MapPin className="w-4 h-4 text-earth-light" />
              <span>{stand.address}</span>
            </div>
            <div className="flex items-center gap-2 text-earth">
              <Tag className="w-4 h-4 text-earth-light" />
              <span>{stand.categories.join(', ')}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-sage-dark/30 p-6">
            <h2 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-4">Description</h2>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              maxLength={500}
              className={`${inputClass} resize-none`}
              placeholder="Tell people about your stand"
            />
          </div>

          {/* Contact */}
          <div className="bg-white rounded-xl border border-sage-dark/30 p-6">
            <h2 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-4">Contact & Availability</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  maxLength={20}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Typical Availability</label>
                <input
                  type="text"
                  value={form.typicalAvailability}
                  onChange={e => setForm(prev => ({ ...prev, typicalAvailability: e.target.value }))}
                  placeholder="e.g., Mornings, Weekends"
                  maxLength={120}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl border border-sage-dark/30 p-6">
            <h2 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-4">Products</h2>
            <input
              type="text"
              value={form.products}
              onChange={e => setForm(prev => ({ ...prev, products: e.target.value }))}
              placeholder="e.g., Wildflower Honey, Beeswax Candles"
              className={inputClass}
            />
            <p className="text-xs text-earth-light mt-1">Comma-separated list</p>
          </div>

          {/* Payment & self-serve */}
          <div className="bg-white rounded-xl border border-sage-dark/30 p-6">
            <h2 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-4">Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth mb-2">Payment Methods</label>
                <div className="flex flex-wrap gap-2">
                  {['Cash', 'Venmo', 'Card', 'PayPal', 'Zelle'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => togglePayment(method)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        form.paymentMethods.includes(method)
                          ? 'bg-amber text-white border-amber'
                          : 'bg-white text-earth border-sage-dark hover:border-amber'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.selfServe}
                  onChange={e => setForm(prev => ({ ...prev, selfServe: e.target.checked }))}
                  className="w-4 h-4 rounded accent-forest"
                />
                <div>
                  <span className="text-sm font-medium text-earth">Self-serve / Honor system</span>
                  <p className="text-xs text-earth-light">Customers can buy without you being present</p>
                </div>
              </label>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl border border-sage-dark/30 p-6">
            <h2 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-4">Add Photos</h2>
            {stand.photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {stand.photos.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-sage-dark/20" />
                ))}
              </div>
            )}
            {photoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-forest/30" />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFiles(prev => prev.filter((_, j) => j !== i));
                        setPhotoPreviews(prev => prev.filter((_, j) => j !== i));
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center p-0 border-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-forest text-white px-1 rounded">New</span>
                  </div>
                ))}
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-sage-dark text-earth rounded-lg text-sm font-medium hover:border-forest hover:text-forest transition-colors cursor-pointer">
              <Camera className="w-4 h-4" />
              Add Photos
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => {
                  const files = Array.from(e.target.files ?? []);
                  const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
                  setPhotoFiles(prev => [...prev, ...valid]);
                  valid.forEach(f => {
                    const reader = new FileReader();
                    reader.onload = ev => {
                      setPhotoPreviews(prev => [...prev, ev.target?.result as string]);
                    };
                    reader.readAsDataURL(f);
                  });
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-forest text-white rounded-lg text-base font-semibold hover:bg-forest-light transition-colors shadow-lg disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
