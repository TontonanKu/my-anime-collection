interface RatingStarsProps {
  rating: number; // out of 5
  size?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export function RatingStars({ rating, size = 20, interactive = false, onChange }: RatingStarsProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center text-primary-container gap-0.5">
      {stars.map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        const icon = filled ? 'star' : half ? 'star_half' : 'star';

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            className={interactive ? 'cursor-pointer active:scale-90 transition-transform' : 'cursor-default'}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: size,
                fontVariationSettings: filled || half ? "'FILL' 1" : "'FILL' 0",
                color: filled || half ? undefined : '#d9d9d9',
              }}
            >
              {icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}
