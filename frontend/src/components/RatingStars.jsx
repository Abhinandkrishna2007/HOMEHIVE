import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const RatingStars = ({ rating = 0, size = 16, className = '' }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} size={size} className="fill-amber-400 text-amber-400" />);
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(<StarHalf key={i} size={size} className="fill-amber-400 text-amber-400" />);
    } else {
      stars.push(<Star key={i} size={size} className="text-gray-300 fill-gray-100" />);
    }
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars}
      {rating > 0 && (
        <span className="text-xs font-extrabold text-brand-navy ml-1.5 leading-none">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
