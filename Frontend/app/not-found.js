import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="btn btn-primary btn-md inline-flex items-center"
        >
          <HomeIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}