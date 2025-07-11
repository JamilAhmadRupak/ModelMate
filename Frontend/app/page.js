import { Suspense } from 'react';
import Link from 'next/link';
import ModelGrid from './_components/model/ModelGrid';
import LoadingSpinner from './_components/ui/LoadingSpinner';
import Card from './_components/ui/Card';
import Button from './_components/ui/Button';
import Header from './_components/layout/Header';
import ProfilePage from './profile/page';

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

// Mock data for community stats and recent activity
const communityStats = {
  totalModels: 1248,
  activeReviewers: 324,
  totalReviews: 5672,
  onlineUsers: 89
};

const recentActivity = [
  { id: 1, user: 'Alex Chen', action: 'reviewed', target: 'GPT-4 Turbo', time: '2 min ago', rating: 5 },
  { id: 2, user: 'Sarah Kim', action: 'discussed', target: 'Claude 3 Opus', time: '5 min ago', rating: null },
  { id: 3, user: 'Mike Johnson', action: 'compared', target: 'Gemini vs ChatGPT', time: '12 min ago', rating: null },
  { id: 4, user: 'Emma Davis', action: 'reviewed', target: 'Llama 2 70B', time: '18 min ago', rating: 4 }
];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            {/* Community Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium mb-6 shadow-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              {communityStats.onlineUsers} members online now
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
              ModelMate
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Where AI enthusiasts discover, review, and discuss the latest models
            </p>
            
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Join our vibrant community of researchers, developers, and AI enthusiasts. Share insights, compare models, and stay ahead of the curve.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/models" className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative px-8 py-4 bg-white rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition-all duration-300">
                  Explore Models
                </div>
              </Link>
              
              <Link href="/auth/register" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300">
                Join Community
              </Link>
              
              <Link href="/discussions" className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300">
                Browse Discussions
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-3xl font-bold text-blue-600 mb-2">{communityStats.totalModels.toLocaleString()}</div>
                <div className="text-sm text-gray-600">AI Models</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-3xl font-bold text-purple-600 mb-2">{communityStats.totalReviews.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-3xl font-bold text-green-600 mb-2">{communityStats.activeReviewers}</div>
                <div className="text-sm text-gray-600">Active Reviewers</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-3xl font-bold text-orange-600 mb-2">{communityStats.onlineUsers}</div>
                <div className="text-sm text-gray-600">Online Now</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Featured Models */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">🔥 Trending Models</h2>
                    <p className="text-gray-600">Most discussed and reviewed this week</p>
                  </div>
                  <Link href="/models" className="group flex items-center text-blue-600 hover:text-blue-800 font-medium">
                    View all
                    <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
                
                <Suspense fallback={<LoadingSpinner text="Loading trending models..." />}>
                  <ModelGrid models={models.results || []} />
                </Suspense>
              </section>

              {/* Popular Categories */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">📂 Popular Categories</h2>
                    <p className="text-gray-600">Explore models by category</p>
                  </div>
                  <Link href="/categories" className="group flex items-center text-blue-600 hover:text-blue-800 font-medium">
                    View all
                    <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(categories.results || []).map((category, index) => (
                    <Link key={category.id} href={`/categories/${category.slug}`} className="group">
                      <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 group-hover:scale-105">
                        <div className="flex items-center mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            index % 4 === 0 ? 'bg-blue-500' : 
                            index % 4 === 1 ? 'bg-purple-500' : 
                            index % 4 === 2 ? 'bg-green-500' : 'bg-orange-500'
                          }`}>
                            {category.name.charAt(0)}
                          </div>
                          <h3 className="font-semibold text-lg ml-3 group-hover:text-blue-600 transition-colors">{category.name}</h3>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* User Authentication */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Join the Community</h3>
                  <p className="text-gray-600 mb-4">Get personalized recommendations and contribute to discussions</p>
                  <div className="space-y-3">
                    <Link href="/auth/login" className="block w-full text-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Sign In
                    </Link>
                    <Link href="/auth/register" className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all">
                      Sign Up
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white shadow-lg">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    Live Activity
                  </h3>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {activity.user.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.target}</span>
                          </p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        {activity.rating && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < activity.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Link href="/activity" className="block text-center mt-4 text-blue-600 hover:text-blue-800 font-medium">
                    View all activity
                  </Link>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white shadow-lg">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/models/submit" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Submit Model</p>
                        <p className="text-sm text-gray-600">Add a new AI model</p>
                      </div>
                    </Link>
                    
                    <Link href="/discussions/new" className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Start Discussion</p>
                        <p className="text-sm text-gray-600">Share your thoughts</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}