'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthGuard from '@/app/_components/auth/AuthGuard';
import Card from '@/app/_components/ui/Card';
import Badge from '@/app/_components/ui/Badge';
import Button from '@/app/_components/ui/Button';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import ReviewList from '@/app/_components/review/ReviewList';
import DiscussionList from '@/app/_components/discussion/DiscussionList';
import Link from 'next/link';
import api from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      const userData = await getCurrentUser();
      if (userData && userData.username) {
        setUser(userData);
        return userData;
      } else {
        setError('Failed to get user data');
        return null;
      }
    } catch (err) {
      setError('Failed to load user data');
      return null;
    }
  }, []);

  const fetchProfileData = useCallback(async (userData) => {
    if (!userData || !userData.username) return;
    
    try {
      // First fetch the profile data
      const profileRes = await api.get(`/users/${userData.username}/`);
      setProfile(profileRes.data);
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadUserAndProfile = async () => {
      const userData = await fetchUserData();
      if (userData) {
        await fetchProfileData(userData);
      } else {
        setLoading(false);
      }
    };
    
    loadUserAndProfile();
  }, [fetchUserData, fetchProfileData]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading profile..." />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Profile
              </h1>
              <p className="text-gray-600">
                Manage your account and view your activity
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/profile/settings">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {profile?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {profile?.username}
                    </h3>
                    <p className="text-gray-600">
                      Member since {new Date(profile?.date_joined).toLocaleDateString()}
                    </p>
                    {profile?.bio && (
                      <p className="text-gray-700 mt-2">{profile.bio}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile?.reviews_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile?.discussions_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">Discussions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile?.helpful_votes_received || 0}
                    </div>
                    <div className="text-sm text-gray-600">Helpful Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {profile?.reputation || 0}
                    </div>
                    <div className="text-sm text-gray-600">Reputation</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Removed Recent Reviews and Recent Discussions cards since endpoints are not supported */}
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/profile/settings">
                  <Button variant="outline" className="w-full justify-start">
                     Settings
                  </Button>
                </Link>
              </div>
            </Card>

            {profile?.favorite_categories && profile.favorite_categories.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Favorite Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_categories.map((category) => (
                    <Badge key={category.id} variant="primary" size="sm">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
