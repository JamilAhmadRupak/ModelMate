'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import ReviewForm from '@/app/_components/forms/ReviewForm';
import AuthGuard from '@/app/_components/auth/AuthGuard';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import Card from '@/app/_components/ui/Card';
import api from '@/lib/api';
import Link from 'next/link';

export default function WriteReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchModel = useCallback(async () => {
    try {
      const response = await api.get(`/models/${id}/`);
      setModel(response.data);
    } catch (err) {
      setError('Failed to fetch model details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const handleSubmitReview = async (reviewData) => {
    setSubmitting(true);
    
    try {
      await api.post(`/models/${id}/reviews/`, reviewData);
      router.push(`/models/${id}/reviews`);
    } catch (err) {
      if (err.response?.data?.detail) {
        throw new Error(err.response.data.detail);
      }
      throw new Error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading model..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/models" className="hover:text-gray-900">Models</Link>
            <span>/</span>
            <Link href={`/models/${model.id}`} className="hover:text-gray-900">{model.name}</Link>
            <span>/</span>
            <span className="text-gray-900">Write Review</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Write a Review for {model.name}
          </h1>
          <p className="text-gray-600">
            Share your experience with {model.name} to help others make informed decisions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <ReviewForm 
                model={model}
                onSubmit={handleSubmitReview}
                submitting={submitting}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">About {model.name}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600">{model.category.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Version:</span>
                  <span className="ml-2 text-gray-600">{model.version}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">License:</span>
                  <span className="ml-2 text-gray-600">{model.license}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Current Rating:</span>
                  <span className="ml-2 text-gray-600">{model.average_rating?.toFixed(1) || 'N/A'} ⭐</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4">Review Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Be honest and constructive in your feedback</li>
                <li>• Include specific examples when possible</li>
                <li>• Rate different aspects of the model fairly</li>
                <li>• Mention your use case and requirements</li>
                <li>• Be respectful to the model creators</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
