'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-gray-600 mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => reset()}
          className="btn btn-primary btn-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
}