'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthGuard from '@/app/_components/auth/AuthGuard';
import Card from '@/app/_components/ui/Card';
import Button from '@/app/_components/ui/Button';
import Input from '@/app/_components/ui/Input';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import api from '@/lib/api';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    github_username: '',
    twitter_username: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get(`/users/${user.username}/`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(false);

    try {
      await api.patch(`/users/${user.username}/`, profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors(error.response?.data || { general: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Update your profile information and preferences</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-600">Profile updated successfully!</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Username"
                type="text"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                error={errors.username}
                disabled={saving}
              />

              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                error={errors.email}
                disabled={saving}
              />

              <Input
                label="Location"
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                error={errors.location}
                disabled={saving}
                placeholder="City, Country"
              />

              <Input
                label="Website"
                type="url"
                value={profile.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                error={errors.website}
                disabled={saving}
                placeholder="https://yourwebsite.com"
              />

              <Input
                label="GitHub Username"
                type="text"
                value={profile.github_username || ''}
                onChange={(e) => setProfile({ ...profile, github_username: e.target.value })}
                error={errors.github_username}
                disabled={saving}
              />

              <Input
                label="Twitter Username"
                type="text"
                value={profile.twitter_username || ''}
                onChange={(e) => setProfile({ ...profile, twitter_username: e.target.value })}
                error={errors.twitter_username}
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself..."
                disabled={saving}
              />
              {errors.bio && (
                <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fetchProfile()}
                disabled={saving}
              >
                Reset
              </Button>
              <Button
                type="submit"
                loading={saving}
                disabled={saving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AuthGuard>
  );
}
