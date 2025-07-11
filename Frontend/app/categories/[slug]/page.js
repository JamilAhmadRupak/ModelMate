import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ModelGrid from '@/app/_components/model/ModelGrid';
import SearchBar from '@/app/_components/common/SearchBar';
import SortOptions from '@/app/_components/common/SortOptions';
import Card from '@/app/_components/ui/Card';
import Badge from '@/app/_components/ui/Badge';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import Pagination from '@/app/_components/ui/Pagination';
import Link from 'next/link';

async function getCategory(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories/${slug}/`, {
    cache: 'force-cache'
  });
  
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch category');
  }
  
  return res.json();
}

async function getCategoryModels(slug, searchParams) {
  const params = new URLSearchParams(searchParams);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories/${slug}/models/?${params}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) throw new Error('Failed to fetch category models');
  return res.json();
}

async function getCategoryStats(slug) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories/${slug}/stats/`, {
    cache: 'no-store'
  });
  
  if (!res.ok) return null;
  return res.json();
}

export default async function CategoryDetailPage({ params, searchParams }) {
  const page = parseInt(searchParams.page) || 1;
  
  try {
    const [category, modelsData, stats] = await Promise.all([
      getCategory(params.slug),
      getCategoryModels(params.slug, searchParams),
      getCategoryStats(params.slug)
    ]);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/categories" className="hover:text-gray-900">Categories</Link>
            <span>/</span>
            <span className="text-gray-900">{category.name}</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {category.name}
              </h1>
              <p className="text-gray-600 mb-4">
                {category.description}
              </p>
              
              {stats && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant="primary">{stats.model_count} models</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{stats.total_reviews} reviews</Badge>
                  </div>
                  {stats.average_rating && (
                    <div className="flex items-center space-x-2">
                      <Badge variant="success">
                        {stats.average_rating.toFixed(1)} ⭐ avg
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <SearchBar placeholder={`Search ${category.name.toLowerCase()} models...`} />
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {modelsData.count} models found
            </p>
            <SortOptions />
          </div>
        </div>

        {modelsData.results.length > 0 ? (
          <>
            <Suspense fallback={<LoadingSpinner size="lg" text="Loading models..." />}>
              <ModelGrid models={modelsData.results} />
            </Suspense>
            
            {modelsData.count > modelsData.results.length && (
              <div className="mt-8">
                <Pagination 
                  currentPage={page}
                  totalPages={Math.ceil(modelsData.count / 12)}
                  baseUrl={`/categories/${params.slug}`}
                />
              </div>
            )}
          </>
        ) : (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No models in this category yet
              </h2>
              <p className="text-gray-600">
                Models in the {category.name} category will appear here
              </p>
            </div>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Category</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
}
