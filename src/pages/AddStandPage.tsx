import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Check, Download, Loader2, Camera, X } from 'lucide-react';
import { Category } from '../data/types';
import { createStand, uploadStandPhoto } from '../lib/api';
import LocationPicker from '../components/LocationPicker';

export default function AddStandPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newStandId, setNewStandId] = useState<string | null>(null);
  const [standName, setStandName] = useState('');
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
    paymentMethods: [] as string[],
    categories: [] as Category[],
    products: '',
  });

  const toggleCategory = (cat: Category) => {
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
    const products = form.products.split(',').map(p => p.trim()).filter(Boolean);
    const result = await createStand({
      name: form.name,
      ownerName: form.ownerName,
      description: form.description,
      address: form.address,
      latitude: latitude ?? 41.2834,
      longitude: longitude ?? -81.2232,
      phone: form.phone,
      website: form.website || undefined,
      categories: form.categories,
      products,
      typicalAvailability: form.typicalAvailability,
      paymentMethods: form.paymentMethods,
      selfServe: form.selfServe,
    });
    setSubmitting(false);
    if (result) {
      // Upload photos if any
      for (const file of photoFiles) {
        await uploadStandPhoto(result.id, file);
      }
      setNewStandId(result.id);
      setStandName(form.name);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (submitted) {
    const qrUrl = `${window.location.origin}/stand/${newStandId}`;
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-earth mb-2">Your stand has been submitted!</h1>
            <p className="text-earth-light mb-6">
              <strong>{standName}</strong> is now under review. We'll have it live on Stand Scout shortly!
            </p>

            <div className="bg-sage/30 rounded-xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-earth uppercase tracking-wider mb-4">
                Your QR Code Flyer
              </h2>
              <div className="bg-white rounded-xl p-6 inline-block border border-sage-dark/20">
                <p className="text-xs text-forest font-semibold mb-3">Stand Scout</p>
                <QRCodeSVG value={qrUrl} size={160} level="M" />
                <p className="text-lg font-bold text-earth mt-3">{standName}</p>
                <p className="text-xs text-earth-light mt-1">Scan to see what's fresh or share what you find!</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-light transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Print / Download Flyer
                </button>
              </div>
            </div>

            <div className="bg-amber/10 rounded-xl p-4 text-left text-sm">
              <p className="font-semibold text-earth mb-1">📱 SMS Status Updates</p>
              <p className="text-earth-light">
                Text <strong>OPEN</strong>, <strong>SOLD</strong>, or <strong>FRESH [items]</strong> to
                our number to update your stand's status. We'll send setup instructions to your phone.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-earth">Add Your Stand</h1>
          <p className="text-sm text-earth-light mt-1">
            It's free, takes under 2 minutes, and no account needed. Let's get you discovered!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Stand info */}
          <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6">
            <h2 className="text-sm font-semibold text-earth uppercase tracking-wider mb-4">Stand Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Stand Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Hawkins Hollow Honey"
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={form.ownerName}
                  onChange={e => setForm(prev => ({ ...prev, ownerName: e.target.value }))}
                  placeholder="e.g., Dale Hawkins"
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell people about your stand — what makes it special?"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6">
            <h2 className="text-sm font-semibold text-earth uppercase tracking-wider mb-4">Location</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address or description of location"
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
              </div>
              <LocationPicker
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }}
                address={form.address}
              />
            </div>
          </div>

          {/* What you sell */}
          <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6">
            <h2 className="text-sm font-semibold text-earth uppercase tracking-wider mb-4">What You Sell</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth mb-2">Categories *</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(Category).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        form.categories.includes(cat)
                          ? 'bg-forest text-white border-forest'
                          : 'bg-white text-earth border-sage-dark/40 hover:border-forest'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Products</label>
                <input
                  type="text"
                  value={form.products}
                  onChange={e => setForm(prev => ({ ...prev, products: e.target.value }))}
                  placeholder="e.g., Wildflower Honey, Beeswax Candles, Lip Balm"
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
                <p className="text-xs text-earth-light mt-1">Comma-separated list of what you typically sell</p>
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6">
            <h2 className="text-sm font-semibold text-earth uppercase tracking-wider mb-4">Photos (optional)</h2>
            <div className="space-y-3">
              {photoPreviews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <img src={src} alt="" className="w-24 h-24 object-cover rounded-lg" />
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
                    </div>
                  ))}
                </div>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-sage-dark/40 text-earth rounded-xl text-sm font-medium hover:border-forest hover:text-forest transition-colors cursor-pointer">
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
              <p className="text-xs text-earth-light">Up to 5MB per photo. Photos help visitors find your stand!</p>
            </div>
          </div>

          {/* Availability & contact */}
          <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 p-6">
            <h2 className="text-sm font-semibold text-earth uppercase tracking-wider mb-4">Availability & Contact</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Typical Availability</label>
                <input
                  type="text"
                  value={form.typicalAvailability}
                  onChange={e => setForm(prev => ({ ...prev, typicalAvailability: e.target.value }))}
                  placeholder="e.g., Mornings, Weekends, When we have eggs"
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 555-0123"
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
                <p className="text-xs text-earth-light mt-1">Used for SMS status updates and shown on your profile</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Website (optional)</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://"
                  className="w-full px-3 py-2.5 rounded-xl border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
              </div>
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
                          : 'bg-white text-earth border-sage-dark/40 hover:border-amber'
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-forest text-white rounded-xl text-base font-semibold hover:bg-forest-light transition-colors shadow-md disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {submitting ? 'Adding your stand...' : "Add My Stand — It's Free!"}
          </button>

          <p className="text-center text-xs text-earth-light">
            No account required. Your stand will be reviewed and go live within 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
