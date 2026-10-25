import { Suspense } from 'react';
import Link from 'next/link';
import Card from '@/app/_components/ui/Card';
import Badge from '@/app/_components/ui/Badge';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';

const categoryIcons = {
  'Large Language Models': '🧠',
  'Computer Vision': '👁️',
  'Speech Recognition': '🎤',
  'Generative AI': '🎨',
  'Recommendation Systems': '👍',
  'Natural Language Processing': '📝',
  'Sentiment Analysis': '😃',
  'Forecasting': '📈',
};

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories/`, {
    cache: 'force-cache'
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

async function getCategoryStats() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories/stats/`, {
    cache: 'no-store'
  });
  if (!res.ok) return {};
  return res.json();
}

export default async function CategoriesPage() {
  try {
    const [categories, stats] = await Promise.all([
      getCategories(),
      getCategoryStats()
    ]);
    const totalCategories = categories.results.length;
    const totalModels = Object.values(stats).reduce((sum, s) => sum + (s.model_count || 0), 0);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Model Categories</h1>
            <p className="text-gray-600">
              Explore AI models organized by category and use case
            </p>
          </div>
          <div className="flex gap-6">
            <div className="bg-purple-50 rounded-lg px-4 py-2 text-center">
              <div className="text-lg font-bold text-purple-700">{totalCategories}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
            <div className="bg-purple-50 rounded-lg px-4 py-2 text-center">
              <div className="text-lg font-bold text-purple-700">{totalModels}</div>
              <div className="text-xs text-gray-600">Models</div>
            </div>
          </div>
        </div>

        <Suspense fallback={<LoadingSpinner size="lg" text="Loading categories..." />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.results.map((category) => {
              const categoryStats = stats[category.id] || {};
              const icon = categoryIcons[category.name] || '🤖';
              return (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card hover className="h-full flex flex-col justify-between">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-3xl">{icon}</span>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          {category.name}
                        </h2>
                        <p className="text-gray-600 text-sm line-clamp-3">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                          {categoryStats.model_count || 0} models
                        </span>
                        <span>
                          {categoryStats.total_reviews || 0} reviews
                        </span>
                      </div>
                      {categoryStats.average_rating && (
                        <div className="mt-2 flex items-center text-sm">
                          <span className="text-gray-600">Avg rating:</span>
                          <span className="ml-1 font-medium">
                            {categoryStats.average_rating.toFixed(1)} ★
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Suspense>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No categories available
            </h2>
            <p className="text-gray-600">
              Categories will appear here once they are created
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Categories</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
}
