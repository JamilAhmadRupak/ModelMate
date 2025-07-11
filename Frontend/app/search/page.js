import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import ModelGrid from '@/app/_components/model/ModelGrid';
import DiscussionList from '@/app/_components/discussion/DiscussionList';
import ReviewList from '@/app/_components/review/ReviewList';
import SearchBar from '@/app/_components/common/SearchBar';
import SortOptions from '@/app/_components/common/SortOptions';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import Card from '@/app/_components/ui/Card';
import Badge from '@/app/_components/ui/Badge';
import Link from 'next/link';

async function searchAll(query, type = 'all') {
  if (!query) return { models: [], discussions: [], reviews: [] };

  const results = {};
  
  if (type === 'all' || type === 'models') {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/models/?search=${encodeURIComponent(query)}&limit=12`, {
        cache: 'no-store'
      });
      results.models = res.ok ? (await res.json()).results : [];
    } catch {
      results.models = [];
    }
  }

  if (type === 'all' || type === 'discussions') {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/discussions/?search=${encodeURIComponent(query)}&limit=10`, {
        cache: 'no-store'
      });
      results.discussions = res.ok ? (await res.json()).results : [];
    } catch {
      results.discussions = [];
    }
  }

  if (type === 'all' || type === 'reviews') {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/reviews/?search=${encodeURIComponent(query)}&limit=10`, {
        cache: 'no-store'
      });
      results.reviews = res.ok ? (await res.json()).results : [];
    } catch {
      results.reviews = [];
    }
  }

  return results;
}

export default async function SearchPage({ searchParams }) {
  const query = searchParams.q;
  const type = searchParams.type || 'all';

  if (!query) {
    redirect('/');
  }

  const results = await searchAll(query, type);
  const totalResults = (results.models?.length || 0) + (results.discussions?.length || 0) + (results.reviews?.length || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Search Results for &quot;{query}&quot;
        </h1>
        <p className="text-gray-600">
          {totalResults} results found
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <SearchBar />
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <div className="flex space-x-2">
              <Badge variant={type === 'all' ? 'primary' : 'outline'} size="sm">
                <a href={`/search?q=${encodeURIComponent(query)}&type=all`}>All</a>
              </Badge>
              <Badge variant={type === 'models' ? 'primary' : 'outline'} size="sm">
                <a href={`/search?q=${encodeURIComponent(query)}&type=models`}>Models</a>
              </Badge>
              <Badge variant={type === 'discussions' ? 'primary' : 'outline'} size="sm">
                <a href={`/search?q=${encodeURIComponent(query)}&type=discussions`}>Discussions</a>
              </Badge>
              <Badge variant={type === 'reviews' ? 'primary' : 'outline'} size="sm">
                <a href={`/search?q=${encodeURIComponent(query)}&type=reviews`}>Reviews</a>
              </Badge>
            </div>
          </div>
          <div className="ml-auto">
            <SortOptions />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {(type === 'all' || type === 'models') && results.models && results.models.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Models ({results.models.length})
              </h2>
              {type === 'all' && (
                <a 
                  href={`/search?q=${encodeURIComponent(query)}&type=models`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View all models →
                </a>
              )}
            </div>
            <Suspense fallback={<LoadingSpinner size="lg" text="Loading models..." />}>
              <ModelGrid models={results.models} />
            </Suspense>
          </section>
        )}

        {(type === 'all' || type === 'discussions') && results.discussions && results.discussions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Discussions ({results.discussions.length})
              </h2>
              {type === 'all' && (
                <a 
                  href={`/search?q=${encodeURIComponent(query)}&type=discussions`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View all discussions →
                </a>
              )}
            </div>
            <Suspense fallback={<LoadingSpinner size="lg" text="Loading discussions..." />}>
              <DiscussionList discussions={results.discussions} />
            </Suspense>
          </section>
        )}

        {(type === 'all' || type === 'reviews') && results.reviews && results.reviews.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Reviews ({results.reviews.length})
              </h2>
              {type === 'all' && (
                <a 
                  href={`/search?q=${encodeURIComponent(query)}&type=reviews`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View all reviews →
                </a>
              )}
            </div>
            <Suspense fallback={<LoadingSpinner size="lg" text="Loading reviews..." />}>
              <ReviewList reviews={results.reviews} />
            </Suspense>
          </section>
        )}

        {totalResults === 0 && (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or browse our categories
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/models" className="text-blue-600 hover:text-blue-800">Models</Link>
                <Link href="/categories" className="text-blue-600 hover:text-blue-800">Categories</Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
