import { Link } from 'react-router-dom';
import { MapPin, MessageSquare, QrCode, Heart, Plus, Smartphone } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-forest text-white py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Discover Roadside Gems Near You
          </h1>
          <p className="text-lg text-sage/90 max-w-2xl mx-auto leading-relaxed">
            Stand Scout is a free, community-powered platform that maps every roadside stand,
            farm stand, and home-based seller in rural areas. We believe the best food and
            goods come from your neighbors.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* How it works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-earth text-center mb-10">How Stand Scout Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: 'Discover',
                description: 'Find roadside stands near you on our interactive map. Filter by what you\'re looking for — produce, eggs, honey, flowers, and more.',
              },
              {
                icon: QrCode,
                title: 'Report',
                description: 'Scan the QR code at any stand to let others know what\'s available. One tap to confirm it\'s stocked or empty.',
              },
              {
                icon: Smartphone,
                title: 'Stay Updated',
                description: 'Stand owners text a simple keyword to update their status. Works on any phone, even a flip phone. No app needed.',
              },
            ].map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-sage-dark/20 text-center">
                <div className="w-12 h-12 bg-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-forest" />
                </div>
                <h3 className="font-semibold text-earth mb-2">{title}</h3>
                <p className="text-sm text-earth-light leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our promise */}
        <section className="mb-16">
          <div className="bg-sage/50 rounded-2xl p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-earth mb-6 text-center">Our Promise</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                { title: 'Always free for stand owners', description: 'No tiers, no paywalls, no premium features that gate basic functionality. Period.' },
                { title: 'Dead simple onboarding', description: 'A farmer should be able to list their stand in under 2 minutes with a simple web form.' },
                { title: 'Community-driven growth', description: 'Anyone can add a stand they\'ve spotted. The community uploads photos, confirms hours, and leaves reviews.' },
                { title: 'Works on rural internet', description: 'Lightweight, fast, and functional on slow connections. Mobile-first because discovery happens on the road.' },
              ].map(({ title, description }) => (
                <div key={title} className="flex gap-3">
                  <Heart className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-earth text-sm">{title}</h3>
                    <p className="text-xs text-earth-light mt-1 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SMS system */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-earth text-center mb-6">SMS Status Updates</h2>
          <p className="text-center text-earth-light mb-8 max-w-2xl mx-auto">
            Stand owners can update their availability with a simple text message.
            No smartphone required — works on any phone.
          </p>
          <div className="bg-white rounded-2xl border border-sage-dark/20 p-6 max-w-lg mx-auto">
            <div className="space-y-4">
              {[
                { msg: 'OPEN', result: 'Stand shows: Items Available 🟢' },
                { msg: 'FRESH tomatoes, corn, eggs', result: 'Updates what\'s currently available' },
                { msg: 'SOLD', result: 'Stand shows: Sold Out for today 🔴' },
              ].map(({ msg, result }) => (
                <div key={msg} className="flex items-start gap-3">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <MessageSquare className="w-4 h-4 text-forest" />
                    <code className="text-sm font-mono text-forest bg-sage px-2 py-0.5 rounded">{msg}</code>
                  </div>
                  <span className="text-xs text-earth-light pt-0.5">→ {result}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-earth-light mt-4 pt-3 border-t border-sage">
              Status automatically resets to "Unknown" after 18 hours to prevent stale data.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-forest rounded-2xl p-8 sm:p-10 text-white">
            <h2 className="text-2xl font-bold mb-3">Got a stand? Get discovered.</h2>
            <p className="text-sage/90 mb-6 max-w-md mx-auto">
              It takes under 2 minutes to list your stand. Free forever.
              No account needed.
            </p>
            <Link
              to="/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber text-white rounded-xl font-semibold hover:bg-amber-light transition-colors no-underline"
            >
              <Plus className="w-5 h-5" />
              Add Your Stand
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
