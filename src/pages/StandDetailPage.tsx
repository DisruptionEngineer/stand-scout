import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, Navigation, Phone, Globe, Clock, Heart,
  MapPin, CreditCard, Tag, Printer,
  Loader2, Check, Send, Camera, ChevronLeft, ChevronRight, X,
  Star,
} from 'lucide-react';
import { categoryIcons } from '../components/CategoryFilter';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import AvailabilityBadge from '../components/AvailabilityBadge';
import { useFavorites } from '../context/FavoritesContext';
import { useStand, useReviews } from '../lib/hooks';
import { submitReview, uploadStandPhoto, fetchSponsorsNear, type Sponsor } from '../lib/api';
import { sanitizeUrl } from '../lib/sanitize';
import ProductReport from '../components/ProductReport';

export default function StandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { stand, loading } = useStand(id);
  const { reviews, addReview } = useReviews(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  const currentPhotos = photos.length > 0 ? photos : (stand?.photos ?? []);

  const handleLightboxKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setLightbox(null);
    else if (e.key === 'ArrowLeft') setLightbox(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    else if (e.key === 'ArrowRight') setLightbox(prev => (prev !== null && prev < currentPhotos.length - 1 ? prev + 1 : prev));
  }, [currentPhotos.length]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing derived state from prop
    if (stand?.photos && stand.photos.length > 0) setPhotos(stand.photos);
  }, [stand?.photos]);

  useEffect(() => {
    if (stand) fetchSponsorsNear(stand.latitude, stand.longitude).then(setSponsors);
  }, [stand]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !stand) return;
    if (file.size > 5 * 1024 * 1024) { alert('Photo must be under 5MB'); return; }
    setUploading(true);
    const url = await uploadStandPhoto(stand.id, file);
    if (url) setPhotos(prev => [...prev, url]);
    setUploading(false);
    e.target.value = '';
  };

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
          <Link to="/" className="text-forest hover:underline mt-2 inline-block">&larr; Back to map</Link>
        </div>
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) return;
    setReviewStatus('submitting');
    const ok = await submitReview(stand.id, reviewForm.rating, reviewForm.text, reviewForm.name);
    if (ok) {
      addReview({
        id: `local-${Date.now()}`,
        standId: stand.id,
        rating: reviewForm.rating,
        text: reviewForm.text,
        authorName: reviewForm.name,
        date: new Date().toISOString().split('T')[0],
      });
      setReviewForm({ name: '', text: '', rating: 5 });
      setReviewStatus('done');
      setShowReviewForm(false);
    } else {
      setReviewStatus('idle');
    }
  };

  const faved = isFavorite(stand.id);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${stand.latitude},${stand.longitude}`;
  const qrUrl = `${window.location.origin}/stand/${stand.id}`;

  return (
    <div className="min-h-screen bg-cream">
      {/* Immersive header — warm earthy zone */}
      <div className="bg-warmth relative overflow-hidden border-b border-sage-dark/30">
        <div className="topo-pattern absolute inset-0 opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-forest hover:underline mb-5 no-underline font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to map
          </Link>

          {/* Photo gallery */}
          {currentPhotos.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentPhotos.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setLightbox(i)}
                    className="shrink-0 rounded-xl overflow-hidden border border-sage-dark/30 hover:border-forest/40 transition-colors bg-transparent p-0"
                  >
                    <img src={url} alt={`${stand.name} photo ${i + 1}`} className="w-48 h-32 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stand header info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {stand.categories.map(cat => {
                  const Icon = categoryIcons[cat];
                  return (
                    <span key={cat} className="flex items-center gap-1 text-xs bg-sage text-forest px-2.5 py-1 rounded-full font-medium">
                      <Icon className="w-3.5 h-3.5" />
                      {cat}
                    </span>
                  );
                })}
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-earth mb-1">{stand.name}</h1>
              <p className="text-sm text-earth-light">by {stand.ownerName}</p>

              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <AvailabilityBadge stand={stand} size="md" />
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber fill-amber" />
                  <span className="text-sm font-medium text-earth">{stand.rating.toFixed(1)}</span>
                  <span className="text-sm text-earth-light">({stand.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-earth-light">
                  <Clock className="w-4 h-4" />
                  {stand.typicalAvailability}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleFavorite(stand.id)}
              className="p-2.5 rounded-xl hover:bg-white transition-colors border border-sage-dark/30 bg-white/50 shrink-0"
            >
              <Heart className={`w-5 h-5 ${faved ? 'text-rust fill-rust' : 'text-earth-light'}`} />
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mt-5">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light transition-colors no-underline"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </a>
            {stand.phone && (
              <a href={`tel:${stand.phone}`} className="flex items-center gap-2 px-4 py-2.5 border border-sage-dark text-earth rounded-lg text-sm font-medium hover:border-forest hover:text-forest transition-colors no-underline bg-white">
                <Phone className="w-4 h-4" />
                {stand.phone}
              </a>
            )}
            {stand.website && sanitizeUrl(stand.website) && (
              <a href={sanitizeUrl(stand.website)!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 border border-sage-dark text-earth rounded-lg text-sm font-medium hover:border-forest hover:text-forest transition-colors no-underline bg-white">
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog" aria-modal="true" aria-label="Photo gallery"
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)} onKeyDown={handleLightboxKeyDown} tabIndex={-1} ref={el => el?.focus()}
        >
          <button onClick={() => setLightbox(null)} aria-label="Close" className="absolute top-4 right-4 text-white p-2 bg-transparent border-0"><X className="w-6 h-6" /></button>
          {lightbox > 0 && <button onClick={e => { e.stopPropagation(); setLightbox(lightbox - 1); }} aria-label="Previous" className="absolute left-4 text-white p-2 bg-white/10 rounded-full border-0"><ChevronLeft className="w-6 h-6" /></button>}
          <img src={currentPhotos[lightbox]} alt={`${stand.name} photo`} className="max-w-full max-h-[85vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
          {lightbox < currentPhotos.length - 1 && <button onClick={e => { e.stopPropagation(); setLightbox(lightbox + 1); }} aria-label="Next" className="absolute right-4 text-white p-2 bg-white/10 rounded-full border-0"><ChevronRight className="w-6 h-6" /></button>}
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-3">About</h2>
              <p className="text-earth leading-relaxed">{stand.description}</p>
            </div>

            {/* Currently available */}
            <div>
              <h2 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-3">Currently Available</h2>
              {stand.currentlyAvailable.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stand.currentlyAvailable.map(item => (
                    <span key={item} className="text-sm bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">{item}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-earth-light italic">No recent availability info</p>
              )}
            </div>

            {/* All products */}
            <div>
              <h2 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-3">All Products</h2>
              <div className="flex flex-wrap gap-2">
                {stand.products.map(product => (
                  <span key={product} className="text-sm bg-sage text-earth px-3 py-1 rounded-full">{product}</span>
                ))}
              </div>
            </div>

            {/* Community reporting */}
            <ProductReport stand={stand} />

            {/* Photo upload */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 border border-sage-dark text-earth rounded-lg text-sm font-medium hover:border-forest hover:text-forest transition-colors cursor-pointer">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Add a Photo'}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
              </label>
              <span className="text-xs text-earth-light">Share what you see! (max 5MB)</span>
            </div>

            {/* Nearby Recommendations */}
            {sponsors.length > 0 && (
              <div>
                <h2 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-3">Nearby Recommendations</h2>
                <div className="grid gap-3">
                  {sponsors.map(sp => (
                    <a key={sp.id} href={sp.url ?? '#'} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center gap-4 p-4 bg-amber/5 border border-amber/20 rounded-xl hover:border-amber/40 transition-colors no-underline">
                      {sp.logoUrl && <img src={sp.logoUrl} alt={sp.name} className="w-12 h-12 rounded-lg object-contain bg-white p-1 border border-sage-dark/10" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-earth text-sm">{sp.name}</p>
                        <p className="text-xs text-earth-light truncate">{sp.description}</p>
                      </div>
                      <span className="text-[10px] text-earth-light/60 uppercase tracking-wide shrink-0">Sponsor</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-display font-bold text-earth">Reviews</h2>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={stand.rating} size="sm" />
                    <span className="text-sm font-medium text-earth">{stand.rating.toFixed(1)}</span>
                    <span className="text-sm text-earth-light">({stand.reviewCount})</span>
                  </div>
                </div>
                {!showReviewForm && (
                  <button onClick={() => setShowReviewForm(true)} className="text-sm text-forest font-medium hover:underline border-0 bg-transparent p-0">Write a review</button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="bg-sage/30 rounded-xl p-4 mb-4 space-y-3 border border-sage-dark/20">
                  <div>
                    <label className="block text-xs font-medium text-earth mb-1">Your name</label>
                    <input type="text" required value={reviewForm.name} onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20" placeholder="e.g., Sarah M." />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-earth mb-1">Rating</label>
                    <StarRating rating={reviewForm.rating} size="md" interactive onChange={r => setReviewForm(prev => ({ ...prev, rating: r }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-earth mb-1">Your review</label>
                    <textarea required value={reviewForm.text} onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-sage-dark text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 resize-none" placeholder="What did you think?" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={reviewStatus === 'submitting'} className="flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light transition-colors disabled:opacity-50">
                      {reviewStatus === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Submit
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 text-sm text-earth-light hover:text-earth border-0 bg-transparent">Cancel</button>
                  </div>
                </form>
              )}

              {reviewStatus === 'done' && (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-3"><Check className="w-4 h-4" />Review submitted — thank you!</div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-3">{reviews.map(review => <ReviewCard key={review.id} review={review} />)}</div>
              ) : (
                <p className="text-sm text-earth-light">No reviews yet. Be the first!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details card */}
            <div className="bg-white rounded-xl border border-sage-dark/30 p-5">
              <h3 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2.5 text-earth">
                  <MapPin className="w-4 h-4 text-earth-light shrink-0 mt-0.5" />
                  <span>{stand.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-earth">
                  <CreditCard className="w-4 h-4 text-earth-light shrink-0" />
                  <span>{stand.paymentMethods.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2.5 text-earth">
                  <Tag className="w-4 h-4 text-earth-light shrink-0" />
                  <span>{stand.selfServe ? 'Self-serve / Honor system' : 'Staffed stand'}</span>
                </div>
                {stand.seasonal && (
                  <p className="text-amber text-xs font-medium mt-1">Seasonal: {stand.seasonalNotes}</p>
                )}
              </div>
            </div>

            {/* QR Code card */}
            <div className="bg-white rounded-xl border border-sage-dark/30 p-5">
              <h3 className="text-sm font-display font-semibold text-earth uppercase tracking-wider mb-4">QR Code</h3>
              <div className="flex justify-center mb-3">
                <QRCodeSVG value={qrUrl} size={120} level="M" />
              </div>
              <p className="text-[11px] text-earth-light text-center mb-3">Scan to see what&apos;s fresh!</p>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs text-forest mx-auto hover:underline p-0 border-0 bg-transparent font-medium">
                <Printer className="w-3.5 h-3.5" />Print QR flyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
