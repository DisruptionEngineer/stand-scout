import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, Navigation, Phone, Globe, Clock, Heart,
  MapPin, CreditCard, Tag, Printer, ThumbsUp, ThumbsDown,
  Loader2, Check, Send,
} from 'lucide-react';
import { categoryIcons } from '../components/CategoryFilter';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import AvailabilityBadge from '../components/AvailabilityBadge';
import { useFavorites } from '../context/FavoritesContext';
import { useStand, useReviews } from '../lib/hooks';
import { submitReport, submitReview } from '../lib/api';

export default function StandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { stand, loading } = useStand(id);
  const { reviews, addReview } = useReviews(id);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [reportStatus, setReportStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [reviewForm, setReviewForm] = useState({ name: '', text: '', rating: 5 });
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [showReviewForm, setShowReviewForm] = useState(false);

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
          <p className="text-xl font-bold text-earth">Stand not found</p>
          <Link to="/" className="text-forest hover:underline mt-2 inline-block">← Back to map</Link>
        </div>
      </div>
    );
  }

  const handleReport = async (status: 'stocked' | 'empty') => {
    setReportStatus('submitting');
    await submitReport(stand.id, status);
    setReportStatus('done');
  };

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-forest hover:underline mb-4 no-underline">
          <ArrowLeft className="w-4 h-4" />
          Back to map
        </Link>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-sage-dark/20 overflow-hidden">
          {/* Header band */}
          <div className="h-2 bg-gradient-to-r from-forest to-forest-light" />

          <div className="p-6 sm:p-8">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-earth">{stand.name}</h1>
                <p className="text-sm text-earth-light mt-1">by {stand.ownerName}</p>
              </div>
              <button
                onClick={() => toggleFavorite(stand.id)}
                className="p-2 rounded-xl hover:bg-sage transition-colors border-0 bg-transparent"
              >
                <Heart className={`w-6 h-6 ${faved ? 'text-amber fill-amber' : 'text-earth-light'}`} />
              </button>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <AvailabilityBadge stand={stand} size="md" />
              <div className="flex items-center gap-1.5 mt-2 text-sm text-earth-light">
                <Clock className="w-4 h-4" />
                <span>Typically: {stand.typicalAvailability}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-earth leading-relaxed mb-6">{stand.description}</p>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-light transition-colors no-underline"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </a>
              {stand.phone && (
                <a
                  href={`tel:${stand.phone}`}
                  className="flex items-center gap-2 px-4 py-2.5 border border-forest text-forest rounded-xl text-sm font-medium hover:bg-sage transition-colors no-underline"
                >
                  <Phone className="w-4 h-4" />
                  {stand.phone}
                </a>
              )}
              {stand.website && (
                <a
                  href={stand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 border border-sage-dark/40 text-earth rounded-xl text-sm font-medium hover:border-forest hover:text-forest transition-colors no-underline"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Currently available */}
              <div>
                <h3 className="text-sm font-semibold text-earth uppercase tracking-wider mb-3">
                  Currently Available
                </h3>
                {stand.currentlyAvailable.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stand.currentlyAvailable.map(item => (
                      <span key={item} className="text-sm bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-earth-light italic">No recent availability info</p>
                )}
              </div>

              {/* All products */}
              <div>
                <h3 className="text-sm font-semibold text-earth uppercase tracking-wider mb-3">
                  All Products
                </h3>
                <div className="flex flex-wrap gap-2">
                  {stand.products.map(product => (
                    <span key={product} className="text-sm bg-sage text-earth px-3 py-1 rounded-full">
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div>
                <h3 className="text-sm font-semibold text-earth uppercase tracking-wider mb-3">Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-earth">
                    <MapPin className="w-4 h-4 text-earth-light shrink-0" />
                    {stand.address}
                  </div>
                  <div className="flex items-center gap-2 text-earth">
                    <CreditCard className="w-4 h-4 text-earth-light shrink-0" />
                    {stand.paymentMethods.join(', ')}
                  </div>
                  <div className="flex items-center gap-2 text-earth">
                    <Tag className="w-4 h-4 text-earth-light shrink-0" />
                    {stand.selfServe ? 'Self-serve / Honor system' : 'Staffed stand'}
                  </div>
                  {stand.seasonal && (
                    <p className="text-amber text-xs font-medium mt-1">
                      🌿 Seasonal: {stand.seasonalNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div>
                <h3 className="text-sm font-semibold text-earth uppercase tracking-wider mb-3">
                  QR Code
                </h3>
                <div className="bg-white border border-sage-dark/30 rounded-xl p-4 inline-block">
                  <QRCodeSVG value={qrUrl} size={120} level="M" />
                  <p className="text-[10px] text-earth-light mt-2 text-center">
                    Scan to see what's fresh!
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs text-forest mt-2 hover:underline p-0 border-0 bg-transparent font-medium"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print QR flyer
                </button>
              </div>
            </div>

            {/* Community reporting */}
            <div className="bg-sage/50 rounded-xl p-5 mb-8">
              <h3 className="text-sm font-semibold text-earth mb-2">Were you just here?</h3>
              <p className="text-xs text-earth-light mb-3">
                Help others know if the stand is stocked right now.
              </p>
              {reportStatus === 'done' ? (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Thanks for the update!
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReport('stocked')}
                    disabled={reportStatus === 'submitting'}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {reportStatus === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                    Yes, it's stocked!
                  </button>
                  <button
                    onClick={() => handleReport('empty')}
                    disabled={reportStatus === 'submitting'}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-earth rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Nothing out
                  </button>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-earth">Reviews</h3>
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={stand.rating} size="sm" />
                    <span className="text-sm font-medium text-earth">{stand.rating.toFixed(1)}</span>
                    <span className="text-sm text-earth-light">({stand.reviewCount})</span>
                  </div>
                </div>
                {!showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="text-sm text-forest font-medium hover:underline border-0 bg-transparent p-0"
                  >
                    Write a review
                  </button>
                )}
              </div>

              {/* Review form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="bg-sage/30 rounded-xl p-4 mb-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-earth mb-1">Your name</label>
                    <input
                      type="text"
                      required
                      value={reviewForm.name}
                      onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30"
                      placeholder="e.g., Sarah M."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-earth mb-1">Rating</label>
                    <StarRating rating={reviewForm.rating} size="md" interactive onChange={r => setReviewForm(prev => ({ ...prev, rating: r }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-earth mb-1">Your review</label>
                    <textarea
                      required
                      value={reviewForm.text}
                      onChange={e => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-sage-dark/40 text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 resize-none"
                      placeholder="What did you think?"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={reviewStatus === 'submitting'}
                      className="flex items-center gap-1.5 px-4 py-2 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light transition-colors disabled:opacity-50"
                    >
                      {reviewStatus === 'submitting' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 text-sm text-earth-light hover:text-earth border-0 bg-transparent"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {reviewStatus === 'done' && (
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-3">
                  <Check className="w-4 h-4" />
                  Review submitted — thank you!
                </div>
              )}

              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-earth-light">No reviews yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
