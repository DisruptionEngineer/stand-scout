import { useState } from 'react';
import { DollarSign, MapPin, Eye, TrendingUp, Check, Loader2, Send } from 'lucide-react';
import { submitAdLead } from '../lib/api';

const TIERS = [
  {
    name: 'Community',
    price: '$25/mo',
    features: ['Listed on nearby stand pages', 'Business name + link', 'Great for small shops & farms'],
  },
  {
    name: 'Standard',
    price: '$50/mo',
    features: ['Everything in Community', 'Logo & description shown', 'Featured on map view', 'Best value for most businesses'],
    popular: true,
  },
  {
    name: 'Premium',
    price: '$75/mo',
    features: ['Everything in Standard', 'Priority placement', 'Monthly analytics report', 'Ideal for wineries, B&Bs & restaurants'],
  },
];

export default function AdvertisePage() {
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    message: '',
    tier: 'standard',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const ok = await submitAdLead(form);
    setStatus(ok ? 'sent' : 'idle');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero — warm earthy zone */}
      <div className="bg-warmth relative overflow-hidden border-b border-sage-dark/30">
        <div className="topo-pattern absolute inset-0 opacity-40" />
        <div className="relative z-10 max-w-3xl mx-auto text-center py-16 px-4">
          <p className="text-rust text-xs uppercase tracking-[0.2em] font-semibold mb-4 animate-fade-up">
            Local Advertising
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-earth mb-4 animate-fade-up animate-delay-1">
            Reach customers who shop local
          </h1>
          <p className="text-base text-earth-light max-w-xl mx-auto animate-fade-up animate-delay-2">
            Stand Scout connects visitors with roadside stands and local gems.
            Put your business in front of people actively exploring your area.
          </p>
        </div>
      </div>

      {/* Value props */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: MapPin, title: 'Hyperlocal', desc: 'Your business appears on stand pages near you — exactly where customers are' },
            { icon: Eye, title: 'High Intent', desc: 'Visitors are already out exploring and looking for local experiences' },
            { icon: TrendingUp, title: 'Affordable', desc: 'Starting at $25/mo — a fraction of what you\'d pay for digital ads' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl border border-sage-dark/30 p-5 card-lift">
              <Icon className="w-6 h-6 text-forest mb-2" />
              <h3 className="text-sm font-display font-bold text-earth mb-1">{title}</h3>
              <p className="text-xs text-earth-light leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-earth text-center mb-10">Simple pricing</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {TIERS.map(tier => (
            <div
              key={tier.name}
              className={`bg-white rounded-xl border p-6 card-lift ${
                tier.popular ? 'border-forest ring-2 ring-forest/15' : 'border-sage-dark/30'
              }`}
            >
              {tier.popular && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-sage px-2 py-0.5 rounded-full mb-3 inline-block">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-display font-bold text-earth">{tier.name}</h3>
              <p className="text-2xl font-display font-bold text-forest mt-1">{tier.price}</p>
              <ul className="mt-4 space-y-2">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-earth-light">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Lead form */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-2xl border border-sage-dark/30 p-8">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-forest" />
            <h2 className="text-xl font-display font-bold text-earth">Get started</h2>
          </div>
          <p className="text-sm text-earth-light mb-6">
            Tell us about your business and we&apos;ll get you set up.
          </p>

          {status === 'sent' ? (
            <div className="text-center py-8">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-display font-semibold text-earth">Thanks! We&apos;ll be in touch shortly.</p>
              <p className="text-sm text-earth-light mt-1">Usually within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth mb-1">Business Name *</label>
                  <input required value={form.business_name} onChange={e => setForm(p => ({ ...p, business_name: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-1">Your Name *</label>
                  <input required value={form.contact_name} onChange={e => setForm(p => ({ ...p, contact_name: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth mb-1">Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Preferred Tier</label>
                <select value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 bg-white">
                  <option value="community">Community — $25/mo</option>
                  <option value="standard">Standard — $50/mo</option>
                  <option value="premium">Premium — $75/mo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-earth mb-1">Anything else?</label>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 resize-none" placeholder="Tell us about your business or any questions" />
              </div>
              <button type="submit" disabled={status === 'sending'} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-forest text-white rounded-lg text-base font-semibold hover:bg-forest-light transition-colors disabled:opacity-50">
                {status === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {status === 'sending' ? 'Sending...' : 'Get Started'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
