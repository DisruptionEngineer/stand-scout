import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4.5 h-4.5', lg: 'w-5.5 h-5.5' };

export default function StarRating({ rating, max = 5, size = 'md', interactive = false, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(i + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform disabled:opacity-100 p-0 border-0 bg-transparent`}
          >
            <Star
              className={`${sizes[size]} ${
                filled
                  ? 'text-amber fill-amber'
                  : half
                    ? 'text-amber fill-amber/50'
                    : 'text-sage-dark'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
