import { Suspense } from 'react';
import ModelGrid from '@/app/_components/model/ModelGrid';
import SearchBar from '@/app/_components/common/SearchBar';
import FilterPanel from '@/app/_components/common/FilterPanel';
import SortOptions from '@/app/_components/common/SortOptions';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';

async function getModels(searchParams) {
  const params = new URLSearchParams(searchParams);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/models/?${params}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories/`, {
    cache: 'force-cache'
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export default async function ModelsPage({ searchParams }) {
  // ✅ Await searchParams before using
  const awaitedSearchParams = await searchParams;

  try {
    const [modelsData, categories] = await Promise.all([
      getModels(awaitedSearchParams),
      getCategories()
    ]);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Models</h1>
          <p className="text-gray-600">
            Discover and compare AI models from the community
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <FilterPanel categories={categories.results || []} />
          </aside>

          <main className="flex-1">
            <div className="mb-6 space-y-4">
              <SearchBar />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {modelsData.count} models found
                </p>
                <SortOptions />
              </div>
            </div>

            <Suspense fallback={<LoadingSpinner size="lg" text="Loading models..." />}>
              <ModelGrid models={modelsData.results} />
            </Suspense>

            {modelsData.count > modelsData.results.length && (
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Showing {modelsData.results.length} of {modelsData.count} models
                </p>
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
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Models</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
}
