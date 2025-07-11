'use client';

import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import api from '@/lib/api';

export default function DiscussionForm({ selectedModel, onSubmit, submitting = false }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    model: selectedModel?.id || ''
  });
  const [models, setModels] = useState([]);
  const [errors, setErrors] = useState({});
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    fetchModels();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      setFormData(prev => ({ ...prev, model: selectedModel.id }));
    }
  }, [selectedModel]);

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const response = await api.get('/models/?limit=100');
      setModels(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    }
    if (formData.content.length < 20) {
      newErrors.content = 'Content must be at least 20 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        ...(formData.model && { model: parseInt(formData.model) })
      };

      await onSubmit(submitData);
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <Input
        label="Discussion Title"
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        placeholder="Enter a descriptive title for your discussion..."
        required
        disabled={submitting}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Related Model (Optional)
        </label>
        <select
          value={formData.model}
          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          disabled={submitting || loadingModels}
        >
          <option value="">Select a model (optional)</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} - {model.category.name}
            </option>
          ))}
        </select>
        {loadingModels && (
          <p className="text-sm text-gray-500 mt-1">Loading models...</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Discussion Content
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={8}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
            errors.content ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Share your thoughts, questions, or insights about AI models..."
          required
          disabled={submitting}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.content.length}/1000 characters
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormData({ title: '', content: '', model: selectedModel?.id || '' })}
          disabled={submitting}
        >
          Clear
        </Button>
        <Button
          type="submit"
          loading={submitting}
          disabled={submitting}
        >
          {submitting ? 'Creating Discussion...' : 'Create Discussion'}
        </Button>
      </div>
    </form>
  );
}
