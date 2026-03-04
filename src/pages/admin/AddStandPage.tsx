import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Loader2, Camera, X } from 'lucide-react';
import { Category } from '../../data/types';
import { createStand, updateStandStatus, uploadStandPhoto } from '../../lib/api';
import { sanitizeText, sanitizeUrl } from '../../lib/sanitize';
import LocationPicker from '../../components/LocationPicker';

export default function AdminAddStandPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    ownerName: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    typicalAvailability: '',
    selfServe: false,
    seasonal: false,
    seasonalNotes: '',
    paymentMethods: [] as string[],
    categories: [] as string[],
    products: '',
  });

  const toggleCategory = (cat: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

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
    setSubmitting(true);

    if (latitude === null || longitude === null) {
      alert('Please place a pin on the map.');
      setSubmitting(false);
      return;
    }

    const products = form.products.split(',').map(p => sanitizeText(p.trim(), 60)).filter(Boolean);
    const cleanWebsite = form.website ? sanitizeUrl(form.website) : undefined;

    const result = await createStand({
      name: sanitizeText(form.name, 200),
      ownerName: sanitizeText(form.ownerName, 80),
      description: sanitizeText(form.description, 500),
      address: sanitizeText(form.address, 200),
      latitude,
      longitude,
      phone: form.phone,
      website: cleanWebsite ?? undefined,
      categories: form.categories,
      products,
      typicalAvailability: sanitizeText(form.typicalAvailability, 120),
      paymentMethods: form.paymentMethods,
      selfServe: form.selfServe,
    });

    if (result) {
      // Auto-approve since admin is adding
      await updateStandStatus(result.id, 'approved');

      // Upload photos
      for (const file of photoFiles) {
        await uploadStandPhoto(result.id, file);
      }

      setSubmitting(false);
      navigate('/admin/stands');
    } else {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest';

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="text-earth-light hover:text-earth transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-earth">Add Stand (Admin)</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <Section title="Stand Information">
            <div>
              <label className="block text-sm font-medium text-earth mb-1">Stand Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Miller's Farm Stand" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth mb-1">Owner Name *</label>
              <input type="text" required value={form.ownerName} onChange={e => setForm(prev => ({ ...prev, ownerName: e.target.value }))} placeholder="e.g., John Miller" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="What makes this stand special?" rows={3} className={`${inputClass} resize-none`} />
            </div>
          </Section>

          {/* Location */}
          <Section title="Location">
            <div>
              <label className="block text-sm font-medium text-earth mb-1">Address *</label>
              <input type="text" required value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Street address" className={inputClass} />
            </div>
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
              onAddressResolved={(addr) => { if (!form.address) setForm(prev => ({ ...prev, address: addr })); }}
            />
          </Section>

          {/* Categories + Products */}
          <Section title="What They Sell">
            <div>
              <label className="block text-sm font-medium text-earth mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {Object.values(Category).map(cat => (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${form.categories.includes(cat) ? 'bg-forest text-white border-forest' : 'bg-white text-earth border-sage-dark/40 hover:border-forest'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-earth mb-1">Products</label>
              <input type="text" value={form.products} onChange={e => setForm(prev => ({ ...prev, products: e.target.value }))} placeholder="Comma-separated: Tomatoes, Corn, Eggs" className={inputClass} />
            </div>
          </Section>

          {/* Details */}
          <Section title="Details">
            <div>
              <label className="block text-sm font-medium text-earth mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="(555) 555-0123" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth mb-1">Website</label>
              <input type="url" value={form.website} onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))} placeholder="https://" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth mb-1">Typical Availability</label>
              <input type="text" value={form.typicalAvailability} onChange={e => setForm(prev => ({ ...prev, typicalAvailability: e.target.value }))} placeholder="e.g., Mornings, Weekends" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-earth mb-2">Payment Methods</label>
              <div className="flex flex-wrap gap-2">
                {['Cash', 'Venmo', 'Card', 'PayPal', 'Zelle'].map(method => (
                  <button key={method} type="button" onClick={() => togglePayment(method)} className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${form.paymentMethods.includes(method) ? 'bg-amber text-white border-amber' : 'bg-white text-earth border-sage-dark/40 hover:border-amber'}`}>
                    {method}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.selfServe} onChange={e => setForm(prev => ({ ...prev, selfServe: e.target.checked }))} className="w-4 h-4 rounded accent-forest" />
                <span className="text-sm text-earth">Self-serve</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.seasonal} onChange={e => setForm(prev => ({ ...prev, seasonal: e.target.checked }))} className="w-4 h-4 rounded accent-forest" />
                <span className="text-sm text-earth">Seasonal</span>
              </label>
            </div>
            {form.seasonal && (
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Seasonal Notes</label>
                <input type="text" value={form.seasonalNotes} onChange={e => setForm(prev => ({ ...prev, seasonalNotes: e.target.value }))} placeholder="e.g., May through October" className={inputClass} />
              </div>
            )}
          </Section>

          {/* Photos */}
          <Section title="Photos">
            {photoPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoPreviews.map((src, i) => (
                  <div key={i} className="relative">
                    <img src={src} alt="" className="w-24 h-24 object-cover rounded-lg" />
                    <button type="button" onClick={() => { setPhotoFiles(prev => prev.filter((_, j) => j !== i)); setPhotoPreviews(prev => prev.filter((_, j) => j !== i)); }} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center p-0 border-0">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-sage-dark/40 text-earth rounded-xl text-sm font-medium hover:border-forest hover:text-forest transition-colors cursor-pointer">
              <Camera className="w-4 h-4" />
              Add Photos
              <input type="file" accept="image/*" multiple onChange={e => {
                const files = Array.from(e.target.files ?? []);
                const valid = files.filter(f => f.size <= 5 * 1024 * 1024);
                setPhotoFiles(prev => [...prev, ...valid]);
                valid.forEach(f => {
                  const reader = new FileReader();
                  reader.onload = ev => setPhotoPreviews(prev => [...prev, ev.target?.result as string]);
                  reader.readAsDataURL(f);
                });
                e.target.value = '';
              }} className="hidden" />
            </label>
          </Section>

          <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-forest text-white rounded-xl text-base font-semibold hover:bg-forest-light transition-colors shadow-md disabled:opacity-50">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {submitting ? 'Creating stand...' : 'Create Stand (Auto-Approved)'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6">
      <h2 className="text-sm font-semibold text-earth uppercase tracking-wider mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
