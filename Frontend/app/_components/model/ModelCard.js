import Link from 'next/link';
import Rating from '../ui/Rating';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function ModelCard({ model }) {
  return (
    <Card hover className="h-full w-full flex flex-col bg-white border border-gray-200 shadow-sm transition-all duration-200 p-4 sm:p-6 min-h-[320px] max-w-full">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg sm:text-xl mb-1 line-clamp-2">
              <Link href={`/models/${model.id}`} className="hover:text-blue-600">
                {model.name}
              </Link>
            </h3>
            <p className="text-sm text-blue-600 mb-2">
              {model.category.name}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Rating value={model.average_rating || 0} readonly size="sm" />
            <span className="text-xs text-gray-500">
              {model.review_count} reviews
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-3">
          {model.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" size="sm">
            {model.version}
          </Badge>
          {model.license && (
            <Badge variant="outline" size="sm">
              {model.license}
            </Badge>
          )}
          {model.size && (
            <Badge variant="info" size="sm">
              {model.size}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>💬 {model.discussion_count || 0}</span>
          <span>👁️ {model.views || 0}</span>
        </div>
        <Link href={`/models/${model.id}`}>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Learn more →
          </button>
        </Link>
      </div>
    </Card>
  );
}
