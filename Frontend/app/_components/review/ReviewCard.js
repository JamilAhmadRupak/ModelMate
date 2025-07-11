import Link from 'next/link';
import Rating from '../ui/Rating';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function ReviewCard({ review, showModel = true }) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {review.title}
          </h3>
          {showModel && review.model && (
            <Link 
              href={`/models/${review.model.id}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {review.model.name}
            </Link>
          )}
        </div>
        <Rating value={review.overall_rating} readonly size="sm" />
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {review.description}
      </p>

      {(review.pros || review.cons) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          {review.pros && (
            <div>
              <span className="font-medium text-green-700">Pros:</span>
              <p className="text-gray-600 line-clamp-2">{review.pros}</p>
            </div>
          )}
          {review.cons && (
            <div>
              <span className="font-medium text-red-700">Cons:</span>
              <p className="text-gray-600 line-clamp-2">{review.cons}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>By {review.author.username}</span>
        <div className="flex items-center space-x-2">
          <span>{new Date(review.created_at).toLocaleDateString()}</span>
          {review.helpful_votes > 0 && (
            <Badge variant="success" size="sm">
              {review.helpful_votes} helpful
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
