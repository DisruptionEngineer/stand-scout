import { Link } from 'react-router-dom';
import { Heart, Plus, Smartphone, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero — warm earthy tone (differentiate from homepage dark green) */}
      <section className="bg-warmth relative overflow-hidden border-b border-sage-dark/30">
        <div className="topo-pattern absolute inset-0 opacity-50" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-16 sm:py-24">
            <div>
              <p className="text-rust text-[11px] uppercase tracking-[0.25em] font-semibold mb-4 animate-fade-up">
                Your Roadside Field Guide
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-[1.15] text-earth mb-5 animate-fade-up animate-delay-1">
                Discover What&apos;s Growing Around the Corner
              </h1>
              <p className="text-earth-light text-base leading-relaxed animate-fade-up animate-delay-2">
                Stand Scout is a free, community-powered platform that maps every roadside stand,
                farm stand, and home-based seller in your area. We believe the best food and
                goods come from your neighbors.
              </p>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 animate-fade-up animate-delay-3">
                <div className="bg-forest-dark rounded-xl p-5 text-white">
                  <p className="text-3xl font-display font-bold text-amber-light">18+</p>
                  <p className="text-xs text-sage/60 mt-1">Active Stands</p>
                </div>
                <div className="bg-forest-dark rounded-xl p-5 text-white mt-6">
                  <p className="text-3xl font-display font-bold text-amber-light">100%</p>
                  <p className="text-xs text-sage/60 mt-1">Free Forever</p>
                </div>
                <div className="bg-forest-dark rounded-xl p-5 text-white -mt-2">
                  <p className="text-3xl font-display font-bold text-amber-light">SMS</p>
                  <p className="text-xs text-sage/60 mt-1">Status Updates</p>
                </div>
                <div className="bg-forest-dark rounded-xl p-5 text-white mt-4">
                  <p className="text-3xl font-display font-bold text-amber-light">QR</p>
                  <p className="text-xs text-sage/60 mt-1">Scan & Report</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — dark contrast section */}
      <section className="bg-forest-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh opacity-40" />
        <div className="grain-overlay-static absolute inset-0 opacity-[0.03]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-3">
            How It Works
          </h2>
          <p className="text-sage/60 text-center mb-12 text-sm">
            Three steps. No accounts. No apps to download.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {[
              {
                step: '1',
                title: 'Discover',
                description: 'Open the map. Find stands near you. Filter by what you want — produce, eggs, honey, flowers, and more.',
              },
              {
                step: '2',
                title: 'Report',
                description: 'Visit a stand and scan the QR code. One tap to tell the community what\'s stocked. Freshness data in real time.',
              },
              {
                step: '3',
                title: 'Update',
                description: 'Stand owners text OPEN, SOLD, or FRESH to update their status. Works on any phone — even a flip phone.',
              },
            ].map(({ step, title, description }, i) => (
              <div key={title} className="relative text-center px-6 py-8">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-sage/20" />
                )}
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-display font-bold text-amber-light">{step}</span>
                </div>
                <h3 className="font-display font-semibold text-white mb-2 text-lg">{title}</h3>
                <p className="text-sm text-sage/60 leading-relaxed max-w-xs mx-auto">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Stand Scout — editorial two-column on cream */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-rust font-semibold mb-3">Why We Built This</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-earth mb-4 leading-tight">
              The best food doesn&apos;t come from a store.
            </h2>
            <p className="text-earth-light leading-relaxed mb-4">
              In Portage County, you can drive five minutes in any direction and find someone selling
              eggs from their driveway, honey from their back yard, or tomatoes from a roadside table.
              The problem? Nobody knows they&apos;re there until they drive past.
            </p>
            <p className="text-earth-light leading-relaxed">
              Stand Scout makes the invisible visible. We connect buyers with sellers, surface real-time
              availability so you don&apos;t drive 20 minutes to an empty table, and give stand owners
              the simplest possible way to say &ldquo;we&apos;re open.&rdquo;
            </p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Heart, title: 'Always free for stand owners', desc: 'No tiers, no paywalls, no premium gates. Listing your stand costs nothing.', accent: 'bg-rust/10 text-rust' },
              { icon: Zap, title: 'Dead simple onboarding', desc: 'Add your stand in under 2 minutes. No account needed. No app to download.', accent: 'bg-amber/10 text-amber' },
              { icon: Users, title: 'Community-driven', desc: 'Anyone can add a stand they\'ve spotted. Visitors confirm what\'s stocked in real time.', accent: 'bg-forest/10 text-forest' },
              { icon: Smartphone, title: 'Works on rural internet', desc: 'Lightweight, fast, mobile-first. SMS updates work on any phone, any carrier.', accent: 'bg-earth-light/10 text-earth-light' },
            ].map(({ icon: Icon, title, desc, accent }) => (
              <div key={title} className="flex gap-3 p-4 rounded-xl bg-white border border-sage-dark/20 card-lift">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent.split(' ')[0]}`}>
                  <Icon className={`w-4.5 h-4.5 ${accent.split(' ')[1]}`} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-earth text-sm">{title}</h3>
                  <p className="text-xs text-earth-light mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SMS system — warm earthy background */}
      <section className="bg-warmth relative overflow-hidden border-y border-sage-dark/30">
        <div className="topo-pattern absolute inset-0 opacity-30" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-rust font-semibold mb-3">For Stand Owners</p>
              <h2 className="text-2xl font-display font-bold text-earth mb-3">Update with a text message</h2>
              <p className="text-sm text-earth-light leading-relaxed">
                No smartphone required. Text a keyword to our number and your stand&apos;s status
                updates instantly. Your customers see it on the map in real time.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-sage-dark/30 p-5 shadow-sm">
              <div className="space-y-3">
                {[
                  { msg: 'OPEN', result: 'Stand shows: Items Available' },
                  { msg: 'FRESH tomatoes, corn, eggs', result: 'Updates what\'s currently available' },
                  { msg: 'SOLD', result: 'Stand shows: Sold Out for today' },
                ].map(({ msg, result }) => (
                  <div key={msg} className="flex items-center gap-3">
                    <code className="text-sm font-mono text-forest bg-sage px-2.5 py-1 rounded font-semibold shrink-0">{msg}</code>
                    <span className="text-xs text-earth-light">&rarr; {result}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-earth-light mt-4 pt-3 border-t border-sage">
                Status resets to &ldquo;Unknown&rdquo; after 18 hours to prevent stale data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — dark to contrast with warm sections above */}
      <section className="bg-forest-dark relative overflow-hidden">
        <div className="absolute inset-0 hero-mesh opacity-40" />
        <div className="grain-overlay-static absolute inset-0 opacity-[0.03]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">Got a stand? Get discovered.</h2>
            <p className="text-sage/60 mb-6 max-w-md mx-auto text-sm">
              Free forever. Under 2 minutes. No account needed.
            </p>
            <Link
              to="/add"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rust text-white rounded-lg font-semibold hover:bg-rust-light transition-colors no-underline shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Your Stand
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
