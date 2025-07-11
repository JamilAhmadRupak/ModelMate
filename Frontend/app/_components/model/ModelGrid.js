'use client';

import ModelCard from './ModelCard';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function ModelGrid({ models, loading, error }) {
  const modelList = Array.isArray(models) ? models : (models?.results || []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading amazing models...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-8 max-w-md mx-auto shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!modelList || modelList.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-8 max-w-md mx-auto shadow-lg">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No models found</h3>
          <p className="text-gray-600 mb-4">We couldn't find any models matching your criteria.</p>
          <button 
            onClick={() => window.location.href = '/models'} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Browse All Models
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modelList.map((model, index) => (
          <div
            key={model.id}
            className="opacity-0 animate-fade-in"
            style={{
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'both'
            }}
          >
            <ModelCard model={model} />
          </div>
        ))}
      </div>
      
      {/* Load More Button */}
      {modelList.length >= 6 && (
        <div className="text-center pt-8">
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl">
            Load More Models
          </button>
        </div>
      )}
    </div>
  );
}