'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AuthStatus({ children, fallback = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!user && fallback) {
    return fallback;
  }

  return children;
}
