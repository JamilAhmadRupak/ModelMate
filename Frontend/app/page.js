import { Suspense } from 'react';
import Link from 'next/link';
import ModelGrid from './_components/model/ModelGrid';
import LoadingSpinner from './_components/ui/LoadingSpinner';
import AuthStatus from './_components/auth/AuthStatus';
import TrendingDiscussions from './_components/community/TrendingDiscussions';
import TopContributors from './_components/community/TopContributors';
import GettingStartedCard from './_components/community/GettingStartedCard';
import LiveActivityFeed from './_components/community/LiveActivityFeed';
import Card from './_components/ui/Card';

// Remove all mock/static data
// trendingDiscussions, topContributors, communityStats, recentActivity
// Only fetch from backend

async function getFeaturedModels() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/models/?limit=6`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch featured models');
  return res.json();
}

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/categories/?limit=6`, { cache: 'force-cache' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export default async function HomePage() {
  let models = [];
  let categories = [];
  let error = null;

  try {
    [models, categories] = await Promise.all([
      getFeaturedModels(),
      getCategories()
    ]);
  } catch (err) {
    error = err.message;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">Welcome to ModelMate</h1>
              <p className="text-lg text-gray-600 mb-4 max-w-xl mx-auto md:mx-0">
                The best place to discover, review, and discuss the latest AI models with a thriving community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start items-center mb-4">
                <Link href="/auth/register" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all">Join Now</Link>
                <Link href="/auth/login" className="px-6 py-2 bg-gray-100 text-blue-700 rounded-lg font-semibold border border-blue-200 hover:bg-blue-50 transition-all">Sign In</Link>
                <Link href="/models" className="px-6 py-2 bg-white text-gray-700 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-all">Explore Models</Link>
              </div>
            </div>
            {/* Top Contributors Leaderboard - removed, backend endpoint needed */}
          </div>
        </div>
      </section>
      {/* Trending Models Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Trending Models</h2>
              <p className="text-gray-600 text-sm">Most discussed and reviewed this week</p>
            </div>
            <Link href="/models" className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
              View all
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <Suspense fallback={<LoadingSpinner text="Loading trending models..." />}>
            <ModelGrid models={models.results || []} />
          </Suspense>
        </div>
      </section>
      {/* Categories Section */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Categories</h2>
          <Suspense fallback={<LoadingSpinner text="Loading categories..." />}>
            {/* Render categories from backend */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              {categories.results?.map(category => (
                <Link key={category.id} href={`/categories/${category.slug}`} className="block bg-gray-50 rounded-lg p-4 text-center hover:bg-blue-50">
                  <div className="text-lg font-semibold text-gray-900">{category.name}</div>
                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">{category.description}</div>
                </Link>
              ))}
            </div>
          </Suspense>
        </div>
      </section>
      {/* Other sections (community stats, activity, etc.) removed or hidden until backend endpoints are available */}
    </div>
  );
}