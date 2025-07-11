'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import  {useAuth}  from '@/lib/hooks/useAuth';
import DiscussionForm from '@/app/_components/forms/DiscussionForm';
import AuthGuard from '@/app/_components/auth/AuthGuard';
import Card from '@/app/_components/ui/Card';
import api from '@/lib/api';
import Link from 'next/link';

export default function CreateDiscussionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedModel, setSelectedModel] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const modelId = searchParams.get('model');
    if (modelId) {
      fetchModel(modelId);
    }
  }, [searchParams]);

  const fetchModel = async (modelId) => {
    try {
      const response = await api.get(`/models/${modelId}/`);
      setSelectedModel(response.data);
    } catch (error) {
      console.error('Failed to fetch model:', error);
    }
  };

  const handleSubmit = async (discussionData) => {
    setSubmitting(true);
    
    try {
      const response = await api.post('/discussions/', discussionData);
      router.push(`/discussions/${response.data.id}`);
    } catch (error) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Failed to create discussion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/discussions" className="hover:text-gray-900">Discussions</Link>
            <span>/</span>
            <span className="text-gray-900">Create Discussion</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start a New Discussion
          </h1>
          <p className="text-gray-600">
            Share your thoughts and get insights from the community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <DiscussionForm
                selectedModel={selectedModel}
                onSubmit={handleSubmit}
                submitting={submitting}
              />
            </Card>
          </div>

          <div className="space-y-6">
            {selectedModel && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">
                  Discussion about {selectedModel.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    This discussion will be associated with {selectedModel.name}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium">{selectedModel.name}</div>
                    <div className="text-gray-600">{selectedModel.category.name}</div>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <h3 className="text-lg font-semibold mb-4">Discussion Guidelines</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Be respectful and constructive</li>
                <li>• Stay on topic and relevant</li>
                <li>• Provide helpful and accurate information</li>
                <li>• Use clear and descriptive titles</li>
                <li>• Search existing discussions before posting</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
