'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SortOptions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('ordering') || 'newest';

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
    { value: 'name', label: 'Name (A-Z)' }
  ];

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams);
    
    if (value === 'newest') {
      params.delete('ordering');
    } else {
      params.set('ordering', value);
    }
    
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm text-gray-600">Sort by:</label>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
