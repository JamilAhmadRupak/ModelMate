import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const Rating = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showValue = false,
  interactive = false,
  onChange = () => {}
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[...Array(maxRating)].map((_, index) => {
          const isFilled = index < rating;
          const StarComponent = isFilled ? StarIcon : StarOutlineIcon;

          return (
            <StarComponent
              key={index}
              className={`${sizeClasses[size]} ${
                isFilled ? 'text-yellow-400' : 'text-gray-300'
              } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
              onClick={() => interactive && onChange(index + 1)}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;