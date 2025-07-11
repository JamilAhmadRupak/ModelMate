import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Button from '@/app/_components/ui/Button';
import Card from '@/app/_components/ui/Card';
import Badge from '@/app/_components/ui/Badge';
import LoadingSpinner from '@/app/_components/ui/LoadingSpinner';
import DiscussionCommentsClient from '@/app/_components/discussion/DiscussionCommentsClient';

async function getDiscussion(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/discussions/${id}/`, {
    cache: 'no-store'
  });
  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error('Failed to fetch discussion');
  }
  return res.json();
}

async function getDiscussionComments(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/discussions/${id}/comments/`, {
    cache: 'no-store'
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function DiscussionDetailPage({ params }) {
  const { id } = await params;
  try {
    const [discussion, comments] = await Promise.all([
      getDiscussion(id),
      getDiscussionComments(id)
    ]);

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link href="/discussions" className="hover:text-gray-900">Discussions</Link>
            <span>/</span>
            <span className="text-gray-900">{discussion.title}</span>
          </nav>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {discussion.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>By {discussion.user.username}</span>
                <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                <Badge variant="info" size="sm">
                  {discussion.views} views
                </Badge>
                <Badge variant="success" size="sm">
                  {discussion.likes} likes
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {discussion.content}
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm">
                      👍 Like ({discussion.likes})
                    </Button>
                    <Button variant="outline" size="sm">
                      🔗 Share
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {discussion.comment_count} replies
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-6">
                Comments ({comments.length})
              </h2>
              <Suspense fallback={<LoadingSpinner text="Loading comments..." />}>
                <DiscussionCommentsClient
                  initialComments={comments}
                  discussionId={discussion.id}
                />
              </Suspense>
            </Card>
          </div>

          <div className="space-y-6">
            {discussion.model && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Related Model</h3>
                <Link href={`/models/${discussion.model.id}`}>
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <h4 className="font-medium text-gray-900">
                      {discussion.model.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {discussion.model.category.name}
                    </p>
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-gray-600">
                        {discussion.model.average_rating?.toFixed(1) || 'N/A'} ⭐
                      </span>
                      <span className="ml-2 text-gray-500">
                        ({discussion.model.review_count} reviews)
                      </span>
                    </div>
                  </div>
                </Link>
              </Card>
            )}

            <Card>
              <h3 className="text-lg font-semibold mb-4">About the Author</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {discussion.user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {discussion.user.username}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Member since {new Date(discussion.user.date_joined).getFullYear()}
                    </p>
                  </div>
                </div>
                {discussion.user.bio && (
                  <p className="text-sm text-gray-600">
                    {discussion.user.bio}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Discussion</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
}
