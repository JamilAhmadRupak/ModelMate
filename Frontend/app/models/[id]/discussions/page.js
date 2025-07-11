import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import DiscussionList from '@/app/_components/discussion/DiscussionList';
import Button from '@/app/_components/ui/Button';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import Pagination from '@/app/_components/ui/Pagination';
import SortOptions from '@/app/_components/common/SortOptions';

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

async function getModelDiscussions(id, page = 1, ordering = 'newest') {
  const params = new URLSearchParams({
    page: page.toString(),
    ordering: ordering
  });

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/models/${id}/discussions/?${params}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) throw new Error('Failed to fetch discussions');
  return res.json();
}

export default async function ModelDiscussionsPage({ params, searchParams }) {
  const page = parseInt(searchParams.page) || 1;
  const ordering = searchParams.ordering || 'newest';
  
  try {
    const [model, discussionsData] = await Promise.all([
      getModel(params.id),
      getModelDiscussions(params.id, page, ordering)
    ]);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/models" className="hover:text-gray-900">Models</Link>
            <span>/</span>
            <Link href={`/models/${model.id}`} className="hover:text-gray-900">{model.name}</Link>
            <span>/</span>
            <span className="text-gray-900">Discussions</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Discussions about {model.name}
              </h1>
              <p className="text-gray-600">
                {discussionsData.count} discussions from the community
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href={`/discussions/create?model=${model.id}`}>
                <Button>Start Discussion</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {discussionsData.count} discussions found
          </p>
          <SortOptions />
        </div>

        <div className="space-y-6">
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading discussions..." />}>
            <DiscussionList discussions={discussionsData.results} showModel={false} />
          </Suspense>
          
          {discussionsData.count > 10 && (
            <div className="mt-8">
              <Pagination 
                currentPage={page}
                totalPages={Math.ceil(discussionsData.count / 10)}
                baseUrl={`/models/${params.id}/discussions`}
              />
            </div>
          )}
        </div>

        {discussionsData.results.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No discussions yet
            </h2>
            <p className="text-gray-600 mb-4">
              Be the first to start a discussion about {model.name}
            </p>
            <Link href={`/discussions/create?model=${model.id}`}>
              <Button>Start Discussion</Button>
            </Link>
          </div>
        )}
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
