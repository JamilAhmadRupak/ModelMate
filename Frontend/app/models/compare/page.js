'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ModelCompare from '@/app/_components/model/ModelCompare';
import SearchBar from '@/app/_components/common/SearchBar';
import Card from '@/app/_components/ui/Card';
import Button from '@/app/_components/ui/Button';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import api from '@/lib/api';

export default function ModelComparePage() {
  const searchParams = useSearchParams();
  const [selectedModels, setSelectedModels] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const modelIds = searchParams.get('models')?.split(',').filter(Boolean) || [];
    if (modelIds.length > 0) {
      fetchModels(modelIds);
    }
  }, [searchParams]);

  const fetchModels = async (modelIds) => {
    setLoading(true);
    setError(null);
    
    try {
      const promises = modelIds.map(id => api.get(`/models/${id}/`));
      const results = await Promise.all(promises);
      setSelectedModels(results.map(res => res.data));
    } catch (err) {
      setError('Failed to fetch models for comparison');
    } finally {
      setLoading(false);
    }
  };

  const searchModels = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await api.get(`/models/?search=${encodeURIComponent(query)}&limit=10`);
      setSearchResults(response.data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const addModel = (model) => {
    if (selectedModels.length >= 4) {
      alert('You can compare up to 4 models at once');
      return;
    }
    
    if (selectedModels.find(m => m.id === model.id)) {
      alert('This model is already selected');
      return;
    }

    setSelectedModels([...selectedModels, model]);
    setSearchResults([]);
  };

  const removeModel = (modelId) => {
    setSelectedModels(selectedModels.filter(m => m.id !== modelId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading models..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare AI Models</h1>
        <p className="text-gray-600">
          Compare up to 4 AI models side by side to find the best fit for your needs
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-8">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Add Models to Compare</h2>
          <div className="relative">
            <SearchBar 
              placeholder="Search for models to compare..."
              onSearch={searchModels}
            />
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto">
                {searchResults.map(model => (
                  <div 
                    key={model.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => addModel(model)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{model.name}</h3>
                        <p className="text-sm text-gray-600">{model.category.name}</p>
                      </div>
                      <Button size="sm" variant="outline">Add</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {selectedModels.length > 0 ? (
        <ModelCompare models={selectedModels} onRemoveModel={removeModel} />
      ) : (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No models selected for comparison
            </h2>
            <p className="text-gray-600">
              Search and add models above to start comparing them
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
