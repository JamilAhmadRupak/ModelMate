import Link from 'next/link';
import Rating from '../ui/Rating';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import ModelStats from './ModelStats';

export default function ModelDetail({ model }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="primary">{model.category.name}</Badge>
            <Badge variant="outline">{model.version}</Badge>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {model.name}
          </h1>
          
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <Rating value={model.average_rating || 0} readonly />
              <span className="text-lg font-medium text-gray-900">
                {model.average_rating?.toFixed(1) || 'N/A'}
              </span>
              <span className="text-gray-500">
                ({model.review_count} reviews)
              </span>
            </div>
            <div className="text-gray-500">
              {model.discussion_count || 0} discussions
            </div>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            {model.description}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href={`/models/${model.id}/review`}>
              <Button>Write a Review</Button>
            </Link>
            <Link href={`/discussions/create?model=${model.id}`}>
              <Button variant="outline">Start Discussion</Button>
            </Link>
            <Link href={`/models/compare?models=${model.id}`}>
              <Button variant="outline">Compare</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4">Model Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Creator</dt>
                <dd className="text-sm text-gray-900">{model.creator}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Version</dt>
                <dd className="text-sm text-gray-900">{model.version}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Release Date</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(model.release_date).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">License</dt>
                <dd className="text-sm text-gray-900">{model.license}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Model Size</dt>
                <dd className="text-sm text-gray-900">{model.size || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Architecture</dt>
                <dd className="text-sm text-gray-900">{model.architecture || 'N/A'}</dd>
              </div>
            </dl>
            
            {model.url && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <a
                  href={model.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span>View Model Repository</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}
          </Card>
        </div>

        <div>
          <ModelStats model={model} />
        </div>
      </div>
    </div>
  );
}
