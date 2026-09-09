import React, { useState } from 'react';

export function StarRating({
  value = 0,
  onChange = null,
  interactive = false,
  size = 'md',
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value || 0;

  return (
    <div className="rating-stars" role="group" aria-label="Rating stars">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            className={`star-btn ${interactive ? 'interactive' : 'readonly'} ${
              isFilled ? 'active' : ''
            }`}
            onClick={() => interactive && onChange && onChange(star)}
            onMouseEnter={() => interactive && setHoverValue(star)}
            onMouseLeave={() => interactive && setHoverValue(0)}
            disabled={!interactive}
            aria-label={`${star} Star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
