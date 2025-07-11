import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import ReviewList from '@/app/_components/review/ReviewList';
import ReviewStats from '@/app/_components/review/ReviewStats';
import Button from '@/app/_components/ui/Button';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import Pagination from '@/app/_components/ui/Pagination';

async function getModel(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/models/${id}/`, {
    cache: 'force-cache'
  });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch model');
  }
  
  return res.json();
}

async function getModelReviews(id, page = 1) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/models/${id}/reviews/?page=${page}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

async function getReviewStats(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/models/${id}/stats/`, {
    cache: 'no-store'
  });
  
  if (!res.ok) return null;
  return res.json();
}

export default async function ModelReviewsPage({ params, searchParams }) {
  const page = parseInt(searchParams.page) || 1;
  
  try {
    const [model, reviewsData, stats] = await Promise.all([
      getModel(params.id),
      getModelReviews(params.id, page),
      getReviewStats(params.id)
    ]);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/models" className="hover:text-gray-900">Models</Link>
            <span>/</span>
            <Link href={`/models/${model.id}`} className="hover:text-gray-900">{model.name}</Link>
            <span>/</span>
            <span className="text-gray-900">Reviews</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reviews for {model.name}
              </h1>
              <p className="text-gray-600">
                {reviewsData.count} reviews from the community
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href={`/models/${model.id}/review`}>
                <Button>Write a Review</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingSpinner size="lg" text="Loading reviews..." />}>
              <ReviewList reviews={reviewsData.results} showModel={false} />
            </Suspense>
            
            {reviewsData.count > 10 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={page}
                  totalPages={Math.ceil(reviewsData.count / 10)}
                  baseUrl={`/models/${params.id}/reviews`}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            {stats && <ReviewStats stats={stats} />}
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Write Your Review
              </h3>
              <p className="text-blue-800 text-sm mb-4">
                Share your experience with {model.name} to help others make informed decisions.
              </p>
              <Link href={`/models/${model.id}/review`}>
                <Button variant="outline" className="w-full">
                  Write Review
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Reviews</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
}
