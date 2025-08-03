
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md', 
  interactive = false,
  onRatingChange 
}: StarRatingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const starRating = index + 1;
        const isFilled = starRating <= rating;
        
        return (
          <Star
            key={index}
            className={`
              ${sizeClasses[size]} 
              ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              ${interactive ? 'cursor-pointer hover:text-yellow-400 hover:fill-yellow-400' : ''}
            `}
            onClick={() => handleStarClick(starRating)}
          />
        );
      })}
    </div>
  );
};
