import type { Review } from '../data/types';
import StarRating from './StarRating';

export default function ReviewCard({ review }: { review: Review }) {
  const dateStr = new Date(review.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl p-4 border border-sage-dark/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-forest/10 rounded-lg flex items-center justify-center text-forest font-display font-bold text-sm">
            {review.authorName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm text-earth">{review.authorName}</p>
            <p className="text-xs text-earth-light">{dateStr}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      <p className="text-sm text-earth leading-relaxed">{review.text}</p>
    </div>
  );
}
