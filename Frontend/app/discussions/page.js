import { Suspense } from 'react';
import Link from 'next/link';
import DiscussionList from '@/app/_components/discussion/DiscussionList';
import Button from '@/app/_components/ui/Button';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import SortOptions from '@/app/_components/common/SortOptions';
import SearchBar from '@/app/_components/common/SearchBar';
import FilterPanel from '@/app/_components/common/FilterPanel';
import Pagination from '@/app/_components/ui/Pagination';

async function getDiscussions(searchParams) {
  const params =  new URLSearchParams(searchParams);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/discussions/?${params}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) throw new Error('Failed to fetch discussions');
  return res.json();
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/discussions/`, {
    cache: 'force-cache'
  });
  
  if (!res.ok) return [];
  return res.json();
}

export default async function DiscussionsPage({ searchParams }) {
  const awaitedSearchParams = await searchParams;
  const page = parseInt(awaitedSearchParams.page) || 1;
  
  try {
    const [discussionsData, categories] = await Promise.all([
      getDiscussions(awaitedSearchParams),
      getCategories()
    ]);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Discussions</h1>
              <p className="text-gray-600">
                Join the conversation about AI models and share your insights
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/discussions/create">
                <Button>Start Discussion</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <FilterPanel categories={categories} />
          </aside>

          <main className="flex-1">
            <div className="mb-6 space-y-4">
              <SearchBar placeholder="Search discussions..." />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {discussionsData.count} discussions found
                </p>
                <SortOptions />
              </div>
            </div>

            <Suspense fallback={<LoadingSpinner size="lg" text="Loading discussions..." />}>
              <DiscussionList discussions={discussionsData.results} />
            </Suspense>

            {discussionsData.count > discussionsData.results.length && (
              <div className="mt-8">
                <Pagination 
                  currentPage={page}
                  totalPages={Math.ceil(discussionsData.count / 10)}
                  baseUrl="/discussions"
                />
              </div>
            )}

            {discussionsData.results.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  No discussions found
                </h2>
                <p className="text-gray-600 mb-4">
                  Be the first to start a discussion in the community
                </p>
                <Link href="/discussions/create">
                  <Button>Start Discussion</Button>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Discussions</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
}
