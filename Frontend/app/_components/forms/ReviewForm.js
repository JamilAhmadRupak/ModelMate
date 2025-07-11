'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApiMutation } from '@/lib/hooks/useApi';
import { toast } from 'react-hot-toast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Rating from '../ui/Rating';

const ReviewForm = ({ modelId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pros: '',
    cons: '',
    accuracy_rating: 5,
    speed_rating: 5,
    cost_efficiency_rating: 5,
    ease_of_use_rating: 5,
    reliability_rating: 5,
  });
  const [errors, setErrors] = useState({});
  const { mutate, loading } = useApiMutation();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleRatingChange = (field, rating) => {
    setFormData(prev => ({
      ...prev,
      [field]: rating,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await mutate('post', `/models/${modelId}/reviews/`, formData);

      if (result.success) {
        toast.success('Review submitted successfully!');
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/models/${modelId}`);
        }
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  const ratingFields = [
    { key: 'accuracy_rating', label: 'Accuracy' },
    { key: 'speed_rating', label: 'Speed' },
    { key: 'cost_efficiency_rating', label: 'Cost Efficiency' },
    { key: 'ease_of_use_rating', label: 'Ease of Use' },
    { key: 'reliability_rating', label: 'Reliability' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Review Title"
        name="title"
        type="text"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Summarize your experience"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="Share your detailed experience with this model..."
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pros
        </label>
        <textarea
          name="pros"
          value={formData.pros}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="What did you like about this model?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cons
        </label>
        <textarea
          name="cons"
          value={formData.cons}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
          placeholder="What could be improved?"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Rate the Model</h3>
        {ratingFields.map((field) => (
          <div key={field.key} className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <Rating
              rating={formData[field.key]}
              interactive={true}
              onChange={(rating) => handleRatingChange(field.key, rating)}
            />
          </div>
        ))}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
      >
        Submit Review
      </Button>
    </form>
  );
};

export default ReviewForm;