import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Loader2, Check, Clock, ChevronRight } from 'lucide-react';
import type { Stand } from '../data/types';
import { submitReport, submitProductReports, fetchRecentProductReports } from '../lib/api';
import { checkRateLimit, recordAction } from '../lib/rateLimiter';
import { sanitizeText } from '../lib/sanitize';

interface ProductReportProps {
  stand: Stand;
  onReported?: () => void;
}

type Phase = 'cooldown' | 'status' | 'products' | 'submitting' | 'done' | 'error';

interface ProductVoteState {
  [product: string]: boolean | null; // true = available, false = not available, null = no vote
}

export default function ProductReport({ stand, onReported }: ProductReportProps) {
  const rateLimit = checkRateLimit('report', stand.id);
  const [phase, setPhase] = useState<Phase>(rateLimit.allowed ? 'status' : 'cooldown');
  const [selectedStatus, setSelectedStatus] = useState<'stocked' | 'empty' | null>(null);
  const [productVotes, setProductVotes] = useState<ProductVoteState>({});
  const [newProduct, setNewProduct] = useState('');
  const [recentReports, setRecentReports] = useState<
    Array<{ productName: string; availableCount: number; unavailableCount: number }>
  >([]);

  // Load recent community reports for this stand
  useEffect(() => {
    fetchRecentProductReports(stand.id).then(setRecentReports);
  }, [stand.id]);

  const handleStatusSelect = (status: 'stocked' | 'empty') => {
    setSelectedStatus(status);
    if (status === 'empty') {
      // If empty, skip product selection — submit directly
      handleSubmit(status, {});
    } else {
      // If stocked, show product checklist
      setPhase('products');
    }
  };

  const toggleProductVote = (product: string) => {
    setProductVotes(prev => {
      const current = prev[product];
      if (current === true) return { ...prev, [product]: false };
      if (current === false) return { ...prev, [product]: null };
      return { ...prev, [product]: true };
    });
  };

  const handleAddProduct = () => {
    const clean = sanitizeText(newProduct, 60);
    if (!clean) return;
    // Add to votes as available
    setProductVotes(prev => ({ ...prev, [clean]: true }));
    setNewProduct('');
  };

  const handleSubmit = async (
    status: 'stocked' | 'empty',
    votes: ProductVoteState,
  ) => {
    // Re-validate rate limit before submission
    const check = checkRateLimit('report', stand.id);
    if (!check.allowed) { setPhase('cooldown'); return; }

    setPhase('submitting');

    // Submit stand-level availability report
    const productsSpotted = Object.entries(votes)
      .filter(([, v]) => v === true)
      .map(([name]) => name);

    const reportOk = await submitReport(stand.id, status, productsSpotted);

    // Submit per-product reports
    const productReports = Object.entries(votes)
      .filter(([, v]) => v !== null)
      .map(([name, isAvailable]) => ({ name, isAvailable: isAvailable! }));

    if (productReports.length > 0) {
      await submitProductReports(stand.id, productReports);
    }

    if (reportOk) {
      recordAction('report', stand.id);
      setPhase('done');
      onReported?.();
    } else {
      setPhase('error');
    }
  };

  // Cooldown view
  if (phase === 'cooldown') {
    return (
      <div className="bg-sage/40 rounded-xl p-5 border border-sage-dark/20">
        <h3 className="text-sm font-display font-semibold text-earth mb-2">Were you just here?</h3>
        <div className="flex items-center gap-2 text-earth-light text-sm">
          <Clock className="w-4 h-4" />
          <span>You reported recently. Check back in {rateLimit.remainingLabel}.</span>
        </div>
      </div>
    );
  }

  // Done view
  if (phase === 'done') {
    return (
      <div className="bg-sage/40 rounded-xl p-5 border border-sage-dark/20">
        <h3 className="text-sm font-display font-semibold text-earth mb-2">Were you just here?</h3>
        <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
          <Check className="w-4 h-4" />
          Thanks for the update! Your report helps the community.
        </div>
        <p className="text-xs text-earth-light mt-2">
          Reports from multiple visitors are combined to confirm availability.
        </p>
      </div>
    );
  }

  // Error view
  if (phase === 'error') {
    return (
      <div className="bg-sage/40 rounded-xl p-5 border border-sage-dark/20">
        <h3 className="text-sm font-display font-semibold text-earth mb-2">Were you just here?</h3>
        <div className="text-red-600 text-sm">Something went wrong. Try again later.</div>
      </div>
    );
  }

  // Submitting view
  if (phase === 'submitting') {
    return (
      <div className="bg-sage/40 rounded-xl p-5 border border-sage-dark/20">
        <h3 className="text-sm font-display font-semibold text-earth mb-2">Were you just here?</h3>
        <div className="flex items-center gap-2 text-earth-light text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Submitting your report...
        </div>
      </div>
    );
  }

  // Status selection view
  if (phase === 'status') {
    return (
      <div className="bg-sage/40 rounded-xl p-5 border border-sage-dark/20">
        <h3 className="text-sm font-display font-semibold text-earth mb-2">Were you just here?</h3>
        <p className="text-xs text-earth-light mb-3">Help others know if the stand is stocked right now.</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleStatusSelect('stocked')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            Yes, it&apos;s stocked!
          </button>
          <button
            onClick={() => handleStatusSelect('empty')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-earth rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <ThumbsDown className="w-4 h-4" />
            Nothing out
          </button>
        </div>
      </div>
    );
  }

  // Product checklist view (phase === 'products')
  const allProducts = [
    ...new Set([
      ...stand.products,
      ...recentReports.map(r => r.productName),
      ...Object.keys(productVotes),
    ]),
  ];

  return (
    <div className="bg-sage/40 rounded-xl p-5 border border-sage-dark/20">
      <h3 className="text-sm font-display font-semibold text-earth mb-1">What did you see?</h3>
      <p className="text-xs text-earth-light mb-3">Tap the items you spotted. This helps confirm availability.</p>

      <div className="space-y-1.5 mb-4">
        {allProducts.map(product => {
          const vote = productVotes[product];
          const report = recentReports.find(r => r.productName === product);
          const confirmCount = report?.availableCount ?? 0;

          return (
            <button
              key={product}
              type="button"
              onClick={() => toggleProductVote(product)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all border ${
                vote === true
                  ? 'bg-green-50 border-green-300 text-green-800'
                  : vote === false
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-white border-sage-dark/20 text-earth hover:border-forest/30'
              }`}
            >
              <span className="flex items-center gap-2">
                {vote === true && <Check className="w-3.5 h-3.5" />}
                {vote === false && <ThumbsDown className="w-3.5 h-3.5" />}
                {product}
              </span>
              {confirmCount > 0 && (
                <span className="text-[11px] text-earth-light/70">
                  {confirmCount} confirmed today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add new product */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newProduct}
          onChange={e => setNewProduct(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddProduct())}
          placeholder="Spotted something else?"
          maxLength={60}
          className="flex-1 px-3 py-2 rounded-lg border border-sage-dark/30 text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 bg-white"
        />
        <button
          type="button"
          onClick={handleAddProduct}
          disabled={!newProduct.trim()}
          className="px-3 py-2 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <button
        type="button"
        onClick={() => handleSubmit(selectedStatus ?? 'stocked', productVotes)}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-light transition-colors"
      >
        Submit Report
        <ChevronRight className="w-4 h-4" />
      </button>

      <p className="text-[11px] text-earth-light/60 mt-2 text-center">
        Multiple reports are combined to verify availability
      </p>
    </div>
  );
}
