'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function FilterPanel({ categories = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const selectedCategory = searchParams.get('category');
  const selectedLicense = searchParams.get('license');

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    const search = searchParams.get('search');
    if (search) params.set('search', search);
    
    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters = selectedCategory || selectedLicense;

  // Fix: support both array and object with results
  const categoryList = Array.isArray(categories) ? categories : (categories?.results || []);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="category"
                checked={!selectedCategory}
                onChange={() => handleFilterChange('category', '')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">All Categories</span>
            </label>
            {categoryList.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={selectedCategory === category.id.toString()}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">License</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="license"
                checked={!selectedLicense}
                onChange={() => handleFilterChange('license', '')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">All Licenses</span>
            </label>
            {['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'Custom'].map((license) => (
              <label key={license} className="flex items-center">
                <input
                  type="radio"
                  name="license"
                  value={license}
                  checked={selectedLicense === license}
                  onChange={(e) => handleFilterChange('license', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">{license}</span>
              </label>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <Badge variant="primary" size="sm">
                  Category: {categoryList.find(c => c.id.toString() === selectedCategory)?.name}
                </Badge>
              )}
              {selectedLicense && (
                <Badge variant="primary" size="sm">
                  License: {selectedLicense}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
